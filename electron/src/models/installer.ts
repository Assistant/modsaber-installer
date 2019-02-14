export type InstallPlatform = 'steam' | 'oculus' | 'unknown'

export interface IInstall {
  path: string | null
  valid: boolean
  pirated: boolean
  platform: InstallPlatform
}
