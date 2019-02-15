import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { IMod } from '../../../models/modsaber'
import { IState } from '../../../store'
import { setSelectedMod, toggleMod } from '../../../store/mods'

interface IPassedProps {
  mod: IMod
}

interface IMappedProps {
  selected: number | null

  setSelectedMod: typeof setSelectedMod
  toggleMod: typeof toggleMod
}

type IProps = IPassedProps & IMappedProps

const Mod: FunctionComponent<IProps> = props => {
  const locked =
    props.mod.install.requiredBy.length > 0 ||
    props.mod.install.conflictsWith.length > 0

  return (
    <tr
      className={props.mod.index !== props.selected ? '' : 'selected'}
      onClick={e => {
        const target = e.target as HTMLElement
        if (target.nodeName !== 'I') {
          props.setSelectedMod(props.mod.index)
        }
      }}
      onDoubleClick={e => {
        const target = e.target as HTMLElement
        if (target.nodeName !== 'I') {
          props.toggleMod(props.mod.index)
        }
      }}
    >
      <td
        className={`icon checkbox${!locked ? '' : ' disabled'}`}
        onClick={() => {
          props.toggleMod(props.mod.index)
        }}
      >
        <i
          className={`far fa-${
            props.mod.install.selected ||
            props.mod.install.requiredBy.length > 0 ||
            false
              ? 'check-square'
              : 'square'
          }`}
        />
      </td>

      <td
        className={`icon locked${!locked ? ' hidden' : ''}`}
        title={
          !locked
            ? undefined
            : props.mod.install.selected ||
              props.mod.install.requiredBy.length > 0
            ? 'This mod is required!'
            : 'CONFLICT'
        }
      >
        <i className={`fas fa-lock`} />
      </td>

      <td className='monospaced'>{props.mod.details.title}</td>
      <td className='monospaced'>{props.mod.details.author.name}</td>
      <td className='monospaced'>{props.mod.version}</td>
    </tr>
  )
}

const mapStateToProps: (state: IState, ownProps: IPassedProps) => IProps = (
  state,
  ownProps
) => ({
  mod: ownProps.mod,
  selected: state.mods.selected,

  setSelectedMod,
  toggleMod,
})

export default connect(
  mapStateToProps,
  { setSelectedMod, toggleMod }
)(Mod)
