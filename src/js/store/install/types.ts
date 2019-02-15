export enum InstallActionTypes {
  SET_INSTALL = '@@install/SET_INSTALL',
  SET_INSTALL_PATH = '@@install/SET_INSTALL_PATH',
  SET_INSTALL_PLATFORM = '@@install/SET_INSTALL_PLATFORM',
}

export type InstallPlatform = 'steam' | 'oculus' | 'unknown'

export interface IInstallState {
  path: string | null
  platform: InstallPlatform
  pirated: boolean
}
