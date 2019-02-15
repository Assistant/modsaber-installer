import { IGameVersion } from '../../models/modsaber'

export enum GameVersionActionTypes {
  SET_GAME_VERSIONS = '@@gameVersions/SET_GAME_VERSIONS',
  SET_SELECTED_GAME_VERSION = '@@gameVersions/SET_SELECTED_GAME_VERSION',
}

export interface IGameVersionState {
  values: IGameVersion[]
  selected: number
}
