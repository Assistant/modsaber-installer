import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'

import { IMod } from '../../models/modsaber'
import { IState } from '../../store'

import MarkdownRenderer from '../utils/Markdown'

interface IProps {
  mod: IMod
}

const ModInfo: FunctionComponent<IProps> = ({ mod }) => (
  <>
    <div className='content'>
      <h1>{mod.details.title}</h1>
      <hr />

      <MarkdownRenderer source={mod.details.description} />
    </div>
  </>
)

const mapStateToProps: (state: IState) => IProps = state => ({
  mod: state.mods.list[state.mods.selected as number],
})

export default connect(mapStateToProps)(ModInfo)
