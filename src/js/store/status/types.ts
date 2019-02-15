import { Status, StatusText } from '../../constants'

export enum StatusActionTypes {
  SET_STATUS = '@@status/SET_STATUS',
  SET_STATUS_TYPE = '@@status/SET_STATUS_TYPE',
  SET_STATUS_TEXT = '@@status/SET_STATUS_TEXT',
}

export interface IStatusState {
  type: Status
  text: StatusText
}
