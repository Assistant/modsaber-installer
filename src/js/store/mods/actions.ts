import { Dispatch } from 'redux'
import semver from 'semver'
import { IState } from '..'
import {
  CATEGORY_DEFAULT,
  ERR_NOT_SATISFIED,
  MODS_DEFAULT,
  MODS_REQUIRED,
} from '../../constants'
import promotions from '../../constants/promotions'
import { IMod } from '../../models/modsaber'
import { dialog, getCurrentWindow, ipcRenderer } from '../../utils/electron'
import { ModsActionTypes } from './types'

export const setModsRaw: (
  raw: IMod[]
) => (dispatch: Dispatch) => void = raw => dispatch => {
  dispatch({
    payload: raw,
    type: ModsActionTypes.SET_MODS_RAW,
  })
}

export const setModsList: (
  list: IMod[]
) => (dispatch: Dispatch) => void = list => dispatch => {
  dispatch({
    payload: list,
    type: ModsActionTypes.SET_MODS_LIST,
  })
}

export const setSelectedMod: (
  idx: number | null
) => (dispatch: Dispatch) => void = idx => dispatch => {
  dispatch({
    payload: idx,
    type: ModsActionTypes.SET_SELECTED_MOD,
  })
}

export const setMods: (
  index: number,
  raw?: IMod[]
) => (dispatch: Dispatch, getState: () => IState) => void = (
  index = 0,
  raw
) => async (dispatch, getState) => {
  if (raw) {
    dispatch({
      payload: raw,
      type: ModsActionTypes.SET_MODS_RAW,
    })
  }

  const rawMods = raw || getState().mods.raw
  const {
    gameVersions: { values: gameVersions },
  } = getState()
  const gameVersion = gameVersions[index] || {}

  const mods = rawMods
    .filter(mod => mod !== null)
    .filter(mod => mod.gameVersion.manifest === gameVersion.manifest)
    .map(mod => {
      mod.meta.category = mod.meta.category || CATEGORY_DEFAULT
      return mod
    })
    .map((mod, idx) => {
      mod.install = {
        conflictsWith: [],
        requiredBy: MODS_REQUIRED.includes(mod.name) ? ['global'] : [],
        selected: false,
      }

      const promo = promotions.find(x => x.modName === mod.name)
      if (promo) mod.promo = promo

      mod.index = idx
      return mod
    })

  dispatch({
    payload: mods,
    type: ModsActionTypes.SET_MODS_LIST,
  })

  dispatch({
    payload: null,
    type: ModsActionTypes.SET_SELECTED_MOD,
  })

  mods
    .filter(x => MODS_DEFAULT.includes(x.name))
    .map(x => x.index)
    .forEach(idx => toggleMod(idx)(dispatch, getState))
}

export const installMods: () => (
  dispatch: Dispatch,
  getState: () => IState
) => void = () => (dispatch, getState) => {
  const {
    install,
    gameVersions,
    mods: { list: mods },
  } = getState()

  const toInstall = mods.filter(
    mod => mod.install.selected || mod.install.requiredBy.length > 0 || false
  )

  const gameVersion = gameVersions.values[gameVersions.selected]
  ipcRenderer.send('install-mods', { mods: toInstall, install, gameVersion })
}

export const toggleMod: (
  index: number
) => (dispatch: Dispatch, getState: () => IState) => void = index => (
  dispatch,
  getState
) => {
  const mods: IMod[] = JSON.parse(JSON.stringify(getState().mods.list))
  const mod = mods[index]

  const locked =
    mod.install.requiredBy.length > 0 || mod.install.conflictsWith.length > 0
  if (locked) return undefined

  mod.install.selected = !mod.install.selected

  const payload = mod.install.selected
    ? checkMod(mod, mods)
    : uncheckMod(mod, mods)

  if (payload === undefined) return undefined

  dispatch({
    payload,
    type: ModsActionTypes.SET_MODS_LIST,
  })
}

const modKey = (mod = { name: 'Unknown', version: '?.?.?' }) =>
  `${mod.name}@${mod.version}`

