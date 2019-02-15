import { Dispatch } from 'redux'
import uuid from 'uuid/v4'
import { JobsActionTypes } from './types'

export const setJobs: (
  jobs: string[]
) => (dispatch: Dispatch) => void = jobs => dispatch => {
  dispatch({
    payload: jobs,
    type: JobsActionTypes.SET_JOBS,
  })
}

export const enqueueJob: (
  id: string
) => (dispatch: Dispatch) => string = id => dispatch => {
  const uid = id || uuid()

  dispatch({
    payload: uid,
    type: JobsActionTypes.ENQUEUE_JOB,
  })

  return uid
}

export const dequeueJob: (
  id: string
) => (dispatch: Dispatch) => string = id => dispatch => {
  dispatch({
    payload: id,
    type: JobsActionTypes.DEQUEUE_JOB,
  })

  return id
}
