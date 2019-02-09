import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ipcRenderer } from '../../utils/electron'
import { openLog, uploadLog } from '../../utils/logs'

import { IState } from '../../store'
import { IInstallState } from '../../store/install'
import { IJobsState } from '../../store/jobs'
import { IMiscState, toggleTheme } from '../../store/misc'
import { IStatusState } from '../../store/status'

import { Status } from '../../constants'

interface IProps {
  install: IInstallState
  jobs: IJobsState
  status: IStatusState
  theme: IMiscState['theme']

  toggleTheme: typeof toggleTheme
}

class Tools extends Component<IProps> {
  public render() {
    const working = this.props.jobs.length > 0
    const disabled = working || this.props.status.type === Status.LOADING

    return (
      <>
        <div className='content tools'>
          <h1>Theme</h1>
          <button className='button' onClick={() => this.props.toggleTheme()}>
            Activate {this.props.theme === 'dark' ? 'Light' : 'Dark'} Theme
          </button>

          <hr />
          <h1>Diagnostics</h1>
          <button
            className={`button${working ? ' is-loading' : ''}`}
            disabled={disabled}
            onClick={() => ipcRenderer.send('run-diagnostics')}
          >
            Run Diagnostics
          </button>
          <button
            className={`button${working ? ' is-loading' : ''}`}
            disabled={disabled}
            onClick={() => ipcRenderer.send('patch-game', this.props.install)}
          >
            Patch Game
          </button>

          <hr />
          <h1>ModSaber Installer Log</h1>
          <button className='button' onClick={() => openLog()}>
            Open Log
          </button>
          <button className='button' onClick={() => uploadLog()}>
            Upload Log
          </button>
        </div>
      </>
    )
  }
}

const mapStateToProps: (state: IState) => IProps = state => ({
  install: state.install,
  jobs: state.jobs,
  status: state.status,
  theme: state.misc.theme,

  toggleTheme,
})

export default connect(
  mapStateToProps,
  { toggleTheme }
)(Tools)
