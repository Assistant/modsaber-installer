import { Dispatch } from 'redux'
import { Status, StatusText } from '../../constants'
import { StatusActionTypes } from './types'

export const setStatus: (
  type: Status,
  text: StatusText
) => (dispatch: Dispatch) => void = (type, text) => dispatch => {
  dispatch({
    payload: { type, text },
    type: StatusActionTypes.SET_STATUS,
  })
}

export const setStatusType: (
  type: Status
) => (dispatch: Dispatch) => void = type => dispatch => {
  dispatch({
    payload: type,
    type: StatusActionTypes.SET_STATUS_TYPE,
  })
}

export const setStatusText: (
  text: StatusText
) => (dispatch: Dispatch) => void = text => dispatch => {
  dispatch({
    payload: text,
    type: StatusActionTypes.SET_STATUS_TEXT,
  })
}
