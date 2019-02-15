import {
  BrowserWindow,
  clipboard,
  dialog,
  ipcMain,
  shell,
  WebContents,
} from 'electron'
import log from 'electron-log'
import { runDiagnostics } from '../jobs/diagnostics'
import { runJob } from '../jobs/job'
import { IPCSender } from '../models/ipc'
import { uploadPaste } from '../remote/paste'
import { readFile } from '../utils/file'

ipcMain.on('upload-log', async ({ sender }: IPCSender, logPath: string) => {
  // Get Browser Window
  const window = BrowserWindow.fromWebContents(sender)

  try {
    const userLog = await readFile(logPath, 'utf8')
    const url = await uploadPaste(userLog, 'log')

    clipboard.writeText(url)
    shell.openExternal(url)

    return sender.send('set-status', {
      text: 'Log file uploaded, copied URL to clipboard!',
    })
  } catch (err) {
    log.error(err)

    return dialog.showMessageBox(window, {
      message: 'Log file failed to upload!\nTry pressing CTRL+SHIFT+K',
      title: 'Upload Error',
      type: 'error',
    })
  }
})

ipcMain.on('run-diagnostics', async () => {
  // Run diagnostics job
  await runJob(runDiagnostics())
})
