import { Dispatch } from 'redux'
import { TabsActionTypes } from './types'

export const setCurrentTab: (
  tab: number
) => (dispatch: Dispatch) => void = tab => dispatch => {
  dispatch({
    payload: tab,
    type: TabsActionTypes.SET_CURRENT_TAB,
  })
}

export const setMaxTabs: (
  max: number
) => (dispatch: Dispatch) => void = max => dispatch => {
  dispatch({
    payload: max,
    type: TabsActionTypes.SET_TABS_MAX,
  })
}

export const incrementTab: () => (
  dispatch: Dispatch
) => void = () => dispatch => {
  dispatch({
    type: TabsActionTypes.INCREMENT_TAB_IDX,
  })
}

export const decrementTab: () => (
  dispatch: Dispatch
) => void = () => dispatch => {
  dispatch({
    type: TabsActionTypes.DECREMENT_TAB_IDX,
  })
}
