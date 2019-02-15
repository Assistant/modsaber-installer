import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { ipcRenderer, shell } from '../../utils/electron'

import { IMod } from '../../models/modsaber'
import { IState } from '../../store'
import { IInstallState } from '../../store/install'
import { IJobsState } from '../../store/jobs'
import { IStatusState, setStatus } from '../../store/status'

import Styler from '../utils/Styler'
import Mods from './Mods'
import Status from './Status'

import {
  AUTO_UPDATE_JOB,
  Status as StatusType,
  StatusText,
} from '../../constants'

const piracyLink = () => {
  const links = ['https://youtu.be/i8ju_10NkGY', 'https://youtu.be/C5kGCwJ25Yc']

  return links[Math.floor(Math.random() * links.length)]
}

interface IProps {
  install: IInstallState
  jobs: IJobsState
  mods: IMod[]
  status: IStatusState
  setStatus: typeof setStatus
}

const mainStyles = '* { cursor: progress !important; }'

const Main: FunctionComponent<IProps> = props => {
  if (props.jobs.length > 0 || props.status.type === StatusType.LOADING) {
    return (
      <>
        <Status spin={true}>
          {props.jobs.includes(AUTO_UPDATE_JOB)
            ? 'Updating Installer'
            : props.status.type === StatusType.LOADING
            ? 'Loading'
            : 'Working'}
          ...
        </Status>

        <Styler content={mainStyles} />
      </>
    )
  }

  if (props.install.pirated) {
    return (
      <Status icon='fas fa-exclamation-triangle'>
        Pirated Copy Detected
        <br />
        <a
          href='/'
          onClick={e => {
            e.preventDefault()
            shell.openExternal(piracyLink())
          }}
        >
          Override Restriction
        </a>
      </Status>
    )
  }

  if (props.status.type === StatusType.OFFLINE) {
    return (
      <Status icon='fas fa-exclamation-triangle'>
        Connection Error
        <br />
        <a
          href='/'
          onClick={e => {
            e.preventDefault()
            ipcRenderer.send('get-remote')

            props.setStatus(StatusType.LOADING, StatusText.LOADING)
          }}
        >
          Retry
        </a>
      </Status>
    )
  }

  if (props.mods.length === 0) {
    return <Status icon='fas fa-exclamation-triangle'>No Mods</Status>
  }

  return <Mods />
}

const mapStateToProps: (state: IState) => IProps = state => ({
  install: state.install,
  jobs: state.jobs,
  mods: state.mods.list,
  setStatus,
  status: state.status,
})

export default connect(
  mapStateToProps,
  { setStatus }
)(Main)
