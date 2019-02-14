import { ipcMain } from 'electron'
import Store from 'electron-store'
import { findPath, testPath } from '../logic/pathFinder'
import { IPCSender } from '../models/ipc'
const store = new Store()

ipcMain.on('get-path', async ({ sender }: IPCSender) => {
  const path = await findPath()

  if (path.platform === 'unknown') sender.send('unknown-path')
  else sender.send('set-path', path)
})

ipcMain.on('set-path', async ({ sender }: IPCSender, installDir: string) => {
  const test = await testPath(installDir)
  if (!test.valid) return sender.send('invalid-path', test.path)

  store.set('install', test)
  return sender.send('set-path', test)
})
