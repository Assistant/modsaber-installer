import React, { Component } from 'react'
import { connect } from 'react-redux'

import { IState } from '../../store'
import { setContainer } from '../../store/container'
import { setCurrentTab, setMaxTabs } from '../../store/tabs'

import Main from '../main/Main'
import Credits from '../tabs/Credits'
import Donate from '../tabs/Donate'
import Help from '../tabs/Help'
import ModInfo from '../tabs/ModInfo'
import Tools from '../tabs/Tools'
import Styler from '../utils/Styler'

import { STYLE_OVERRIDE } from '../../constants'

interface IProps {
  currentTab: number
  selected: number | null
  seenDonationPage: boolean

  setContainer: typeof setContainer
  setCurrentTab: typeof setCurrentTab
  setMaxTabs: typeof setMaxTabs
}

interface IPage {
  title: string
  component: React.ReactNode
  overrideStyles?: boolean
  donatePage?: boolean
}

class MainTabs extends Component<IProps> {
  public readonly pages: IPage[]
  public readonly container: React.RefObject<HTMLDivElement>

  constructor(props: IProps) {
    super(props)

    this.pages = [
      { title: 'Mods', component: <Main /> },
      { title: 'Tools', component: <Tools />, overrideStyles: true },
      { title: 'Help', component: <Help /> },
      { title: 'Credits', component: <Credits /> },
      { title: 'Donate', component: <Donate />, donatePage: true },
    ]

    this.container = React.createRef()
  }

  public componentDidMount() {
    this.props.setMaxTabs(this.pages.length)
    this.props.setContainer(this.container)
  }

  public render() {
    const pages =
      this.props.selected === null
        ? this.pages
        : [
            ...this.pages,
            { title: 'Mod Info', component: <ModInfo />, overrideStyles: true },
          ]

    const selected = !this.props.seenDonationPage
      ? pages.findIndex(x => x.donatePage === true)
      : this.props.currentTab > pages.length - 1
      ? 0
      : this.props.currentTab

    return (
      <>
        <div className='tabs'>
          <ul>
            {pages.map(({ title, donatePage }, i) => (
              <li
                key={i}
                className={`${selected === i ? 'is-active' : ''}${
                  !this.props.seenDonationPage && !donatePage
                    ? ' is-disabled'
                    : ''
                }`}
              >
                <a
                  href='/'
                  draggable={false}
                  onClick={e => {
                    e.preventDefault()
                    if (
                      i !== this.props.currentTab &&
                      this.container.current !== null
                    ) {
                      this.container.current.scrollTop = 0
                    }
                    this.props.setCurrentTab(i)
                  }}
                >
                  {title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div ref={this.container} className='box' id='main'>
          {pages[selected].component}

          {!pages[selected].overrideStyles ? null : (
            <Styler content={STYLE_OVERRIDE} />
          )}
        </div>
      </>
    )
  }
}

const mapStateToProps: (state: IState) => IProps = state => ({
  container: state.container,
  currentTab: state.tabs.current,
  seenDonationPage: state.misc.seenDonationPage,
  selected: state.mods.selected,

  setContainer,
  setCurrentTab,
  setMaxTabs,
})

export default connect(
  mapStateToProps,
  { setCurrentTab, setMaxTabs, setContainer }
)(MainTabs)
