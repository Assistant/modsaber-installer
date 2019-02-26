import { IPromotion } from '../constants/promotions'

export interface IGameVersion {
  id: string
  value: string
  manifest: string
}

export interface IFiles {
  hash: string
  url: string
  files: any
}

export interface IMod {
  index: number
  name: string
  version: string

  details: {
    author: {
      name: string
      id: string
    }
    title: string
    description: string
    published: string | Date
  }

  approval: {
    status: 'pending' | 'approved' | 'denied'
    reason: string | null
    modified: string | Date
  }

  meta: {
    type: 'mod'
    weight: number
    category: string
  }

  gameVersion: IGameVersion
  oldVersions: string[]
  links: {
    dependencies: string[]
    conflicts: string[]
  }

  files: {
    steam: IFiles
    oculus?: IFiles
  }

  install: {
    conflictsWith: string[]
    requiredBy: string[]
    selected: boolean
  }

  promo?: IPromotion
}

export interface ICategory {
  name: string
  weight: number
  mods: IMod[]
}
