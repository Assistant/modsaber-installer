import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { shell } from '../utils/electron'

import { IMod } from '../models/modsaber'
import { IState } from '../store'
import { IContainerState } from '../store/container'
import { IJobsState } from '../store/jobs'
import { installMods } from '../store/mods'
import { IStatusState } from '../store/status'
import { ITabsState, setCurrentTab, setMaxTabs } from '../store/tabs'

import { Status } from '../constants'

interface IProps {
  container: IContainerState
  jobs: IJobsState
  mods: IMod[]
  pirated: boolean
  selected: number | null
  status: IStatusState
  tabs: ITabsState

  installMods: typeof installMods
  setCurrentTab: typeof setCurrentTab
  setMaxTabs: typeof setMaxTabs
}

const BottomBar: FunctionComponent<IProps> = props => {
  const handleModInfo = () => {
    const tab = props.tabs.current !== props.tabs.max ? props.tabs.max : 0

    if (props.container !== null) props.container.scrollTop = 0
    props.setCurrentTab(tab)
  }

  return (
    <>
      <span className='status'>
        {props.status.type === Status.OFFLINE ? 'Error' : 'Status'}:{' '}
        {props.status.text}
      </span>

      <button
        className='button'
        disabled={props.pirated || props.selected === null}
        onClick={() => handleModInfo()}
      >
        {props.tabs.current !== props.tabs.max
          ? 'View Selected Mod Info'
          : 'Go Back'}
      </button>

      {props.pirated ? (
        <button
          className='button'
          onClick={() => shell.openExternal('https://beatgames.com/')}
        >
          Buy the Game
        </button>
      ) : (
        <button
          className={`button${props.jobs.length > 0 ? ' is-loading' : ''}`}
          disabled={
            props.jobs.length > 0 ||
            props.status.type === Status.LOADING ||
            props.mods.length === 0
          }
          onClick={() => {
            props.installMods()
          }}
        >
          Install / Update
        </button>
      )}
    </>
  )
}

const mapStateToProps: (state: IState) => IProps = state => ({
  container: state.container,
  jobs: state.jobs,
  mods: state.mods.list,
  pirated: state.install.pirated,
  selected: state.mods.selected,
  status: state.status,
  tabs: state.tabs,

  installMods,
  setCurrentTab,
  setMaxTabs,
})

export default connect(
  mapStateToProps,
  { installMods, setCurrentTab, setMaxTabs }
)(BottomBar)
