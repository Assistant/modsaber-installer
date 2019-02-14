import Store from 'electron-store'
import path from 'path'
import { IInstall } from '../models/installer'
import { IGameVersion, IMod } from '../models/modsaber'
import { DownloadError, downloadMod } from '../remote/modsaber'
import { IExtracted } from '../remote/remote'
import fse from '../utils/file'
import { promiseHandler } from '../utils/helpers'
import { beatSaberOpen } from '../utils/process'
import { getActiveWindow } from '../utils/window'
import { JobError } from './job'
const store = new Store()

export class InstallError extends JobError {
  constructor(message: string, status?: string, title?: string) {
    super(message, status, title || 'Install Error')
  }
}

export const installMods = async (
  mods: IMod[],
  install: IInstall,
  gameVersion: IGameVersion
) => {
  // Window Details
  const { sender } = getActiveWindow()

  // Validate install details
  if (
    install.platform === 'unknown' ||
    !install.valid ||
    install.path === null
  ) {
    throw new InstallError('Invalid install path!', 'Invalid install path!')
  }

  const installPlatform = install.platform
  const installPath = install.path

  // Save install path
  store.set('install', install)

  // Ensure some required folders exist
  await fse.ensureDir(path.join(install.path, 'UserData'))
  await fse.ensureDir(path.join(install.path, 'Playlists'))

  // Ensure Beat Saber is not open
  const isOpen = await beatSaberOpen()
  if (isOpen) {
    throw new InstallError('Please close Beat Saber before installing mods!')
  }

  // Move incompatible plugins
  const moveAndWrite = async (version = 'Unknown') => {
    // Send status
    sender.send('set-status', { text: 'Moving incompatible plugins...' })

    // Write new txt value
    await fse.writeFile(versionTxt, gameVersion.value)

    // Reference directories
    const pluginsDir = path.join(installPath, 'Plugins')
    const incompatibleDir = path.join(
      installPath,
      'Incompatible Plugins',
      `Plugins v${version}`
    )

    // Clean new directory
    try {
      await fse.rmDir(incompatibleDir)
    } catch (err) {
      // Ignore errors
    }

    // Create directories
    await fse.ensureDir(path.join(installPath, 'Incompatible Plugins'))
    await fse.ensureDir(incompatibleDir)

    // Move old files
    const oldFiles: string[] = await fse.glob(path.join(pluginsDir, '**', '*'))
    await Promise.all(
      oldFiles.map(oldPath => {
        const newPath = path.join(
          incompatibleDir,
          oldPath.replace(pluginsDir.replace(/\\/g, '/'), '')
        )
        return fse.rename(oldPath, newPath)
      })
    )

    try {
      await fse.rmDir(pluginsDir)
      return undefined
    } catch (err) {
      // Ignore errors
      return undefined
    }
  }

  // Validate Beat Saber version
  const versionTxt = path.join(install.path, 'BeatSaberVersion.txt')
  const versionTxtExists = await fse.exists(versionTxt)
  if (!versionTxtExists) {
    await moveAndWrite()
  } else {
    const versionTxtValue = await fse.readFile(versionTxt, 'utf8')
    if (versionTxtValue !== gameVersion.value) {
      await moveAndWrite(versionTxtValue)
    }
  }

  // Send status
  sender.send('set-status', { text: 'Downloading mods...' })

  // Download Mods
  const downloadJobs = Promise.all(
    mods.map(mod => downloadMod(mod, installPlatform, installPath))
  )
  const { error: dlError, result: downloaded } = await promiseHandler(
    downloadJobs
  )

  // Handle download errors
  if (dlError) {
    const dErr = dlError as DownloadError
    const err = new InstallError(
      `Download failed for ${dErr.mod.name}@${dErr.mod.version}\nError: ${
        dlError.message
      }`,
      dlError.message,
      'Download Error'
    )

    err.flash = true
    throw err
  }

  // Write Mods
  for (const i in downloaded) {
    if (!(i in downloaded)) continue

    const idx = parseInt(i, 10)
    const mod = mods[idx]
    const modFiles = downloaded[idx]

    sender.send('set-status', { text: `Writing ${mod.name}@${mod.version}` })
    const jobs = modFiles.map(async (file: IExtracted) => {
      const { dir } = path.parse(file.path)
      await fse.ensureDir(dir)

      return fse.writeFile(file.path, file.data)
    })

    await Promise.all(jobs)
  }
}
