import { IMod } from '../../models/modsaber'

export enum ModsActionTypes {
  SET_MODS_RAW = '@@mods/SET_MODS_RAW',
  SET_MODS_LIST = '@@mods/SET_MODS_LIST',
  SET_SELECTED_MOD = '@@mods/SET_SELECTED_MOD',
}

export interface IModsState {
  raw: IMod[]
  list: IMod[]
  selected: number | null
}
