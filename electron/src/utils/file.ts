import fs, { PathLike } from 'fs'
import { default as globb } from 'glob'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'
import { promisify } from 'util'

export const exists = async (path: PathLike) => {
  try {
    await access(path, fs.constants.F_OK)
    return true
  } catch (err) {
    if (err.code === 'ENOENT') return false
    else throw err
  }
}

export const isFile = async (path: PathLike) => {
  const stats = await stat(path)
  return stats.isFile()
}

export const access = promisify(fs.access)
export const stat = promisify(fs.stat)
export const copyFile = promisify(fs.copyFile)
export const ensureDir = promisify(mkdirp)
export const glob = promisify(globb)
export const readDir = promisify(fs.readdir)
export const readFile = promisify(fs.readFile)
export const remove = promisify(fs.unlink)
export const rename = promisify(fs.rename)
export const rmDir = promisify(rimraf)
export const writeFile = promisify(fs.writeFile)

const fse = {
  access,
  copyFile,
  ensureDir,
  exists,
  glob,
  isFile,
  readDir,
  readFile,
  remove,
  rename,
  rmDir,
  stat,
  writeFile,
}

export default fse
