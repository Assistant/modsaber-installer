const rootCA = require('ssl-root-cas/latest') // tslint:disable-line no-var-requires

export const getCerts = (): string | Buffer | Array<string | Buffer> =>
  rootCA.create()

export const loadCerts = () => {
  getCerts()
}
