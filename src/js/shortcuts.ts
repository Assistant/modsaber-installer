import Mousetrap from 'mousetrap'
import { ipcRenderer } from './utils/electron'
import { openLog, uploadLog } from './utils/logs'

// Open log file
Mousetrap.bind('ctrl+shift+k', () => openLog())

// Upload log file
Mousetrap.bind('ctrl+shift+l', () => uploadLog())

// Run Diagnostics
Mousetrap.bind('ctrl+shift+d', () => ipcRenderer.send('run-diagnostics'))
