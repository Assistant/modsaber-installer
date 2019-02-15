/**
 * @type {import('electron')}
 */
const electron = window.require('electron')

const Store = window.require('electron-store')
/**
 * @type {Map}
 */
const store = new Store()

export default electron
export const remote = electron.remote
export const shell = electron.shell
export const ipcRenderer = electron.ipcRenderer
export const app = electron.remote.app
export const dialog = electron.remote.dialog
export const getCurrentWindow = electron.remote.getCurrentWindow

export { store as electronStore }
