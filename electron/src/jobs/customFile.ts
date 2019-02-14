import path from 'path'
import { parse as parseURL } from 'url'
import { CUSTOM_FILE_DIRS, ERRORS } from '../constants'
import { findPath } from '../logic/pathFinder'
import { fetch } from '../utils/fetch'
import fse from '../utils/file'
import { calculateHash } from '../utils/helpers'
import { getActiveWindow } from '../utils/window'
import { JobError } from './job'

export class CustomFileError extends JobError {
  constructor(message: string, status?: string, title?: string) {
    super(message, status, title || 'File Install Error')
  }
}

export const handleCustomFile = async (input: string, remote = false) => {
  // Window Details
  const { sender } = getActiveWindow()

  // Find install path
  const install = await findPath()
  if (
    install.platform === 'unknown' ||
    !install.valid ||
    install.path === null
  ) {
    throw new CustomFileError(ERRORS.INVALID_INSTALL_DIR)
  }

  // Parse file info
  const { base, ext } = path.parse(input)
  const fileName = decodeURIComponent(base)

  if (!remote) {
    // Validate file exists
    const fileExists = await fse.exists(input)
    if (!fileExists) {
      throw new CustomFileError(`Could not find file ${fileName}!`)
    }
  } else {
    // Validate file is trustworthy
    const { hostname } = parseURL(input)
    if (hostname !== 'modelsaber.com') {
      throw new CustomFileError(ERRORS.CUSTOM_FILE_UNTRUSTED)
    }
  }

  // Validate file type
  const dir = CUSTOM_FILE_DIRS[ext]
  if (dir === undefined) {
    throw new CustomFileError(`File extension ${ext} not supported.`)
  }

  // Read file
  const data = await getData(input, remote)

  // Create the directory if it doesn't exist
  const installDir = path.join(install.path, dir)
  const installPath = path.join(installDir, fileName)
  await fse.ensureDir(installDir)

  // Hash Compare
  if (await fse.exists(installPath)) {
    const currentData = await fse.readFile(installPath)
    const [currentHash, newHash] = await Promise.all([
      calculateHash(currentData),
      calculateHash(data),
    ])

    if (currentHash === newHash) {
      throw new CustomFileError(`${fileName} is already installed!`)
    }
  }

  // Write file
  await fse.writeFile(installPath, data)
  if (!remote) await fse.remove(input)

  // Set status
  sender.send('set-status', { text: `Installed ${base} successfully!` })
  return undefined
}

const getData = async (input: string, remote: boolean) => {
  if (!remote) return fse.readFile(input)

  const resp = await fetch(input)
  const body = await resp.buffer()

  return body
}
