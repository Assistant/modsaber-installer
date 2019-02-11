import React, { FunctionComponent } from 'react'
import { shell } from '../utils/electron'

interface IProps {
  children: React.ReactNode
  href: string
}

const ExtLink: FunctionComponent<IProps> = props => (
  <a
    href='/'
    onClick={e => {
      e.preventDefault()
      shell.openExternal(props.href)
    }}
  >
    {props.children}
  </a>
)

export default ExtLink
