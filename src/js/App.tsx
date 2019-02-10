import React from 'react'

import Banner from './components/Banner'
import BottomBar from './components/BottomBar'
import ExtLink from './components/ExtLink'
import MainTabs from './components/MainTabs'
import PathPicker from './components/PathPicker'
import {
  DONATION_LINK,
  DONATION_LINK_TEXT,
  DONATION_TEXT,
  DONATION_TEXT_2,
} from './constants'

const App = () => (
  <div className='layout'>
    <div className='layout-item banner'>
      <Banner style='link'>
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

export default App
