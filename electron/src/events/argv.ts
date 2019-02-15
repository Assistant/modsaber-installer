import { beatSaverBeatmap, fileBeatmap } from '../jobs/beatmap'
import { handleCustomFile } from '../jobs/customFile'
import { runJob } from '../jobs/job'
import { localPlaylist, remotePlaylist } from '../jobs/playlist'
import fse from '../utils/file'

export const handleSchema = (schema: string) => {
  // Ignore if schema url is not passed
  if (!schema || !schema.startsWith('modsaber://')) return undefined

  // Split protocol up into parts
  const [job, ...args] = schema.replace(/^modsaber:\/\//g, '').split('/')

  // Handle BeatSaver Downloads
  if (job === 'song') runJob(beatSaverBeatmap(args.join('/')))

  // Handle BeatSaver Downloads
  if (job === 'playlist') runJob(remotePlaylist(args.join('/')))

  // Handle model downloads
  if (['avatar', 'saber', 'platform'].includes(job)) {
    runJob(handleCustomFile(args.join('/'), true))
  }

  // Return if nothing else
  return undefined
}

export const handleFiles = async (filePath: string, ext: string) => {
  // Ensure the file actually exists
  const exists = await fse.exists(filePath)
  if (!exists) return undefined

  const job =
    ext === '.bmap'
      ? fileBeatmap(filePath)
      : ext === '.bplist'
      ? localPlaylist(filePath)
      : handleCustomFile(filePath)

  return runJob(job)
}
