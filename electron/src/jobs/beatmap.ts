import log from 'electron-log'
import fileType from 'file-type'
import path from 'path'
import { ERRORS } from '../constants'
import { saveBeatmap } from '../logic/beatmap'
import { findPath } from '../logic/pathFinder'
import { fromHash, fromID, inputType } from '../remote/beatsaver'
import { safeDownload } from '../remote/remote'
import fse from '../utils/file'
import { getActiveWindow } from '../utils/window'
import { JobError } from './job'

class BeatmapError extends JobError {
  constructor(message: string, status?: string, title?: string) {
    super(message, status, title || 'Beatmap Install Error')
  }
}

export const beatSaverBeatmap = async (input?: string) => {
  // Window Details
  const { sender } = getActiveWindow()

  // Find install path
  const install = await findPath()
  if (
    install.platform === 'unknown' ||
    !install.valid ||
    install.path === null
  ) {
    throw new BeatmapError(ERRORS.INVALID_INSTALL_DIR)
  }

  // Validate input type
  const type = inputType(input)
  if (type === 'invalid' || input === undefined) {
    throw new BeatmapError('Invalid Song ID / Hash!')
  }

  // Download song info
  sender.send('set-status', { text: 'Downloading song info...' })
  const { error, song } = await (type === 'hash'
    ? fromHash(input)
    : fromID(input))
  if (error || song === null) {
    throw new BeatmapError(`Song Not Found!\nFailed to find "${input}"`)
  }

  // Download song zip
  sender.send('set-status', { text: 'Downloading song zip...' })
  const zip = await safeDownload(song.downloadUrl, true)
  if (zip.error) {
    log.error(zip.error)
    throw new BeatmapError('Song Download Failed!')
  }

  try {
    await saveBeatmap(zip.body, song.key, install.path)
    return undefined
  } catch (err) {
    log.error(err)
    throw new BeatmapError('Extraction Failure!')
  }
}

export const fileBeatmap = async (filePath: string) => {
  // Find install path
  const install = await findPath()
  if (
    install.platform === 'unknown' ||
    !install.valid ||
    install.path === null
  ) {
    throw new BeatmapError(ERRORS.INVALID_INSTALL_DIR)
  }

  // Parse file info
  const { base, name } = path.parse(filePath)

  // Validate file exists
  const fileExists = await fse.exists(filePath)
  if (!fileExists) throw new BeatmapError(`Could not find file ${base}!`)

  // Read and validate file
  const zip = await fse.readFile(filePath)
  const fType = fileType(zip)
  if (fType === null || fType.mime !== 'application/zip') {
    throw new BeatmapError('File is not a Beatmap zip!')
  }

  // Delete and install
  await fse.remove(filePath)
  await saveBeatmap(zip, name, install.path)
  return undefined
}
