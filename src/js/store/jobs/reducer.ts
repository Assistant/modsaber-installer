import { Reducer } from 'redux'
import { IJobsState, JobsActionTypes } from './types'

const reducer: Reducer<IJobsState> = (state = [], action) => {
  switch (action.type) {
    case JobsActionTypes.SET_JOBS:
      return action.payload

    case JobsActionTypes.ENQUEUE_JOB:
      return [...state, action.payload]

    case JobsActionTypes.DEQUEUE_JOB:
      return state.filter(x => x !== action.payload)

    default:
      return state
  }
}

export { reducer as jobsReducer }
