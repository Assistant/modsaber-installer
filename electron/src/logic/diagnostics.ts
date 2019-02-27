import path from 'path'
import treeify from 'treeify'
import { fetchByHash } from '../remote/modsaber'
import fse from '../utils/file'
import { calculateHash } from '../utils/helpers'
import { isPatched } from '../utils/process'

const renderTree = (root: string, tree: any) => {
  const HASH_LEN = 40

  const lines: string[] = []
  treeify.asLines(tree, true, true, line => lines.push(line))

  const withHashes = lines
    .map(line => {
      const [value, hash] = line.split(': ')
      if (!hash) return { value, hash: '' }
      else return { value, hash }
    })
    .map(({ value, hash }) => `${hash.padEnd(HASH_LEN)} ${value}`)

  return [`${' '.repeat(HASH_LEN + 1)}${root}`, ...withHashes].join('\n')
}

const getVersion = async (dir: string) => {
  const txtPath = path.join(dir, 'BeatSaberVersion.txt')

  const exists = await fse.exists(txtPath)
  if (!exists) return 'Version Missing'

  const data = await fse.readFile(txtPath, 'utf8')
  return data
}

const normaliseDir = (dir: string) => `${dir.replace(/\\/g, '/')}/`

interface IGetFilesOptions {
  recursive?: boolean
  filter?: string[]
  hashes?: boolean
}

const getFiles = async (
  dir: string,
  install: string,
  options?: IGetFilesOptions
) => {
  const defaultOptions: IGetFilesOptions = {
    hashes: true,
    recursive: true,
  }

  const opts = Object.assign(defaultOptions, options)

  const normalisedDir = normaliseDir(dir)
  const normalisedBase = normaliseDir(install)
  const globPath = opts.recursive
    ? path.join(dir, '**', '*.*')
    : path.join(dir, '*.*')
  const files: string[] = await fse.glob(globPath)

  const allMods: Set<string> = new Set()

  const mapped: Array<IFileResolvable | undefined> = await Promise.all(
    files.map(async file => {
      const isFile = await fse.isFile(file)
      if (!isFile) return undefined

      const { base } = path.parse(file)
      if (opts.filter !== undefined && !opts.filter.includes(base)) {
        return undefined
      }

      const data = await fse.readFile(file)
      const hash: string | null = opts.hashes ? await calculateHash(data) : null

      const normalised = file.replace(normalisedDir, '')
      if (hash === null) return { file: normalised, hash, modInfo: undefined }

      const filePath = file.replace(normalisedBase, '')
      const mods = await fetchByHash(hash, filePath)
      if (mods.length === 0) {
        return { file: normalised, hash, modInfo: undefined }
      }
      const [mod] = mods

      const flags = []
      if (mods.length > 1) flags.push('Multiple')
      if (mod.approval.status === 'approved') flags.push('Approved')
      else if (mod.approval.status === 'pending') flags.push('Pending Approval')
      else flags.push('Not Approved')
      flags.push(mod.gameVersion.value)

      const modDetails = `${mod.name}@${mod.version}`
      const modInfo = `${modDetails} // ${flags.join(', ')}`
      allMods.add(modDetails)

      return { file: normalised, hash, modInfo }
    })
  )

  const filtered = mapped.filter(x => x !== undefined) as IFileResolvable[]
  const tree = resolveFiles(filtered)
  return { tree, mods: [...allMods.values()] }
}

interface IFileResolvable {
  file: string
  hash: string | null
  modInfo?: string
}

const resolveFiles = (arr: IFileResolvable[]) => {
  const final: any = {}
  for (const { file, hash, modInfo } of arr) {
    const fileParts = file.split('/')
    let prev = final

    for (const idx in fileParts) {
      if (!(idx in fileParts)) continue

      const i = parseInt(idx, 10)
      const part = fileParts[i]
      const last = i === fileParts.length - 1

      if (last) {
        const append = modInfo ? ` (${modInfo})` : ''
        const key = `${part}${append}`

        prev[key] = hash
        break
      }

      if (prev[part] === undefined) prev[part] = {}
      prev = prev[part]
    }
  }

  return final
}

interface ILogFile {
  name: string
  body: string
}

/**
 * @param {string} dir Directory to scan
 * @returns {Promise.<{ appData: LogFile[], root: LogFile[] }>}
 */
