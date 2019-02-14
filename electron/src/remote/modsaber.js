const { inspect } = require('util')
const log = require('electron-log')
const fetch = require('../utils/fetch.js')
const { extractZip, safeDownload } = require('./remote.js')
const { calculateHash } = require('../utils/helpers.js')
const { API_URL, BLOCKED_EXTENSIONS } = require('../constants.js')

/**
 * @typedef {Object} Files
 * @property {string} url
 * @property {string} hash
 * @property {any} files
 */

/**
 * @typedef {Object} Mod
 * @property {string} name
 * @property {string} version
 * @property {Object} files
 * @property {Files} files.steam
 * @property {Files} files.oculus
 * @property {Object} approval
 * @property {('pending'|'approved'|'denied')} approval.status
 * @property {string} approval.modified
 * @property {Object} gameVersion
 * @property {string} gameVersion.value
 * @property {string} gameVersion.manifest
 */

/**
 * @param {('latest'|'all'|'newest-by-gameversion')} options Mod Fetch Options
 * @param {boolean} [series] Run in series, defaults to `false`
 * @returns {Promise.<Mod[]>}
 */
const fetchMods = async (options, series = false) => {
  const type = options || 'latest'

  const pageResp = await fetch(`${API_URL}/mods/approved/${type}`)
  const { lastPage } = await pageResp.json()
  const pages = Array.from(new Array(lastPage + 1)).map((_, i) => i)

  /**
   * @param {number} page Page Number
   * @returns {Promise.<Mod[]>}
   */
  const fetchPage = async page => {
    const modResp = await fetch(`${API_URL}/mods/approved/${type}/${page}`)
    const { mods } = await modResp.json()

    return mods
  }

  if (series) {
    // Run in series
    log.debug('Loading mods in series...')

    const results = []
    for (const page of pages) {
      const resp = await fetchPage(page) // eslint-disable-line
      results.push(resp)
    }

    return [].concat(...results)
  } else {
    // Run in parallel
    log.debug('Loading mods in parallel...')

    const results = await Promise.all(pages.map(fetchPage))
    return [].concat(...results)
  }
}

/**
 * @param {('latest'|'all'|'newest-by-gameversion')} options Mod Fetch Options
 * @returns {Promise.<Mod[]>}
 */
const fetchModsSafer = async options => {
  try {
    const mods = await fetchMods(options)
    return mods
  } catch (err) {
    if (err.type === 'fetch') {
      log.error(`${err.message} - ${err.url}`)
      err.message = 'Could not connect to ModSaber!'

      throw err
    }

    log.debug('fetchModsSafer() Error', inspect(err), JSON.stringify(err))
    if (err.code !== 'ETIMEDOUT') throw err

    const mods = await fetchMods(options, true)
    return mods
  }
}

/**
 * @returns {Promise.<{ id: string, value: string, manifest: string, selected: boolean }[]>}
 */
const fetchGameVersions = async () => {
  const resp = await fetch(`${API_URL}/site/gameversions`)
  const body = await resp.json()

  return body
}

class DownloadError extends Error {
  /**
   * @param {string} message Error Message
   * @param {Mod} mod Mod
   */
  constructor (message, mod) {
    super(message)
    this.mod = mod
  }
}

/**
 * @param {Mod} mod Mod Data
 * @param {('steam'|'oculus')} platform Install Platform
 * @param {string} installDir Install Directory
 * @returns {Promise.<{ path: string, data: Buffer }[]>}
 */
const downloadMod = async (mod, platform, installDir) => {
  const files = platform === 'steam' || mod.files.oculus === undefined ?
    mod.files.steam :
    mod.files.oculus

  // Download
  const resp = await safeDownload(files.url, true)
  if (resp.error) {
    log.error(resp.error)
    throw new DownloadError('Network Failure', mod)
  }

  // Calculate Hash
  const hash = await calculateHash(resp.body)
  if (hash !== files.hash) throw new DownloadError('Download Hash Mismatch', mod)

  // Extract
  try {
    const extracted = await extractZip(resp.body, installDir, { filter: BLOCKED_EXTENSIONS, filterType: 'blacklist' })
    return extracted
  } catch (err) {
    log.error(err)
    throw new DownloadError('Extraction Failure', mod)
  }
}

/**
 * @param {string} hash Hash Search String
 * @param {string} [path] Optional Path
 * @returns {Promise.<Mod[]>}
 */
const fetchByHash = async (hash, path) => {
  const params = {}

  // Set path if given
  if (path) {
    const body = new URLSearchParams()
    body.set('path', path)

    params.body = body
    params.method = 'POST'
  }

  const resp = await fetch(`${API_URL}/mods/by-hash/${hash}`, params)
  return resp.json()
}

module.exports = { fetchMods, fetchModsSafer, fetchGameVersions, downloadMod, fetchByHash }
