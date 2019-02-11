import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { ipcRenderer } from '../../utils/electron'
import { openLog, uploadLog } from '../../utils/logs'

import { IState } from '../../store'
import { IInstallState } from '../../store/install'
import { IMiscState, toggleTheme } from '../../store/misc'

import { Status } from '../../constants'

interface IProps {
  install: IInstallState
  theme: IMiscState['theme']
  working: boolean
  disabled: boolean

  toggleTheme: typeof toggleTheme
}

const Tools: FunctionComponent<IProps> = props => (
  <>
    <div className='content tools'>
      <h1>Theme</h1>
      <button className='button' onClick={() => props.toggleTheme()}>
        Activate {props.theme === 'dark' ? 'Light' : 'Dark'} Theme
      </button>

      <hr />
      <h1>Diagnostics</h1>
      <button
        className={`button${props.working ? ' is-loading' : ''}`}
        disabled={props.disabled}
        onClick={() => ipcRenderer.send('run-diagnostics')}
      >
        Run Diagnostics
      </button>
      <button
        className={`button${props.working ? ' is-loading' : ''}`}
        disabled={props.disabled}
        onClick={() => ipcRenderer.send('patch-game', props.install)}
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

const mapStateToProps: (state: IState) => IProps = state => ({
  disabled: state.jobs.length > 0 || state.status.type === Status.LOADING,
  install: state.install,
  theme: state.misc.theme,
  working: state.jobs.length > 0,

  toggleTheme,
})

export default connect(
  mapStateToProps,
  { toggleTheme }
)(Tools)
