import { BrowserWindow, shell } from 'electron'
import { IBrowserWindow } from '../../electron'

export const getAttention = (window: BrowserWindow) => {
  if (window.isFocused()) return undefined

  shell.beep()
  return window.flashFrame(true)
}

export const getActiveWindow = (win?: BrowserWindow) => {
  const [fallback] = BrowserWindow.getAllWindows().filter(
    (x: IBrowserWindow) => x.custom.ROLE === 'WINDOW_MAIN'
  )

  const window = win || fallback
  const sender = window.webContents

  return { window, sender }
}
