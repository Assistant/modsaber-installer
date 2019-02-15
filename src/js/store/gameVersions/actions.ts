import { Dispatch } from 'redux'
import { IGameVersion } from '../../models/modsaber'
import { GameVersionActionTypes } from './types'

export const setGameVersions: (
  gv: IGameVersion[]
) => (dispatch: Dispatch) => void = gv => dispatch => {
  dispatch({
    payload: gv,
    type: GameVersionActionTypes.SET_GAME_VERSIONS,
  })
}

export const setSelectedGameVersion: (
  index: number
) => (dispatch: Dispatch) => void = idx => dispatch => {
  dispatch({
    payload: idx,
    type: GameVersionActionTypes.SET_SELECTED_GAME_VERSION,
  })
}
