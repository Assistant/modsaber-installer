import https from 'https'
import fetch, { Response } from 'node-fetch'
import { USER_AGENT } from '../constants'

const certs = require('ssl-root-cas/latest').create() // tslint:disable-line no-var-requires
const agent = new https.Agent({
  ca: certs,
  keepAlive: true,
})

export class FetchError extends Error {
  public readonly code: number
  public readonly type: 'fetch' = 'fetch'
  public readonly url: string

  constructor(resp: Response) {
    super(`${resp.status} ${resp.statusText}`.trim())

    this.code = resp.status
    this.url = resp.url

    Object.assign(this, resp)
  }
}

/**
 * Node Fetch but Better
 */
const betterFetch = async (url: string, init?: RequestInit) => {
  const options = {
    agent,
    headers: { 'User-Agent': USER_AGENT },
  }

  const resp = await fetch(url, Object.assign(options, init))
  if (!resp.ok) {
    throw new FetchError(resp)
  } else {
    return resp
  }
}

export { betterFetch as fetch }
