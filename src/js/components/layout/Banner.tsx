import React, { FunctionComponent } from 'react'
import Styler from '../utils/Styler'

export enum BannerStyle {
  Default = '',
  Dark = 'is-dark',
  Primary = 'is-primary',
  Link = 'is-link',
  Info = 'is-info',
  Success = 'is-success',
  Warning = 'is-warning',
  Danger = 'is-danger',
}

interface IProps {
  children: React.ReactNode
  style: BannerStyle
}

const Banner: FunctionComponent<IProps> = ({ children, style }) => (
  <>
    <Styler content='div.box#main { --max-height-offset: 291px }' />

    <div className='banner'>
      <article className={`message ${style}`}>
        <div className='message-body'>{children}</div>
      </article>
    </div>
  </>
)

export default Banner
