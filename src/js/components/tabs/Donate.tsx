import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import {
  DONATION_LINK,
  DONATION_LINK_TEXT,
  DONATION_TEXT,
  DONATION_TEXT_2,
} from '../../constants'
import { IState } from '../../store'
import { setSeenDonationPage } from '../../store/misc'
import { setCurrentTab } from '../../store/tabs'
import ExtLink from '../ExtLink'

interface IProps {
  seenDonationPage: boolean

  setCurrentTab: typeof setCurrentTab
  setSeenDonationPage: typeof setSeenDonationPage
}

const closeMessages = [
  'Not today buster.',
  "Sorry, I'm poor too.",
  'Nah.',
  'Maybe some other time.',
]

const Donate: FunctionComponent<IProps> = props => (
  <div className='content'>
    <h1>Donate</h1>
    <p>
      {DONATION_TEXT}
      <br />
      <ExtLink href={DONATION_LINK}>{DONATION_LINK_TEXT}</ExtLink>{' '}
      {DONATION_TEXT_2}
    </p>
    <p>
      <a
        href='/'
        onClick={e => {
          e.preventDefault()

          if (!props.seenDonationPage) props.setSeenDonationPage(true)
          props.setCurrentTab(0)
        }}
      >
        <i>{closeMessages[Math.floor(Math.random() * closeMessages.length)]}</i>
      </a>
    </p>
  </div>
)

const mapStateToProps: (state: IState) => IProps = state => ({
  seenDonationPage: state.misc.seenDonationPage,

  setCurrentTab,
  setSeenDonationPage,
})

export default connect(
  mapStateToProps,
  { setCurrentTab, setSeenDonationPage }
)(Donate)
