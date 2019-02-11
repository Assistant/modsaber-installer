import React from 'react'
import Icon from '../img/icon.png'

const style = {
  '-webkit-app-region': 'drag',
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'center',
  width: '100%',
} as React.CSSProperties

const Splash = () => (
  <div style={style}>
    <img
      src={Icon}
      style={{ width: '50%', height: 'auto' }}
      alt='ModSaber Logo'
    />

    <div style={{ textAlign: 'center' }}>
      <h1 className='is-size-4 has-text-weight-semibold'>ModSaber Installer</h1>
      <h3>
        <i className='fas fa-cog fa-spin' /> Loading...
      </h3>
    </div>
  </div>
)

export default Splash
