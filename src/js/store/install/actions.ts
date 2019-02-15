import { Dispatch } from 'redux'
import { IInstallState, InstallActionTypes, InstallPlatform } from './types'

export const setInstall: (
  install: IInstallState
) => (dispatch: Dispatch) => void = install => dispatch => {
  dispatch({
    payload: install,
    type: InstallActionTypes.SET_INSTALL,
  })
}

export const setInstallPath: (
  path: string | null
) => (dispatch: Dispatch) => void = path => dispatch => {
  dispatch({
    payload: path,
    type: InstallActionTypes.SET_INSTALL_PATH,
  })
}

export const setInstallPlatform: (
  platform: InstallPlatform
) => (dispatch: Dispatch) => void = platform => dispatch => {
  dispatch({
    payload: platform,
    type: InstallActionTypes.SET_INSTALL_PLATFORM,
  })
}
