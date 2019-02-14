import { exec } from 'child_process'
import log from 'electron-log'
import path from 'path'
import { BEAT_SABER_EXE, BPM_EXE, IPA_EXE } from '../constants'
import { IInstall } from '../models/installer'
import fse from '../utils/file'
import { beatSaberOpen } from '../utils/process'
import { getActiveWindow } from '../utils/window'
import { JobError } from './job'

export class PatchError extends JobError {
  constructor(message: string, status?: string, title?: string) {
    super(message, status, title || 'IPA Error')
  }
}

export const patchGame = async (install: IInstall) => {
  // Window Details
  const { sender } = getActiveWindow()

  // Validate install details
  if (install.platform === 'unknown' || install.path === null) {
    throw new PatchError('Invalid install path!', 'Invalid install path!')
  }

  // Ensure Beat Saber is not open
  const isOpen = await beatSaberOpen()
  if (isOpen) throw new PatchError('Please close Beat Saber before patching!')

  // EXE Paths
  const exePath = path.join(install.path, BEAT_SABER_EXE)
  const ipaPath = path.join(install.path, IPA_EXE)
  const bpmPath = path.join(install.path, BPM_EXE)

  // Uninstall bpm if it exists
  const bpmInstalled = await fse.exists(bpmPath)
  if (bpmInstalled) {
    await fse.remove(exePath)
    await fse.rename(bpmPath, exePath)
  }

  // Check if IPA exists
  const canPatch = (await fse.exists(exePath)) && (await fse.exists(ipaPath))
  if (!canPatch) {
    const err = new PatchError(
      'Could not patch Beat Saber! (IPA Missing)',
      'IPA Error!'
    )

    err.flash = true
    throw err
  }

  sender.send('set-status', { text: 'Patching game...' })

  try {
    await exec(`"${ipaPath}" "${exePath}"`)
    sender.send('set-status', { text: 'Patch complete!' })

    return undefined
  } catch (error) {
    log.error(error)

    const err = new PatchError(
      'Could not patch Beat Saber! (IPA Error)\nStack trace written to log file.',
      'IPA Error!'
    )
    err.flash = true
    throw err
  }
}
