import React, { Component } from 'react'
import Helmet from 'react-helmet'

import * as c from '../../constants.js'

import Context from '../../Context.jsx'
import Status from './Status.jsx'
import Mods from './Mods.jsx'

const funLinks = [
  'https://youtu.be/i8ju_10NkGY',
  'https://youtu.be/C5kGCwJ25Yc',
]

const funLink = () => funLinks[Math.floor(Math.random() * funLinks.length)]

/**
 * @type {Electron}
 */
const electron = window.require('electron')
const { shell, ipcRenderer } = electron

class Main extends Component {
  static contextType = Context

  render () {
    if (this.context.jobs.length > 0 || this.context.status === c.STATUS_LOADING) {
      return (
        <>
          <Status spin>
            {
              this.context.jobs.includes(c.AUTO_UPDATE_JOB) ? 'Updating Installer' :
                this.context.status === c.STATUS_LOADING ?
                  'Loading' :
                  'Working'
            }...
          </Status>
          <Helmet>
            <style>{`* { cursor: progress !important; }`}</style>
          </Helmet>
        </>
      )
    }

    if (this.context.install.pirated) {
      return (
        <Status icon='fas fa-exclamation-triangle'>
          Pirated Copy Detected<br />
          <a href='/' onClick={ e => {
            e.preventDefault()
            shell.openExternal(funLink())
          } }>
            Override Restriction
          </a>
        </Status>
      )
    }

    if (this.context.status === c.STATUS_OFFLINE) {
      return (
        <Status icon='fas fa-exclamation-triangle'>
          Connection Error<br />
          <a href='/' onClick={ e => {
            e.preventDefault()
            ipcRenderer.send('get-remote')

            this.context.setStatus(c.STATUS_LOADING)
            this.context.setStatusText(c.STATUS_TEXT_LOADING)
          } }>
            Retry
          </a>
        </Status>
      )
    }

    if (this.context.mods.length === 0) {
      return <Status icon='fas fa-exclamation-triangle'>No Mods</Status>
    }

    return <Mods />
  }
}

export default Main
