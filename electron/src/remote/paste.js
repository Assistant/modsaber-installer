const fetch = require('../utils/fetch.js')
const { HASTE_URL } = require('../constants.js')

/**
 * Upload text to a Hastebin compatible clone
 * @param {string} body Paste Body
 * @param {string} [ext] File Extension
 * @returns {Promise.<string>}
 */
const uploadPaste = async (body, ext) => {
  const resp = await fetch(`${HASTE_URL}/documents`, {
    method: 'POST',
    body,
  })

  const { key } = await resp.json()
  return `${HASTE_URL}/${key}${ext !== undefined ? `.${ext}` : ''}`
}

module.exports = { uploadPaste }
