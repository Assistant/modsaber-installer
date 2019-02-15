import { Reducer } from 'redux'
import { ContainerActionTypes, IContainerState } from './types'

const reducer: Reducer<IContainerState> = (state = null, action) => {
  switch (action.type) {
    case ContainerActionTypes.SET_CONTAINER:
      return action.payload

    case ContainerActionTypes.CLEAR_CONTAINER:
      return null

    default:
      return state
  }
}

export { reducer as containerReducer }
