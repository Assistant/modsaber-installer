import { exec } from 'child_process'
import { PathLike } from 'fs'
import { BEAT_SABER_EXE } from '../constants'
import { readFile } from './file'

/**
 * Detects if a process is currently running
 * @param name Process Name
 */
export const isRunning = (name: string) =>
  new Promise(resolve => {
    exec('tasklist', (err, stdout) => {
      if (err) return resolve(false)

      const processes = stdout.split('\n').filter(x => x.includes(name))
      return resolve(processes.length > 0)
    })
  })

/**
 * Detects if Beat Saber is currently open
 */
export const beatSaberOpen = () => isRunning(BEAT_SABER_EXE)

/**
 * Detects if Beat Saber is patched.
 * @param path UnityEngine.CoreModule.dll Path
 */
export const isPatched = async (path: PathLike) => {
  try {
    const data = await readFile(path)

    return data
      .toString('utf8')
      .toLowerCase()
      .includes('illusion')
  } catch (err) {
    if (err.code === 'ENOENT') return false
    else throw err
  }
}
