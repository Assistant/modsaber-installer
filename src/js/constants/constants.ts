import { IWindow } from '../..'
import { getCurrentWindow } from '../utils/electron'

// Remote URLs
export const BASE_URL = (getCurrentWindow() as IWindow).custom.BASE_URL

// Auto Update Job
export const AUTO_UPDATE_JOB = (getCurrentWindow() as IWindow).custom
  .AUTO_UPDATE_JOB

export const STYLE_OVERRIDE = `div.box#main {
  justify-content: initial;
  align-items: initial;

  padding: 15px;
  padding-top: 8px;

  overflow-y: scroll;
}`
