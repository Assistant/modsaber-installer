import React, { Component } from 'react'
import Konami from 'react-konami-code'
import { connect } from 'react-redux'
import { ipcRenderer } from './utils/electron'

import { IGameVersion, IMod } from './models/modsaber'
import { IState } from './store'
import { setGameVersions } from './store/gameVersions'
import { IInstallState, setInstall } from './store/install'
import { dequeueJob, enqueueJob } from './store/jobs'
import { loadTheme, toggleTheme } from './store/misc'
import { setMods, toggleMod } from './store/mods'
import { setStatus, setStatusText, setStatusType } from './store/status'

import { Status, StatusText } from './constants'

interface IProps {
  selected: number | null
  gvSelected: number

  dequeueJob: typeof dequeueJob
  enqueueJob: typeof enqueueJob
  loadTheme: typeof loadTheme
  setGameVersions: typeof setGameVersions
  setInstall: typeof setInstall
  setMods: typeof setMods
  setStatus: typeof setStatus
  setStatusText: typeof setStatusText
  setStatusType: typeof setStatusType
  toggleMod: typeof toggleMod
  toggleTheme: typeof toggleTheme
}

class Events extends Component<IProps> {
  constructor(props: IProps) {
    super(props)

    ipcRenderer.on(
      'set-status',
      (
        _: any,
        { status: type, text }: { status: Status; text: StatusText }
      ) => {
        if (type) this.props.setStatusType(type)
        if (text) this.props.setStatusText(text)
      }
    )

    ipcRenderer.on('set-path', (_: any, install: IInstallState) =>
      this.props.setInstall(install)
    )
    ipcRenderer.on(
      'set-remote',
      (
        _: any,
        {
          status,
          statusText,
          mods,
          gameVersions,
        }: {
          status: 'error' | 'success'
          statusText: StatusText
          mods: IMod[]
          gameVersions: IGameVersion[]
        }
      ) => {
        if (status === 'error') {
          return this.props.setStatus(Status.OFFLINE, statusText)
        }

        this.props.setStatus(Status.LOADED, StatusText.LOADED)
        this.props.setGameVersions(gameVersions)
        this.props.setMods(this.props.gvSelected, mods)

        return undefined
      }
    )

    ipcRenderer.on(
      'queue-job',
      async (
        _: any,
        {
          id,
          task,
          noonce,
        }: { id: string; task: 'enqueue' | 'queue'; noonce: string }
      ) => {
        const resp = await (task === 'enqueue'
          ? this.props.enqueueJob(id)
          : this.props.dequeueJob(id))
        ipcRenderer.send('queue-job-resp', { id: resp, noonce })
      }
    )

    window.addEventListener('keydown', ev => {
      if (ev.key !== ' ') return undefined
      if (this.props.selected === null) return undefined

      this.props.toggleMod(this.props.selected)

      ev.preventDefault()
      return false
    })
  }

  public componentDidMount() {
    ipcRenderer.send('get-path')
    ipcRenderer.send('get-remote')

    this.props.loadTheme()
    this.props.setStatusText(StatusText.LOADING)
  }

  public render() {
    return (
      <>
        {this.props.children}

        <Konami action={() => this.props.toggleTheme()} />
      </>
    )
  }
}

const mapStateToProps: (state: IState) => IProps = state => ({
  gvSelected: state.gameVersions.selected,
  selected: state.mods.selected,

  dequeueJob,
  enqueueJob,
  loadTheme,
  setGameVersions,
  setInstall,
  setMods,
  setStatus,
  setStatusText,
  setStatusType,
  toggleMod,
  toggleTheme,
})

export default connect(
  mapStateToProps,
  {
    dequeueJob,
    enqueueJob,
    loadTheme,
    setGameVersions,
    setInstall,
    setMods,
    setStatus,
    setStatusText,
    setStatusType,
    toggleMod,
    toggleTheme,
  }
)(Events)
