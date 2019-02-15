import { Reducer } from 'redux'
import { IModsState, ModsActionTypes } from './types'

const initialState: IModsState = {
  list: [],
  raw: [],
  selected: null,
}

export const reducer: Reducer<IModsState> = (state = initialState, action) => {
  switch (action.type) {
    case ModsActionTypes.SET_MODS_RAW:
      return { ...state, raw: action.payload }

    case ModsActionTypes.SET_MODS_LIST:
      return { ...state, list: action.payload }

    case ModsActionTypes.SET_SELECTED_MOD:
      if (action.payload === state.selected) return state
      else return { ...state, selected: action.payload }

    default:
      return state
  }
}

export { reducer as modsReducer }
