import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

import { ICategory, IMod } from '../../models/modsaber'
import { IState } from '../../store'
import { setSelectedMod, toggleMod } from '../../store/mods'

import Styler from '../utils/Styler'

import { CATEGORY_DEFAULT, STYLE_OVERRIDE } from '../../constants'

import '../../../css/scrollbar.css'
import '../../../css/table.css'

interface IProps {
  mods: IMod[]
  selected: number | null

  setSelectedMod: typeof setSelectedMod
  toggleMod: typeof toggleMod
}

interface ILocalState {
  collapsed: string[]
}

class Mods extends Component<IProps, ILocalState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      collapsed: [],
    }
  }

  public categorize(mods: IMod[]) {
    const categories: ICategory[] = []
    for (const mod of mods) {
      const other = CATEGORY_DEFAULT
      const category = mod.meta.category

      if (!categories.find(x => x.name === category)) {
        categories.push({ name: category, weight: 0, mods: [] })
      }
      const current = categories.find(x => x.name === category) as ICategory

      current.mods.push(mod)
      if (category !== other) current.weight += mod.meta.weight
      else current.weight -= 10
    }

    categories.sort((a, b) => {
      const weight = b.weight / b.mods.length - a.weight / a.mods.length

      if (weight !== 0) return weight
      return a.name > b.name ? 1 : b.name > a.name ? -1 : 0
    })

    return [...categories]
  }

  public toggleCategory(category: string) {
    const current: string[] = JSON.parse(JSON.stringify(this.state.collapsed))
    const isCollapsed = current.includes(category)

    const collapsed = isCollapsed
      ? current.filter(x => x !== category)
      : [...current, category]

    this.setState({ collapsed })
  }

  public render() {
    const categories = this.categorize(this.props.mods)

    return (
      <>
        <Styler content={STYLE_OVERRIDE} />

        <table className='table is-narrow is-fullwidth'>
          <thead>
            <div
              onClick={() => {
                this.props.setSelectedMod(null)
              }}
              className='header'
            />
            <tr>
              <th>
                -<div />
              </th>
              <th>
                Name<div>Name</div>
              </th>
              <th>
                Author<div>Author</div>
              </th>
              <th>
                Version<div>Version</div>
              </th>
            </tr>
          </thead>

          <tbody>
            {categories.map(({ name, mods }, i) => (
              <Fragment key={i}>
                <tr
                  onClick={() => {
                    this.props.setSelectedMod(null)
                  }}
                >
                  <td colSpan={5}>
                    <div
                      style={{
                        alignItems: 'center',
                        display: 'flex',
                        marginTop: i === 0 ? '30px' : undefined,
                      }}
                    >
                      <b style={{ marginRight: '12px' }}>
                        <i
                          className={`fas fa-angle-down collapse${
                            this.state.collapsed.includes(name)
                              ? ' collapsed'
                              : ''
                          }`}
                          onClick={() => this.toggleCategory(name)}
                        />
                        &nbsp;{' '}
                        <span onDoubleClick={() => this.toggleCategory(name)}>
                          {name}
                        </span>
                      </b>

                      <div className='separator' />
                    </div>
                  </td>
                </tr>

                {this.state.collapsed.includes(name)
                  ? null
                  : mods.map((mod, j) => {
                      const locked =
                        mod.install.requiredBy.length > 0 ||
                        mod.install.conflictsWith.length > 0

                      return (
                        <tr
                          key={j}
                          className={
                            mod.index !== this.props.selected ? '' : 'selected'
                          }
                          onClick={e => {
                            const target = e.target as HTMLElement
                            if (target.nodeName !== 'I') {
                              this.props.setSelectedMod(mod.index)
                            }
                          }}
                          onDoubleClick={e => {
                            const target = e.target as HTMLElement
                            if (target.nodeName !== 'I') {
                              this.props.toggleMod(mod.index)
                            }
                          }}
                        >
                          <td
                            className={`icon checkbox${
                              !locked ? '' : ' disabled'
                            }`}
                            onClick={() => {
                              this.props.toggleMod(mod.index)
                            }}
                          >
                            <i
                              className={`far fa-${
                                mod.install.selected ||
                                mod.install.requiredBy.length > 0 ||
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
                                : mod.install.selected ||
                                  mod.install.requiredBy.length > 0
                                ? 'This mod is required!'
                                : 'CONFLICT'
                            }
                          >
                            <i className={`fas fa-lock`} />
                          </td>

                          <td className='monospaced'>{mod.details.title}</td>
                          <td className='monospaced'>
                            {mod.details.author.name}
                          </td>
                          <td className='monospaced'>{mod.version}</td>
                        </tr>
                      )
                    })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </>
    )
  }
}

const mapStateToProps: (state: IState) => IProps = state => ({
  mods: state.mods.list,
  selected: state.mods.selected,

  setSelectedMod,
  toggleMod,
})

export default connect(
  mapStateToProps,
  { setSelectedMod, toggleMod }
)(Mods)
