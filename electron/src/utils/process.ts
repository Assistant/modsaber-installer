import { exec } from 'child_process'
import { BEAT_SABER_EXE } from '../constants'

export const isRunning = (name: string) =>
  new Promise(resolve => {
    exec('tasklist', (err, stdout) => {
      if (err) return resolve(false)

      const processes = stdout.split('\n').filter(x => x.includes(name))
      return resolve(processes.length > 0)
    })
  })

// Detect Beat Saber EXE
export const beatSaberOpen = () => isRunning(BEAT_SABER_EXE)
