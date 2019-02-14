import { ISong } from '../models/beatsaver'
import { safeDownload } from './remote'

type SongIDType = 'id' | 'hash' | 'invalid'

export const inputType = (input?: string): SongIDType => {
  if (input === undefined) return 'invalid'

  const idRx = /^[0-9]{1,5}(?:-[0-9]{1,5})?$/g
  const hashRx = /^[a-f0-9]{32}$/i

  return idRx.test(input) ? 'id' : hashRx.test(input) ? 'hash' : 'invalid'
}

interface ISongFetchError {
  error: true
  song: null
}

interface ISongFetchResult {
  error: false
  song: ISong
}

type ISongFetch = ISongFetchError | ISongFetchResult

export const fromID = async (id: string): Promise<ISongFetch> => {
  const { error, body } = await safeDownload(
    `https://beatsaver.com/api/songs/detail/${id}`
  )

  if (error) return { error: true, song: null }
  else return { error: false, song: body.song }
}

export const fromHash = async (hash: string): Promise<ISongFetch> => {
  const { error, body } = await safeDownload(
    `https://beatsaver.com/api/songs/search/hash/${hash}`
  )

  if (error) return { error: true, song: null }
  else return { error: false, song: body.songs[0] }
}
