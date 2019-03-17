import { Dispatch } from 'redux'
import { IState } from '..'
import { IMiscState, MiscActionTypes } from './types'

export const setTheme: (
  theme: IMiscState
) => (dispatch: Dispatch) => void = theme => dispatch => {
  dispatch({
    payload: theme,
    type: MiscActionTypes.SET_THEME,
  })
}

export const toggleTheme: () => (
  dispatch: Dispatch,
  getState: () => IState
) => void = () => (dispatch, getState) => {
  const theme = getState().misc.theme === 'light' ? 'dark' : 'light'

  dispatch({
    payload: theme,
    type: MiscActionTypes.SET_THEME,
  })
}

export const loadTheme: () => (dispatch: Dispatch) => void = () => dispatch => {
  dispatch({ type: MiscActionTypes.LOAD_THEME })
}

export const setSeenDonationPage: (
  seen: boolean
) => (dispatch: Dispatch) => void = seen => dispatch => {
  dispatch({
    payload: seen,
    type: MiscActionTypes.SET_SEEN_DONATION_PAGE,
  })
}

export const setShake: (
  shake: boolean
) => (dispatch: Dispatch) => void = shake => dispatch => {
  dispatch({
    payload: shake,
    type: MiscActionTypes.SET_SHAKE,
  })
}

export const shakeForMs: (ms: number) => (dispatch: Dispatch) => void = (
  ms = 10
) => dispatch => {
  dispatch({
    payload: true,
    type: MiscActionTypes.SET_SHAKE,
  })

  setTimeout(() => {
    dispatch({
      payload: false,
      type: MiscActionTypes.SET_SHAKE,
    })
  }, ms)
}
