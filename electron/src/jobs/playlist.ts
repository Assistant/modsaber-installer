import log from 'electron-log'
import path from 'path'
import { parse as parseURL } from 'url'
import { ERRORS } from '../constants'
import { findPath } from '../logic/pathFinder'
import { installPlaylist, resolvePlaylist } from '../logic/playlist'
import { safeDownload } from '../remote/remote'
import fse from '../utils/file'
import { getActiveWindow } from '../utils/window'
import { JobError } from './job'

export class PlaylistError extends JobError {
  constructor(message: string, status?: string, title?: string) {
    super(message, status, title || 'Playlist Install Error')
  }
}

export const remotePlaylist = async (url: string) => {
  // Window Details
  const { sender } = getActiveWindow()

  // Find install path
  const install = await findPath()
  if (
    install.platform === 'unknown' ||
    !install.valid ||
    install.path === null
  ) {
    throw new PlaylistError(ERRORS.INVALID_INSTALL_DIR)
  }

  // Download playlist info
  sender.send('set-status', { text: 'Downloading playlist info...' })
  const { body, error } = await safeDownload(url)
  if (error) {
    log.error(error)
    throw new PlaylistError(ERRORS.PLAYLIST_DOWNLOAD_ERROR)
  }

  // Resolve playlist
  const { base } = path.parse(url)
  const { playlist, error: plError } = resolvePlaylist(base, body)
  if (plError || playlist === undefined) {
    throw new PlaylistError(ERRORS.PLAYLIST_INVALID)
  }

  // Check archive URL
  if (playlist.archiveUrl) {
    const { hostname } = parseURL(playlist.archiveUrl)
    if (hostname !== 'beatsaver.com') {
      throw new PlaylistError(ERRORS.PLAYLIST_UNTRUSTED)
    }
  }

  // Install playlist
  return installPlaylist(playlist, install.path)
}

export const localPlaylist = async (filePath: string) => {
  // Find install path
  const install = await findPath()
  if (
    install.platform === 'unknown' ||
    !install.valid ||
    install.path === null
  ) {
    throw new PlaylistError(ERRORS.INVALID_INSTALL_DIR)
  }

  // Parse file info
  const { base } = path.parse(filePath)

  // Validate file exists
  const fileExists = await fse.exists(filePath)
  if (!fileExists) throw new PlaylistError(`Could not find file ${base}!`)

  // Read and validate file
  const raw = await fse.readFile(filePath, 'utf8')
  const body = JSON.parse(raw)
  const { playlist, error: plError } = resolvePlaylist(base, body)
  if (plError || playlist === undefined) {
    throw new PlaylistError(ERRORS.PLAYLIST_INVALID)
  }

  // Remove original file
  await fse.remove(filePath)

  // Install Playlist
  return installPlaylist(playlist, install.path)
}
