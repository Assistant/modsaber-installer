import { app, BrowserWindow, dialog, Menu, shell } from 'electron'
import isDev from 'electron-is-dev'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import path from 'path'

import { loadCerts } from './src/utils/certs'

import { handleFiles, handleSchema } from './src/events/argv'
import { dequeueJob, enqueueJob } from './src/utils/queue'

import {
  AUTO_UPDATE_JOB,
  BASE_URL,
  REGISTERED_EXTS,
  REPO,
  VERSION,
} from './src/constants'

// Instance Lock
const instanceLock = app.requestSingleInstanceLock()
if (!instanceLock) app.quit()

// Setup Auto Updater and Logger
autoUpdater.autoDownload = false
log.transports.file.level = 'warn'

export interface IBrowserWindow extends BrowserWindow {
  custom?: any
}

let window: IBrowserWindow
let loadingWindow: IBrowserWindow | undefined

const hasUpdateController = {
  pending: true,
  reject: (error: Error) => {
    // No-op
  },
  resolve: (...args: any[]) => {
    // No-op
  },
}

let downloadingUpdate = false

app.on('ready', async () => {
  loadingWindow = new BrowserWindow({
    height: 320,
    width: 290,

    frame: false,
    resizable: false,

    icon: path.join(__dirname, 'icon.png'),
    show: false,
  })

  const loadingURL = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`
  loadingWindow.loadURL(loadingURL)

  loadingWindow.custom = { ROLE: 'WINDOW_LOADING' }
  loadingWindow.once('ready-to-show', () => {
    if (loadingWindow !== undefined) loadingWindow.show()
  })

  const waitForSplash = (w: BrowserWindow) =>
    new Promise(resolve => {
      w.once('ready-to-show', () => {
        resolve()
      })
    })

  await waitForSplash(loadingWindow)
  if (loadingWindow !== undefined) loadingWindow.show()

  // Load Root Certificates
  await loadCerts()

  // Event Handlers
  await import('./src/events/diagnostics.js')
  await import('./src/events/installer.js')
  await import('./src/events/path.js')
  await import('./src/events/remote.js')

  const updateCheck = async () => {
    if (isDev) return false
    else {
      return (
        (await autoUpdater.checkForUpdates()).cancellationToken !== undefined
      )
    }
  }

  const hasUpdate = new Promise((resolve, reject) => {
    hasUpdateController.resolve = resolve
    hasUpdateController.reject = reject

    updateCheck()
      .then(value => {
        hasUpdateController.pending = false
        return resolve(value)
      })
      .catch(err => {
        hasUpdateController.pending = false
        return reject(err)
      })
  })

  const width = 1080
  const height = 755

  const minWidth = 820
  const minHeight = 600

  window = new BrowserWindow({
    height: isDev ? height + 20 : height,
    width,

    minHeight: isDev ? minHeight + 20 : minHeight,
    minWidth,

    icon: path.join(__dirname, 'icon.png'),
    show: false,

    webPreferences: {
      nodeIntegration: true,
    },
  })

  const menu = !isDev
    ? null
    : Menu.buildFromTemplate([
        {
          label: 'Dev',
          submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { role: 'toggledevtools' },
          ],
        },
      ])
  window.setMenu(menu)

  const startURL = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`
  window.loadURL(startURL)

  window.setTitle(`ModSaber Installer // v${VERSION}`)
  window.once('ready-to-show', async () => {
    setTimeout(() => {
      if (hasUpdateController.pending) {
        log.error('Loading timeout!')
        hasUpdateController.resolve(false)
      }
    }, 15 * 1000)

    if (await hasUpdate) {
      await enqueueJob(AUTO_UPDATE_JOB)
      autoUpdater.downloadUpdate()
      downloadingUpdate = true

      setTimeout(() => {
        // Cancel update after 1 minute
        if (!downloadingUpdate) return undefined
        downloadingUpdate = false

        dialog.showMessageBox(window, {
          message:
            'Auto-update failed!\nPlease download the new update manually.',
          title: 'Auto Updater',
          type: 'error',
        })

        shell.openExternal(`https://github.com/${REPO}/releases`)
        app.quit()
      }, 1000 * 60)
    }

    if (loadingWindow !== undefined) {
      loadingWindow.close()
      loadingWindow.destroy()
    }

    loadingWindow = undefined

    window.show()
    handleArgs(process.argv)
  })

  window.on('focus', () => {
    window.flashFrame(false)
  })

  window.on('closed', () => app.quit())

  window.custom = { ROLE: 'WINDOW_MAIN', BASE_URL, AUTO_UPDATE_JOB }
})

app.on('second-instance', (event, argv) => {
  if (!window) return undefined
  handleArgs(argv)

  if (window.isMinimized()) window.restore()
  return window.focus()
})

const handleArgs = (argv: string[]) => {
  const args = argv.filter((_, i) => !(i < (isDev ? 2 : 1)))

  // Ignore if no args are passed
  if (!args || args.length === 0) return undefined

  // Handle Schema
  if (args[0].startsWith('modsaber://')) return handleSchema(args[0])

  // Check if its a path
  const { ext } = path.parse(args[0])
  if (REGISTERED_EXTS.includes(ext)) return handleFiles(args[0], ext)

  // Return if unhandled
  return undefined
}

autoUpdater.on('download-progress', ({ percent }) => {
  window.setProgressBar(percent / 100, { mode: 'normal' })
})

autoUpdater.on('update-downloaded', async () => {
  downloadingUpdate = false

  const button = dialog.showMessageBox(window, {
    buttons: ['Release Notes', 'OK'],
    message:
      'A newer version has been downloaded.\n\nClick OK to install the update.' +
      '\nThe program will restart with the update applied.',
    title: 'Auto Updater',
    type: 'info',
  })

  if (button === 0) {
    const {
      provider: {
        // @ts-ignore
        options: { owner, repo },
      },
      // @ts-ignore
    } = await autoUpdater.getUpdateInfoAndProvider()
    const releases = `https://github.com/${owner}/${repo}/releases`

    shell.openExternal(releases)
  }

  autoUpdater.quitAndInstall(true, true)
})

autoUpdater.on('error', err => {
  log.error(err)

  hasUpdateController.resolve(false)
  dequeueJob(AUTO_UPDATE_JOB)
})
