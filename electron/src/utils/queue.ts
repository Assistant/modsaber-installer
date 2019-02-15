import { ipcMain } from 'electron'
import uuid from 'uuid/v4'
import { getActiveWindow } from './window'

type Task = 'enqueue' | 'dequeue'

interface ITask {
  noonce: string
  task: Task
  id: string
}

const manageJob = (task: Task, id?: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const { window } = getActiveWindow()
    if (!window) return reject(new Error('Window not found'))

    const noonce = uuid()
    window.webContents.send('queue-job', { noonce, task, id })

    const respListener = (_: any, resp: ITask) => {
      if (resp.noonce !== noonce) return undefined

      ipcMain.removeListener('queue-job-resp', respListener)
      return resolve(resp.id)
    }

    return ipcMain.on('queue-job-resp', respListener)
  })

export const enqueueJob = (id?: string) => manageJob('enqueue', id)
export const dequeueJob = (id: string) => manageJob('dequeue', id)
