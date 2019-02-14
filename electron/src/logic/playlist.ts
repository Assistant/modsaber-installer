import path from 'path'
import { beatSaverBeatmap } from '../jobs/beatmap'
import { runJob } from '../jobs/job'
import { IPlaylist } from '../models/playlist'
import fse from '../utils/file'
import { getActiveWindow } from '../utils/window'

export const resolvePlaylist = (fileName: string, json: any) => {
  const { name } = path.parse(decodeURIComponent(fileName))

  // Validate JSON
  const error = new Error('Invalid Playlist')
  if (!json.playlistTitle) return { playlist: undefined, error }
  if (!json.songs) return { playlist: undefined, error }

  // Return
  const playlist: IPlaylist = {
    archiveUrl: json.customArchiveUrl,
    fileName: `${name}.bplist`,
    raw: JSON.stringify(json),
    songs: json.songs,
    title: json.playlistTitle,
  }

  return { playlist, error: undefined }
}

export const installPlaylist = async (
  playlist: IPlaylist,
  installDir: string
) => {
  // Window Details
  const { sender } = getActiveWindow()

  // Ensure CustomSongs and Playlists exists
  const customSongs = path.join(installDir, 'CustomSongs')
  await fse.ensureDir(customSongs)
  await fse.ensureDir(path.join(installDir, 'Playlists'))

  // Writing playlist to file
  sender.send('set-status', { text: 'Saving playlist info...' })
  fse.writeFile(
    path.join(installDir, 'Playlists', playlist.fileName),
    playlist.raw
  )

  // Start jobs for every song
  const jobs = playlist.songs.map(({ key, hash }) => {
    const job = key ? beatSaverBeatmap(key) : beatSaverBeatmap(hash)

    return runJob(job)
  })

  await Promise.all(jobs)

  // Send status and return
  sender.send('set-status', { text: 'Playlist downloaded!' })
  return undefined
}

module.exports = { resolvePlaylist, installPlaylist }