const checkMod: (mod: IMod, mods: IMod[]) => IMod[] | undefined = (
  mod,
  mods
) => {
  try {
    const depKeys = findLinks(mod, mods, 'dependencies', true) as string[]
    for (const key of depKeys) {
      const [name, version] = key.split('@')
      const depMod = mods.find(x => x.name === name && x.version === version)

      if (depMod === undefined) continue
      depMod.install.requiredBy = [...depMod.install.requiredBy, modKey(mod)]
    }
  } catch (err) {
    if (err.message !== ERR_NOT_SATISFIED) {
      dialog.showErrorBox('Unhandled Exception', err.message)
      return undefined
    }

    dialog.showMessageBox(getCurrentWindow(), {
      message:
        `This mod has an unmet dependency: ${err.link}\n` +
        `Please ask the mod author to update the links to a compatible version.`,
      title: `Unmet Dependency // ${mod.name}@${mod.version}`,
      type: 'error',
    })

    return undefined
  }

  const conflicts = findLinks(mod, mods, 'conflicts', true) as string[]
  for (const conflictKey of conflicts) {
    const [name, version] = conflictKey.split('@')
    const conflict = mods.find(x => x.name === name && x.version === version)
    if (conflict === undefined) continue

    conflict.install.conflictsWith = [
      ...conflict.install.conflictsWith,
      modKey(mod),
    ]

    const selected =
      conflict.install.selected ||
      conflict.install.requiredBy.length > 0 ||
      false
    if (!selected) continue

    dialog.showMessageBox(getCurrentWindow(), {
      message:
        `This mod conflicts with ${conflict.details.title} v${
          conflict.version
        }\n\n` + `Uncheck it and try again!`,
      title: `Conflicting Mod // ${mod.name}@${mod.version}`,
      type: 'error',
    })

    return undefined
  }

  return mods
}

const uncheckMod: (mod: IMod, mods: IMod[]) => IMod[] = (mod, mods) => {
  const key = modKey(mod)
  const otherMods = mods.filter(
    x =>
      x.install.requiredBy.includes(key) ||
      x.install.conflictsWith.includes(key)
  )

  for (const otherMod of otherMods) {
    otherMod.install.requiredBy = otherMod.install.requiredBy.filter(
      x => x !== key
    )

    otherMod.install.conflictsWith = otherMod.install.conflictsWith.filter(
      x => x !== key
    )
  }

  return mods
}

type SearchType = 'dependencies' | 'conflicts'

const findLinks: (
  mod: IMod,
  mods: IMod[],
  type: SearchType,
  keys?: boolean
) => string[] | IMod[] = (mod, mods, type, keys = false) => {
  const modsClone: IMod[] = JSON.parse(JSON.stringify(mods))

  const links =
    type === 'dependencies' ? mod.links.dependencies : mod.links.conflicts
  const recursiveSearch = findLinksR(links, modsClone, type).filter(
    x => x !== modKey(mod)
  )

  if (keys) return recursiveSearch
  const final = recursiveSearch
    .map(key => {
      const [name, version] = key.split('@')
      return modsClone.find(x => x.name === name && x.version === version)
    })
    .filter(x => x !== undefined)

  return final as IMod[]
}

const findLinksR: (
  linksToSearch: string[],
  mods: IMod[],
  type: SearchType,
  li?: string[],
  ch?: string[]
) => string[] = (linksToSearch, mods, type, li, ch) => {
  const links = !li ? [] : [...li]
  const checked = !ch ? [] : [...ch]

  class LinkError extends Error {
    public readonly link: string

    constructor(m: string, link: string) {
      super(m)

      this.link = link
    }
  }

  for (const link of linksToSearch) {
    const [name, range] = link.split('@')
    const search = mods.find(
      x => x.name === name && semver.satisfies(x.version, range)
    )

    // Not satisfied
    if (search === undefined && type === 'dependencies') {
      throw new LinkError(ERR_NOT_SATISFIED, link)
    } else if (search === undefined && type === 'conflicts') {
      continue
    } else if (search === undefined) {
      continue
    }

    // Push link
    const key = modKey(search)
    if (!links.includes(key)) {
      links.push(key)
      checked.push(link)
    }

    // Conflicts only need to check 1 level deep
    if (type === 'conflicts') continue

    const nestedLinks = search.links.dependencies.filter(
      x => !checked.includes(x)
    )

    // Process nested links
    if (nestedLinks.length > 0) {
      const nested = findLinksR(nestedLinks, mods, type, links, checked)

      for (const n of nested) {
        if (!links.includes(n)) links.push(n)
      }
    }
  }

  return links
}
