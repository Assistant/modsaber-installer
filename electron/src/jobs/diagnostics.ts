import { BrowserWindow, clipboard, shell } from 'electron'
import log from 'electron-log'
import { ERRORS } from '../constants'
import { generate } from '../logic/diagnostics'
import { findPath } from '../logic/pathFinder'
import { uploadPaste } from '../remote/paste'
import { getActiveWindow } from '../utils/window'
import { JobError } from './job'

export class DiagnosticsError extends JobError {
  constructor(message: string, status?: string, title?: string) {
    super(message, status, title || 'Diagnostics Error')
  }
}

export const runDiagnostics = async (win?: BrowserWindow) => {
  // Window Details
  const { sender } = getActiveWindow(win)

  // Find install path
  const install = await findPath()
  if (
    install.platform === 'unknown' ||
    !install.valid ||
    install.path === null
  ) {
    throw new DiagnosticsError(ERRORS.INVALID_INSTALL_DIR)
  }

  // Send starting message
  sender.send('set-status', { text: 'Running diagnostics...' })

  try {
    // Generate diagnostics report
    const diagnostics = await generate(install.path)
    if (diagnostics.length > 400000) {
      throw new DiagnosticsError(ERRORS.DIAGNOSTICS_TOO_LARGE)
    }

    // Upload to hastebin
    const url = await uploadPaste(diagnostics, 'txt')

    // Open url and save to clipboard
    clipboard.writeText(url)
    shell.openExternal(url)

    // Write final status
    sender.send('set-status', {
      text: 'Diagnostics uploaded, copied URL to clipboard!',
    })
  } catch (err) {
    log.error(err)
    throw new DiagnosticsError(ERRORS.DIAGNOSTICS_FAILURE)
  }
}
