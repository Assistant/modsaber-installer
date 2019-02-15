import React, { FunctionComponent } from 'react'

interface IProps {
  icon?: string
  children: React.ReactNode
  spin?: boolean
}

const Status: FunctionComponent<IProps> = props => (
  <>
    <i
      className={`${props.icon || 'fas fa-cog'} fa-2x${
        props.spin ? ' fa-spin' : ''
      }`}
    />
    <span style={{ marginTop: '5px', textAlign: 'center' }}>
      {props.children}
    </span>
  </>
)

export default Status
