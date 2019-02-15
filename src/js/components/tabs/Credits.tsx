import React from 'react'
import ExtLink from '../utils/ExtLink'

const Credits = () => (
  <div className='content'>
    <h1>ModSaber and ModSaber Installer</h1>
    <p>
      Written by <ExtLink href='https://github.com/lolPants'>lolPants</ExtLink>
      &nbsp; with code from&nbsp;
      <ExtLink href='https://github.com/lolPants/modsaber-installer/graphs/contributors'>
        Additional Contributors
      </ExtLink>
    </p>

    <h1>Inspiration</h1>
    <p>
      This was inspired by the original&nbsp;
      <ExtLink href='https://github.com/Umbranoxio/BeatSaberModInstaller'>
        Mod Manager
      </ExtLink>
      &nbsp; by <ExtLink href='https://github.com/Umbranoxio'>Umbranox</ExtLink>
    </p>
  </div>
)

export default Credits
