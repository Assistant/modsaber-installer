import { Dispatch } from 'redux'
import { ContainerActionTypes, IContainerState } from './types'

export const setContainer: (
  container: React.RefObject<IContainerState>
) => (dispatch: Dispatch) => void = container => dispatch => {
  dispatch({
    payload: container.current,
    type: ContainerActionTypes.SET_CONTAINER,
  })
}

export const clearContainer: () => (
  dispatch: Dispatch
) => void = () => dispatch => {
  dispatch({
    payload: null,
    type: ContainerActionTypes.CLEAR_CONTAINER,
  })
}
