import AdmZip from 'adm-zip'
import path from 'path'
import { fetch } from '../utils/fetch'

export const safeDownload = async (url: string, binary = false) => {
  try {
    const resp = await fetch(url)
    const body = binary ? await resp.buffer() : await resp.json()

    return { error: undefined, body }
  } catch (err) {
    return { error: err, body: null }
  }
}

interface IExtractOptions {
  filter: string[]
  filterType: 'whitelist' | 'blacklist'
}

interface IExtracted {
  path: string
  data: Buffer
}

export const extractZip = async (
  blob: Buffer,
  installDir: string,
  options?: IExtractOptions
) => {
  const defaultOptions: IExtractOptions = {
    filter: [],
    filterType: 'blacklist',
  }

  const opts = Object.assign(defaultOptions, options)
  const zip = new AdmZip(blob)

  const entries: Array<Promise<IExtracted | null>> = zip.getEntries().map(
    entry =>
      new Promise(resolve => {
        if (entry.isDirectory) return resolve(null)

        // Filter out files that try to break out of the install dir
        const fullPath = path.join(installDir, entry.entryName)
        if (!fullPath.startsWith(installDir)) return resolve(null)

        // Implement filter blacklist/whitelist
        if (opts.filter) {
          const type = opts.filterType || 'whitelist'
          const { ext } = path.parse(entry.entryName)

          const allowed =
            type === 'whitelist'
              ? opts.filter.includes(ext)
              : !opts.filter.includes(ext)

          if (!allowed) return resolve(null)
        }

        return entry.getDataAsync(d =>
          resolve({ path: path.join(installDir, entry.entryName), data: d })
        )
      })
  )

  const data = await Promise.all(entries)
  const filtered = data.filter(x => x !== null) as IExtracted[]
  return filtered
}
