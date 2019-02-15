export enum JobsActionTypes {
  SET_JOBS = '@@jobs/SET_JOBS',
  ENQUEUE_JOB = '@@jobs/ENQUEUE_JOB',
  DEQUEUE_JOB = '@@jobs/DEQUEUE_JOB',
}

export type IJobsState = string[]
