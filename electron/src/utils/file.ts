import fs, { PathLike } from 'fs'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'
import { promisify } from 'util'
const access = promisify(fs.access)
const stat = promisify(fs.stat)

const exists = async (path: PathLike) => {
  try {
    await access(path, fs.constants.F_OK)
    return true
  } catch (err) {
    if (err.code === 'ENOENT') return false
    else throw err
  }
}

const isFile = async (path: PathLike) => {
  const stats = await stat(path)
  return stats.isFile()
}

module.exports = {
  access,
  copyFile: promisify(fs.copyFile),
  ensureDir: promisify(mkdirp),
  exists,
  glob: promisify(require('glob')),
  isFile,
  readDir: promisify(fs.readdir),
  readFile: promisify(fs.readFile),
  remove: promisify(fs.unlink),
  rename: promisify(fs.rename),
  rmDir: promisify(rimraf),
  stat,
  writeFile: promisify(fs.writeFile),
}
