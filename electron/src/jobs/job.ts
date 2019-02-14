import { dialog } from 'electron'
import log from 'electron-log'
import { dequeueJob, enqueueJob } from '../utils/queue'
import { getActiveWindow, getAttention } from '../utils/window'

export class JobError extends Error {
  public readonly title: string
  public readonly status: string | undefined
  public flash: boolean

  /**
   * @param message Error Message
   * @param status IPC Status
   * @param title Dialog Title
   */
  constructor(message: string, status?: string, title?: string) {
    super(message)

    this.title = title || 'Job Error'
    this.status = status

    this.flash = false
  }
}

export const runJob = async <T>(job: Promise<T>) => {
  // Window Details
  const { window, sender } = getActiveWindow()

  // Start job
  const jobID = await enqueueJob()
  window.setProgressBar(1, { mode: 'indeterminate' })

  // Track errors
  let error = false

  try {
    await job
    window.setProgressBar(1, { mode: 'normal' })
  } catch (err) {
    if (err instanceof JobError) {
      log.debug(err)
      window.setProgressBar(1, { mode: 'error' })

      if (err.flash) getAttention(window)
      if (err.status) sender.send('set-status', { text: err.status })

      dialog.showMessageBox(window, {
        message: err.message,
        title: err.title,
        type: 'error',
      })
    }

    error = true
  }

  // Reset progress bar
  setTimeout(() => {
    window.setProgressBar(0, { mode: 'none' })
  }, 500)

  // Dequeue job
  await dequeueJob(jobID)
  return !error
}