const getLogFiles = async (
  dir: string
): Promise<{ appData: ILogFile[]; root: ILogFile[] }> => {
  const blacklist = [
    'Steamworks.NET.txt',
    'BeatSaberVersion.txt',
    'CustomMenuText.txt',
    'CustomFailText.txt',
    'CustomMenuText-default-2.1.1.txt',
    'dummy.txt',
    'songStatus.txt',
    'songStatusTemplate.txt',
    'MapperFeedHistory.txt',
  ]

  const paths: string[] = await fse.glob(path.join(dir, '**', '*.{txt,log}'))
  const logFiles = paths.filter(file => {
    if (file.includes('CustomSongs')) return false

    const { base } = path.parse(file)
    if (blacklist.includes(base)) return false

    return true
  })

  const appDataPath = path.resolve(
    `${process.env.APPDATA}\\..\\LocalLow\\Hyperbolic Magnetism\\Beat Saber`
  )
  const appDataFiles = await fse.glob(
    path.join(appDataPath, '{output_log.txt,settings.cfg}')
  )

  const readAll = (files: string[], baseDir: string): Promise<ILogFile[]> =>
    Promise.all(
      files.map(async file => {
        const body = await fse.readFile(file, 'utf8')

        const normalisedDir = normaliseDir(baseDir)
        const name = file.replace(normalisedDir, '')

        return {
          body:
            body.length > 100000
              ? 'File is greater than 100,000 characters!\nPlease check manually.'
              : body,
          name,
        }
      })
    )

  const [root, appData] = await Promise.all([
    readAll(logFiles, dir),
    readAll(appDataFiles, appDataPath),
  ])

  return { appData, root }
}

export const generate = async (dir: string) => {
  const version = await getVersion(dir)
  const patched = await isPatched(
    path.join(dir, 'Beat Saber_Data', 'Managed', 'UnityEngine.CoreModule.dll')
  )

  const suffix = patched ? 'PATCHED' : 'UNPATCHED'
  const rootTitle = `${version} [${suffix}]`

  const managedFilter = [
    '0Harmony.dll',
    'Assembly-CSharp.dll',
    'Assembly-CSharp-firstpass.dll',
    'Newtonsoft.Json.dll',
    'System.Runtime.Serialization.dll',
  ]

  const [
    { tree: Plugins, mods: pluginsMods },
    { tree: DataManaged, mods: dataManagedMods },
    { tree: DataPlugins, mods: dataPluginsMods },
    { tree: CustomAvatars, mods: customAvatarsMods },
    { tree: CustomPlatforms, mods: customPlatformsMods },
    { tree: CustomSabers, mods: customSabersMods },
    { tree: rootFiles, mods: rootFilesMods },
    logFiles,
  ] = await Promise.all([
    getFiles(path.join(dir, 'Plugins'), dir),
    getFiles(path.join(dir, 'Beat Saber_Data', 'Managed'), dir, {
      filter: managedFilter,
    }),
    getFiles(path.join(dir, 'Beat Saber_Data', 'Plugins'), dir),
    getFiles(path.join(dir, 'CustomAvatars'), dir),
    getFiles(path.join(dir, 'CustomPlatforms'), dir),
    getFiles(path.join(dir, 'CustomSabers'), dir),
    getFiles(dir, dir, { recursive: false }),
    getLogFiles(dir),
  ])

  const allMods = [
    ...new Set([
      ...pluginsMods,
      ...dataManagedMods,
      ...dataPluginsMods,
      ...customAvatarsMods,
      ...customPlatformsMods,
      ...customSabersMods,
      ...rootFilesMods,
    ]),
  ].sort((a, b) => a.localeCompare(b))

  const tree: any = {
    'Beat Saber_Data': {
      Managed: DataManaged,
      Plugins: DataPlugins,
    },
    CustomAvatars,
    CustomPlatforms,
    CustomSabers,
    Plugins,
  }

  for (const [k, v] of Object.entries(rootFiles)) {
    tree[k] = v
  }

  const sections = [
    { title: 'Directory Structure', content: renderTree(rootTitle, tree) },
    { title: 'Detected Mods Breakdown', content: allMods.join('\n') },
    ...logFiles.appData.map(({ name, body }) => ({
      content: body,
      title: `AppData/${name}`,
    })),
    ...logFiles.root.map(({ name, body }) => ({
      content: body,
      title: `Beat Saber/${name}`,
    })),
  ]

  return sections
    .map(({ title, content }) => {
      const padded = content
        .split('\n')
        .map(
          (line, i, arr) => `${i === arr.length - 1 ? '──┘ ' : '  │ '}${line}`
        )
        .join('\n')

      return `──┬── ${title} \n${padded}\n`
    })
    .join('\n')
}
