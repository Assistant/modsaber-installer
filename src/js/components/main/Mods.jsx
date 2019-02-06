import React, { Component, Fragment } from 'react'
import Helmet from 'react-helmet'
import Context from '../../Context.jsx'

import { CATEGORY_DEFAULT } from '../../constants'

import '../../../css/scrollbar.css'
import '../../../css/table.css'

class Mods extends Component {
  constructor (props) {
    super(props)

    this.state = {
      /**
       * @type {string[]}
       */
      collapsed: [],
    }
  }

  static contextType = Context

  categorize (mods) {
    const categories = []
    for (const index in mods) {
      const mod = mods[index]
      mod.index = index

      const other = CATEGORY_DEFAULT
      const category = mod.meta.category

      if (!categories.find(x => x.name === category)) categories.push({ name: category, weight: 0, mods: [] })
      const current = categories.find(x => x.name === category)

      current.mods.push(mod)
      if (category !== other) current.weight += mod.meta.weight
      else current.weight -= 10
    }

    categories.sort((a, b) => {
      const weight = (b.weight / b.mods.length) - (a.weight / a.mods.length)

      if (weight !== 0) return weight
      return a.name > b.name ? 1 : b.name > a.name ? -1 : 0
    })

    return [...categories]
  }

  /**
   * @param {string} category Category to toggle
   */
  toggleCategory (category) {
    /**
     * @type {string[]}
     */
    const current = JSON.parse(JSON.stringify(this.state.collapsed))
    const isCollapsed = current.includes(category)

    const collapsed = isCollapsed ?
      current.filter(x => x !== category) :
      [...current, category]

    this.setState({ collapsed })
  }

  render () {
    const categories = this.categorize(this.context.mods)

    return (
      <>
        <Helmet>
          <style>
            { `div.box#main { justify-content: initial; padding: 15px; padding-top: 8px; overflow-y: scroll; }` }
          </style>
        </Helmet>

        <table className='table is-narrow is-fullwidth'>
          <thead>
            <div onClick={ () => { this.context.setSelected(null) } } className='header'></div>
            <tr>
              <th>-<div></div></th>
              <th>Name<div>Name</div></th>
              <th>Author<div>Author</div></th>
              <th>Version<div>Version</div></th>
            </tr>
          </thead>

          <tbody>{ categories.map(({ name, mods }, i) =>
            <Fragment key={ i }>
              <tr onClick={ () => { this.context.setSelected(null) } }>
                <td colSpan={ 5 }>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: i === 0 ? '30px' : undefined }}>
                    <b style={{ marginRight: '12px' }}>
                      <i
                        className={ `fas fa-angle-down collapse${this.state.collapsed.includes(name) ? ' collapsed' : ''}` }
                        onClick={ () => this.toggleCategory(name) }
                      ></i>
                      &nbsp; <span onDoubleClick={ () => this.toggleCategory(name) }>{ name }</span>
                    </b>

                    <div className='separator'></div>
                  </div>
                </td>
              </tr>

              { this.state.collapsed.includes(name) ? null : mods.map((mod, j) => {
                const locked = mod.install.requiredBy.length > 0 || mod.install.conflictsWith.length > 0

                return (
                  <tr
                    key={ j }
                    className={ mod.index !== this.context.selected ? '' : 'selected' }
                    onClick={ e => { if (e.target.type !== 'i') this.context.setSelected(mod.index) } }
                    onDoubleClick={ e => { if (e.target.type !== 'i') this.context.toggleMod(mod.index) } }
                  >
                    <td
                      className={ `icon checkbox${!locked ? '' : ' disabled'}` }
                      onClick={ () => { this.context.toggleMod(mod.index) } }
                    >
                      <i className={ `far fa-${mod.install.selected || mod.install.requiredBy.length > 0 || false ? 'check-square' : 'square'}` }></i>
                    </td>

                    <td className={ `icon locked${!locked ? ' hidden' : ''}` } title={
                      !locked ? undefined : mod.install.selected || mod.install.requiredBy.length > 0 ?
                        'This mod is required!' :
                        'CONFLICT'
                    }>
                      <i className={ `fas fa-lock` }></i>
                    </td>

                    <td className='monospaced'>{ mod.details.title }</td>
                    <td className='monospaced'>{ mod.details.author.name }</td>
                    <td className='monospaced'>{ mod.version }</td>
                  </tr>
                )
              }) }
            </Fragment>
          )}</tbody>
        </table>
      </>
    )
  }
}

export default Mods
