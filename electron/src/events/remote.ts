import { BrowserWindow, ipcMain } from 'electron'
import log from 'electron-log'
import { STEAM_APP_ID } from '../constants'
import { findSteam } from '../logic/pathFinder'
import { IPCSender } from '../models/ipc'
import { fetchGameVersions, fetchModsSafer } from '../remote/modsaber'

ipcMain.on('get-remote', async ({ sender }: IPCSender) => {
  const window = BrowserWindow.fromWebContents(sender)
  window.setProgressBar(1, { mode: 'indeterminate' })

  try {
    const [mods, gameVersions] = await Promise.all([
      fetchModsSafer('newest-by-gameversion'),
      fetchGameVersions(),
    ])

    const manifestTest = await findSteam(STEAM_APP_ID)
    if (manifestTest.found) {
      const idx = gameVersions.findIndex(
        x => x.manifest === manifestTest.manifest
      )
      if (idx > 0) gameVersions[idx].selected = true
      else gameVersions[0].selected = true
    } else {
      gameVersions[0].selected = true
    }

    window.setProgressBar(0, { mode: 'none' })
    sender.send('set-remote', { status: 'success', mods, gameVersions })
  } catch (err) {
    log.error(err)

    sender.send('set-remote', { status: 'error', statusText: err.message })
    window.setProgressBar(1, { mode: 'error' })
  }
})
