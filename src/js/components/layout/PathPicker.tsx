import React, { Component } from 'react'
import { connect } from 'react-redux'
import { dialog, getCurrentWindow, ipcRenderer } from '../../utils/electron'

import { IGameVersion } from '../../models/modsaber'
import { IState } from '../../store'
import {
  IGameVersionState,
  setSelectedGameVersion,
} from '../../store/gameVersions'
import { IInstallState } from '../../store/install'
import { IJobsState } from '../../store/jobs'
import { setMods } from '../../store/mods'
import { IStatusState } from '../../store/status'

import { Status } from '../../constants'

interface IProps {
  gameVersions: IGameVersionState['values']
  selected: IGameVersionState['selected']
  install: IInstallState
  jobs: IJobsState
  status: IStatusState

  setSelectedGameVersion: typeof setSelectedGameVersion
  setMods: typeof setMods
}

class PathPicker extends Component<IProps> {
  public componentDidMount() {
    ipcRenderer.on('invalid-path', (_: any, path: string) => {
      dialog.showMessageBox(
        getCurrentWindow(),
        {
          message:
            "The directory you selected doesn't contain Beat Saber.exe!\nPlease try again.",
          title: 'Invalid Path',
          type: 'error',
        },
        () => {
          this.openDialog(path)
        }
      )
    })

    ipcRenderer.on('unknown-path', () => {
      dialog.showMessageBox(
        getCurrentWindow(),
        {
          message:
            'We could not automatically find your Beat Saber install folder.\nPlease select it manually.',
          title: 'Unknown Install Directory',
          type: 'error',
        },
        () => {
          this.openDialog()
        }
      )
    })
  }

  public openDialog(defaultPath?: string) {
    dialog.showOpenDialog(
      getCurrentWindow(),
      {
        defaultPath: defaultPath || this.props.install.path || undefined,
        properties: ['openDirectory'],
      },
      paths => {
        if (paths === undefined) return
        const [path] = paths
        ipcRenderer.send('set-path', path)
      }
    )
  }

  public switchVersion(manifest: IGameVersion['manifest']) {
    const idx = this.props.gameVersions.findIndex(x => x.manifest === manifest)

    this.props.setSelectedGameVersion(idx)
    this.props.setMods(idx)
  }

  public render() {
    return (
      <>
        <div className='field is-expanded has-addons' style={{ flexGrow: 1 }}>
          <div className='control has-icons-left is-fullwidth'>
            <input
              type='text'
              className='input monospaced'
              readOnly={true}
              value={this.props.install.path || ''}
            />

            <span className='icon is-left'>
              <i className='far fa-folder-open' />
            </span>
          </div>

          <div className='control'>
            <button
              className='button'
              onClick={() => {
                this.openDialog()
              }}
            >
              ..
            </button>
          </div>
        </div>

        <div
          className='select'
          style={{ marginLeft: '10px' }}
          onChange={e => {
            const target = e.target as HTMLOptionElement
            this.switchVersion(target.value)
          }}
        >
          <select
            disabled={
              this.props.jobs.length > 0 ||
              this.props.status.type === Status.LOADING ||
              this.props.status.type === Status.OFFLINE
            }
          >
            {this.props.gameVersions.map((gv, i) => (
              <option value={gv.manifest} key={i}>
                {gv.value}
              </option>
            ))}
          </select>
        </div>
      </>
    )
  }
}

const mapStateToProps: (state: IState) => IProps = state => ({
  gameVersions: state.gameVersions.values,
  install: state.install,
  jobs: state.jobs,
  selected: state.gameVersions.selected,
  status: state.status,

  setMods,
  setSelectedGameVersion,
})

export default connect(
  mapStateToProps,
  { setSelectedGameVersion, setMods }
)(PathPicker)
