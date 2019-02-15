import { Reducer } from 'redux'
import { Status, StatusText } from '../../constants'
import { IStatusState, StatusActionTypes } from './types'

const initialState: IStatusState = {
  text: StatusText.IDLE,
  type: Status.LOADING,
}

const reducer: Reducer<IStatusState> = (state = initialState, action) => {
  switch (action.type) {
    case StatusActionTypes.SET_STATUS:
      if (
        action.payload.type === state.type &&
        action.payload.text === state.text
      ) {
        return state
      } else {
        return action.payload
      }

    case StatusActionTypes.SET_STATUS_TYPE:
      if (action.payload === state.type) return state
      else return { ...state, type: action.payload }

    case StatusActionTypes.SET_STATUS_TEXT:
      if (action.payload === state.text) return state
      else return { ...state, text: action.payload }

    default:
      return state
  }
}

export { reducer as statusReducer }
