import log from 'electron-log'
const rootCA = require('ssl-root-cas') // tslint:disable-line no-var-requires

export const getCerts = (): string | Buffer | Array<string | Buffer> =>
  rootCA.create()

export const loadCerts = async () => {
  getCerts()
  log.debug('Root Certificates Loaded!')

  return undefined
}
