import log from 'electron-log'
import { inspect } from 'util'
import { API_URL, BLOCKED_EXTENSIONS } from '../constants'
import { IGameVersion, IMod } from '../models/modsaber'
import { fetch } from '../utils/fetch'
import { calculateHash } from '../utils/helpers'
import { extractZip, safeDownload } from './remote'

export type ModListType = 'latest' | 'all' | 'newest-by-gameversion'
export type ModPlatform = 'oculus' | 'steam'

export const fetchMods = async (options: ModListType, series = false) => {
  const type = options || 'latest'

  const pageResp = await fetch(`${API_URL}/mods/approved/${type}`)
  const { lastPage } = await pageResp.json()
  const pages = Array.from(new Array(lastPage + 1)).map((_, i) => i)

  const fetchPage = async (page: number) => {
    const modResp = await fetch(`${API_URL}/mods/approved/${type}/${page}`)
    const { mods }: { mods: IMod[] } = await modResp.json()

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

    return ([] as IMod[]).concat(...results)
  } else {
    // Run in parallel
    log.debug('Loading mods in parallel...')

    const results = await Promise.all(pages.map(fetchPage))
    return ([] as IMod[]).concat(...results)
  }
}

export const fetchModsSafer = async (options: ModListType) => {
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

export const fetchGameVersions = async () => {
  const resp = await fetch(`${API_URL}/site/gameversions`)
  const body = await resp.json()

  return body as IGameVersion[]
}

export class DownloadError extends Error {
  public readonly mod: IMod

  constructor(message: string, mod: IMod) {
    super(message)
    this.mod = mod
  }
}

export const downloadMod = async (
  mod: IMod,
  platform: ModPlatform,
  installDir: string
) => {
  const files =
    platform === 'steam' || mod.files.oculus === undefined
      ? mod.files.steam
      : mod.files.oculus

  // Download
  const resp = await safeDownload(files.url, true)
  if (resp.error) {
    log.error(resp.error)
    throw new DownloadError('Network Failure', mod)
  }

  // Calculate Hash
  const hash = await calculateHash(resp.body)
  if (hash !== files.hash) {
    throw new DownloadError('Download Hash Mismatch', mod)
  }

  // Extract
  try {
    const extracted = await extractZip(resp.body, installDir, {
      filter: BLOCKED_EXTENSIONS,
      filterType: 'blacklist',
    })

    return extracted
  } catch (err) {
    log.error(err)
    throw new DownloadError('Extraction Failure', mod)
  }
}

export const fetchByHash = async (hash: string, path?: string) => {
  const params: RequestInit = {}

  // Set path if given
  if (path) {
    const body = new URLSearchParams()
    body.set('path', path)

    params.body = body
    params.method = 'POST'
  }

  const resp = await fetch(`${API_URL}/mods/by-hash/${hash}`, params)
  const mod: IMod[] = await resp.json()
  return mod
}
