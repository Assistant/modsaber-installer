interface IFiles {
  url: string
  hash: string
  files: any
}

export interface IMod {
  name: string
  version: string
  files: {
    steam: IFiles
    oculus?: IFiles
  }
  approval: {
    status: 'pending' | 'approved' | 'denied'
    modified: string
  }
  gameVersion: {
    value: string
    manifest: string
  }
}

export interface IGameVersion {
  id: string
  value: string
  manifest: string
  selected: boolean
}
