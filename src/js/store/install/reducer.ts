import { Reducer } from 'redux'
import { IInstallState, InstallActionTypes } from './types'

const initialState: IInstallState = {
  path: null,
  pirated: false,
  platform: 'unknown',
}

const reducer: Reducer<IInstallState> = (state = initialState, action) => {
  switch (action.type) {
    case InstallActionTypes.SET_INSTALL:
      return action.payload

    case InstallActionTypes.SET_INSTALL_PATH:
      return { ...state, path: action.payload }

    case InstallActionTypes.SET_INSTALL_PLATFORM:
      return { ...state, platform: action.payload }

    default:
      return state
  }
}

export { reducer as installReducer }
