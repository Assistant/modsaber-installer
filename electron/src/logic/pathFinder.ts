import log from 'electron-log'
import Store from 'electron-store'
import path from 'path'
import Registry from 'winreg'
import { BEAT_SABER_EXE, STEAM_APP_ID } from '../constants'
import { IInstall } from '../models/installer'
import fse from '../utils/file'
import { checkPiracy } from './piracy'
const store = new Store()

const findSteamLibraries = (): Promise<string[]> =>
  new Promise((resolve, reject) => {
    const regKey = new Registry({
      hive: Registry.HKLM,
      key: '\\Software\\WOW6432Node\\Valve\\Steam',
    })

    regKey.get('InstallPath', async (err, key) => {
      if (err) return reject(err)

      const baseDir = path.join(key.value, 'steamapps')
      const libraryfolders = await fse.readFile(
        path.join(baseDir, 'libraryfolders.vdf'),
        'utf8'
      )

      const regex = /\s"\d"\s+"(.+)"/
      const libraries = libraryfolders
        .split('\n')
        .filter(line => line.match(regex))
        .map(line =>
          (regex.exec(line) as RegExpExecArray)[1].replace(/\\\\/g, '\\')
        )
        .map(line => path.join(line, 'steamapps'))

      return resolve([baseDir, ...libraries])
    })
  })

interface ISteamInstall {
  found: boolean
  path: string | null
  manifest: string | null
}

/**
 * Find a Steam game install path by App ID
 */
export const findSteam = async (appID: string): Promise<ISteamInstall> => {
  try {
    const libraries = await findSteamLibraries()

    const manifests = await Promise.all(
      libraries.map(async library => {
        const test = path.join(library, `appmanifest_${appID}.acf`)
        const exists = await fse.exists(test)
        return { path: test, library, exists }
      })
    )

    const [manifest] = manifests.filter(x => x.exists)

    if (manifest === undefined) {
      return { found: false, path: null, manifest: null }
    }
    const manifestLines = await fse.readFile(manifest.path, 'utf8')

    const regex = /\s"installdir"\s+"(.+)"/
    const [installDir] = manifestLines
      .split('\n')
      .filter(line => line.match(regex))
      .map(line =>
        (regex.exec(line) as RegExpMatchArray)[1].replace(/\\\\/g, '\\')
      )

    const final: ISteamInstall = {
      found: true,
      manifest: null,
      path: path.join(manifest.library, 'common', installDir),
    }

    const depot = parseInt(appID, 10) + 1
    const manifestIdRx = new RegExp(
      `"${depot}"\\s+{\\s+"manifest"\\s+"(\\d+)"`,
      'm'
    )

    const manifestIdText = manifestIdRx.exec(manifestLines)
    if (manifestIdText && manifestIdText[1]) final.manifest = manifestIdText[1]

    return final
  } catch (err) {
    return { found: false, path: null, manifest: null }
  }
}

/**
 * Tests an install directory for the Beat Saber Executable
 */
export const testPath = async (installDir: string): Promise<IInstall> => {
  const valid = await fse.exists(path.join(installDir, BEAT_SABER_EXE))

  const lower = installDir.toLowerCase()
  const oculus =
    lower.includes('oculus') ||
    lower.includes('hyperbolic-magnetism-beat-saber')

  const pirated = await checkPiracy(installDir)

  return {
    path: installDir,
    pirated,
    platform: oculus ? 'oculus' : 'steam',
    valid,
  }
}

export const findOculus = (): Promise<{
  found: boolean
  path: string | null
}> =>
  new Promise(resolve => {
    const regKey = new Registry({
      hive: Registry.HKLM,
      key: '\\Software\\WOW6432Node\\Oculus VR, LLC\\Oculus\\Config',
    })

    regKey.get('InitialAppLibrary', (err, key) => {
      if (err) return resolve({ found: false, path: null })

      const oculusPath = path.join(
        key.value,
        'Software/hyperbolic-magnetism-beat-saber'
      )

      return resolve({ found: true, path: oculusPath })
    })
  })

export const findPath = async (): Promise<IInstall> => {
  try {
    const prevPath = store.get('install.path')
    if (prevPath !== undefined) {
      const pathTest = await testPath(prevPath)
      if (pathTest.valid) return pathTest
    }

    const steamPath = await findSteam(STEAM_APP_ID)
    if (steamPath.found && steamPath.path !== null) {
      const pathTest = await testPath(steamPath.path)
      if (pathTest.valid) return pathTest
    }

    const oculusPath = await findOculus()
    if (oculusPath.found && oculusPath.path !== null) {
      const pathTest = await testPath(oculusPath.path)
      if (pathTest.valid) return pathTest
    }
  } catch (err) {
    // Do nothing
    log.error(err)
  }

  return { path: null, platform: 'unknown', valid: false, pirated: false }
}
