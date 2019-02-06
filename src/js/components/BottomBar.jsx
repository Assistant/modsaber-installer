import React, { Component } from 'react'
import { shell } from '../utils/electron'
import Context from '../Context.jsx'

import { STATUS_LOADING, STATUS_OFFLINE } from '../constants'

class BottomBar extends Component {
  static contextType = Context

  handleModInfo () {
    const page = this.context.currentPage !== this.context.maxPages ?
      this.context.maxPages : 0

    if (this.context.container !== undefined) this.context.container.scrollTop = 0
    return this.context.setCurrentPage(page)
  }

  render () {
    return (
      <>
        <span className='status'>
          { this.context.status === STATUS_OFFLINE ? 'Error' : 'Status' }: { this.context.statusText }
        </span>

        <button
          className='button'
          disabled={ this.context.install.pirated || this.context.selected === null }
          onClick={ () => this.handleModInfo() }
        >
          { this.context.currentPage !== this.context.maxPages ? 'View Selected Mod Info' : 'Go Back' }
        </button>

        {
          this.context.install.pirated ?
            <button className='button' onClick={ () => shell.openExternal('https://beatgames.com/') }>Buy the Game</button> :
            <button
              className={ `button${this.context.jobs.length > 0 ? ' is-loading' : ''}` }
              disabled={
                this.context.jobs.length > 0 ||
                this.context.status === STATUS_LOADING ||
                this.context.mods.length === 0
              }
              onClick={ () => { this.context.installMods() } }
            >
            Install / Update
            </button>
        }
      </>
    )
  }
}

export default BottomBar
