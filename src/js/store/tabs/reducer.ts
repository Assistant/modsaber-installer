import { Reducer } from 'redux'
import { ITabsState, TabsActionTypes } from './types'

const initialState: ITabsState = {
  current: 0,
  max: 0,
}

const reducer: Reducer<ITabsState> = (state = initialState, action) => {
  switch (action.type) {
    case TabsActionTypes.SET_TABS_MAX:
      if (action.payload === state.max) return state
      else return { ...state, max: action.payload }

    case TabsActionTypes.SET_CURRENT_TAB:
      if (action.payload === state.current) return state
      else return { ...state, current: action.payload }

    case TabsActionTypes.INCREMENT_TAB_IDX:
      return { ...state, current: Math.min(state.current + 1, state.max) }

    case TabsActionTypes.DECREMENT_TAB_IDX:
      return { ...state, current: Math.max(state.current - 1, 0) }

    default:
      return state
  }
}

export { reducer as tabsReducer }
