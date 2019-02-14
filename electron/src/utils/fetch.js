const certs = require('ssl-root-cas/latest').create()
const { default: fetch } = require('node-fetch')
const https = require('https')
const { USER_AGENT } = require('../constants.js')
const agent = new https.Agent({
  keepAlive: true,
  ca: certs,
})

/**
 * @typedef {import('node-fetch').Response} FetchResponse
 */

/**
 * Node Fetch but Better
 * @param {string|Request} url Remote URL
 * @param {RequestInit} [init] Fetch Options
 * @returns {Promise.<FetchResponse>}
 */
const betterFetch = async (url, init) => {
  /**
   * @type {RequestInit}
   */
  const options = {
    agent,
    headers: { 'User-Agent': USER_AGENT },
  }

  const resp = await fetch(url, Object.assign(options, init))
  if (!resp.ok) {
    const err = new Error(`${resp.status} ${resp.statusText}`.trim())
    Object.apply(err, resp)

    err.code = resp.status
    err.type = 'fetch'
    err.url = resp.url

    throw err
  } else {
    return resp
  }
}

module.exports = betterFetch
