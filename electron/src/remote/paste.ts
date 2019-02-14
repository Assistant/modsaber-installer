import { HASTE_URL } from '../constants'
import { fetch } from '../utils/fetch'

/**
 * Upload text to a Hastebin compatible clone
 */
export const uploadPaste = async (body: string, ext?: string) => {
  const resp = await fetch(`${HASTE_URL}/documents`, {
    body,
    method: 'POST',
  })

  const { key } = await resp.json()
  return `${HASTE_URL}/${key}${ext !== undefined ? `.${ext}` : ''}`
}
