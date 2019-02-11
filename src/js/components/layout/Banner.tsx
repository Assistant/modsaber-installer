import React, { FunctionComponent } from 'react'
import Styler from '../utils/Styler'

type BannerStyle =
  | 'dark'
  | 'primary'
  | 'link'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'

interface IProps {
  children: React.ReactNode
  style: BannerStyle
}

const Banner: FunctionComponent<IProps> = ({ children, style }) => (
  <>
    <Styler content='div.box#main { --max-height-offset: 291px }' />

    <div className='banner'>
      <article className={`message is-${style}`}>
        <div className='message-body' style={{ padding: '0.75em 1.25em' }}>
          {children}
        </div>
      </article>
    </div>
  </>
)

export default Banner
