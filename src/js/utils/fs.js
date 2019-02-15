import { remote } from './electron'

/**
 * @type {import("fs")}
 */
const fs = remote.require('fs')
export default fs
