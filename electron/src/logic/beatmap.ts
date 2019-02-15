import path from 'path'
import { extractZip } from '../remote/remote'
import fse from '../utils/file'
import { getActiveWindow } from '../utils/window'

export const saveBeatmap = async (
  zip: Buffer,
  key: string,
  installDir: string
) => {
  // Window Details
  const { sender } = getActiveWindow()

  // Ensure CustomSongs and Playlists exists
  const customSongs = path.join(installDir, 'CustomSongs')
  await fse.ensureDir(customSongs)
  await fse.ensureDir(path.join(installDir, 'Playlists'))

  // Extract zip
  sender.send('set-status', { text: 'Extracting beatmap...' })
  const files = await extractZip(
    zip,
    path.join(installDir, 'CustomSongs', key),
    {
      filter: ['.json', '.ogg', '.wav', '.jpg', '.jpeg', '.png'],
      filterType: 'whitelist',
    }
  )

  // File Write Jobs
  const jobs = files.map(async file => {
    const { dir } = path.parse(file.path)

    // Strip out autosaves
    if (dir.includes('autosaves')) return undefined
    await fse.ensureDir(dir)

    return fse.writeFile(file.path, file.data)
  })

  // Flush all jobs and return
  await Promise.all(jobs)
  sender.send('set-status', { text: 'Beatmap install complete!' })
}
