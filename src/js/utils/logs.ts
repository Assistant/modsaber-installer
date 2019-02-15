import path from 'path'
import { app, ipcRenderer, shell } from './electron'
import fs from './fs'

// Constant log path
const logPath = path.join(app.getPath('userData'), 'log.log')

const logExists = (): Promise<boolean> =>
  new Promise(resolve => {
    fs.exists(logPath, exists => resolve(exists))
  })

export const openLog = async () => {
  const exists = await logExists()

  if (exists) return shell.openItem(logPath)
  else return shell.beep()
}

export const uploadLog = async () => {
  const exists = await logExists()

  if (exists) return ipcRenderer.send('upload-log', logPath)
  else return shell.beep()
}
