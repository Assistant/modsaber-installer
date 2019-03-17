import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import Banner, { BannerStyle } from './components/layout/Banner'
import BottomBar from './components/layout/BottomBar'
import MainTabs from './components/layout/MainTabs'
import PathPicker from './components/layout/PathPicker'
import ExtLink from './components/utils/ExtLink'
import {
  DONATION_LINK,
  DONATION_LINK_TEXT,
  DONATION_TEXT,
  DONATION_TEXT_2,
} from './constants'
import { IState } from './store'

interface IProps {
  shake: boolean
}

const App: FunctionComponent<IProps> = ({ shake }) => {
  const shakeClass = shake ? ' shake' : ''

  return (
    <div className={`layout${shakeClass}`}>
      <div className='layout-item banner'>
        <Banner style={BannerStyle.Info}>
          <p>{DONATION_TEXT}</p>
          <p>
            <ExtLink href={DONATION_LINK}>{DONATION_LINK_TEXT}</ExtLink>{' '}
            {DONATION_TEXT_2}
          </p>
        </Banner>
      </div>

      <div className='layout-item top'>
        <PathPicker />
      </div>

      <div className='layout-item main'>
        <MainTabs />
      </div>

      <div className='layout-item bottom'>
        <BottomBar />
      </div>
    </div>
  )
}

const mapStateToProps: (state: IState) => IProps = state => ({
  shake: state.misc.shake,
})

export default connect(mapStateToProps)(App)
