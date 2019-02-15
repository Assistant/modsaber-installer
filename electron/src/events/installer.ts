import { ipcMain } from 'electron'
import { installMods } from '../jobs/installer'
import { runJob } from '../jobs/job'
import { patchGame } from '../jobs/patch'
import { IInstall } from '../models/installer'
import { IPCSender } from '../models/ipc'
import { IGameVersion, IMod } from '../models/modsaber'
import { dequeueJob, enqueueJob } from '../utils/queue'

interface IPayload {
  mods: IMod[]
  install: IInstall
  gameVersion: IGameVersion
}

ipcMain.on('install-mods', async ({ sender }: IPCSender, data: IPayload) => {
  // Wrap the whole thing in a job
  const jobID = await enqueueJob()

  // Install mods
  const installJob = installMods(data.mods, data.install, data.gameVersion)
  const installSuccess = await runJob(installJob)
  if (!installSuccess) return dequeueJob(jobID)

  // Patch game
  const patchJob = patchGame(data.install)
  const patchSuccess = await runJob(patchJob)
  if (!patchSuccess) return dequeueJob(jobID)

  // Release job queue
  sender.send('set-status', { text: 'Install complete!' })
  return dequeueJob(jobID)
})

ipcMain.on('patch-game', async (_: any, install: IInstall) => {
  // Patch game
  const patchJob = patchGame(install)
  await runJob(patchJob)
})
