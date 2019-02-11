import React, { Component } from 'react'
import Konami from 'react-konami-code'

import Icon from '../../../img/icon.png'

interface IProps {
  children: React.ReactNode
}

interface ILocalState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null

  easterEgg: boolean
}

class ErrorBoundary extends Component<IProps, ILocalState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      error: null,
      errorInfo: null,
      hasError: false,

      easterEgg: false,
    }
  }

  public componentDidCatch(error: Error | null, info: React.ErrorInfo) {
    this.setState({ hasError: true, error, errorInfo: info })
  }

  public render() {
    if (!this.state.error) return this.props.children

    const { easterEgg } = this.state
    const NAME = easterEgg ? 'ModSabew Inystawwer' : 'ModSaber Installer'
    const ERROR = easterEgg
      ? 'has found an oopsie woopsie.'
      : 'has encountered an error.'
    const RESTART = easterEgg
      ? "Pwease westawt anyd maybe it'll have sowted itsewf OwO"
      : "This wasn't meant to happen, try restarting the app."

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: '10px',
        }}
      >
        <div
          className='is-size-3 has-text-weight-bold'
          style={{
            alignItems: 'center',
            display: 'flex',
            height: '80px',
            marginBottom: '5px',
          }}
        >
          <div style={{ flexGrow: 1 }}>
            <h1 style={{ fontSize: '55px', fontWeight: 600 }}>{NAME}</h1>
          </div>
          <img
            style={{ height: '75px', width: 'auto' }}
            src={Icon}
            draggable={false}
          />
        </div>

        <div
          className='box'
          style={{
            flexGrow: 1,
            fontFamily: "'Fira Mono', monospace",
            fontWeight: 400,
            overflowY: 'scroll',
          }}
        >
          <p>
            {NAME} {ERROR}
          </p>
          <p>{RESTART}</p>
          <hr />
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>

        <Konami
          action={() => this.setState({ easterEgg: !this.state.easterEgg })}
        />
      </div>
    )
  }
}

export default ErrorBoundary
