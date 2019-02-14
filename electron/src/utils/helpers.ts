import { createHash } from 'crypto'

export const calculateHash = (data: Buffer) =>
  new Promise(resolve => {
    const hash = createHash('sha1')
    hash.update(data)

    resolve(hash.digest('hex'))
  })

interface IHandlerSuccess<T> {
  error: false
  result: T
}

interface IHandlerError {
  error: Error
  result: undefined
}

type HandlerResult<T> = IHandlerError | IHandlerSuccess<T>

export const promiseHandler = async <T>(
  promise: Promise<T>
): Promise<HandlerResult<T>> => {
  try {
    const result = await promise
    return { error: false, result }
  } catch (error) {
    return { error, result: undefined }
  }
}
