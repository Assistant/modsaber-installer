import { Reducer } from 'redux'
import { electronStore } from '../../utils/electron'
import { IMiscState, MiscActionTypes } from './types'

const now = new Date()
const lastSeen = new Date(electronStore.get('seenDonationPage'))
const offset = 1000 * 60 * 60 * 24 * 31

const initialState: IMiscState = {
  seenDonationPage: lastSeen.getTime() + offset > now.getTime(),
  theme: 'light',
}

const reducer: Reducer<IMiscState> = (state = initialState, action) => {
  if (action.type === MiscActionTypes.SET_THEME) {
    const theme = action.payload

    setTheme(theme)
    electronStore.set('theme', theme)

    return { ...state, theme }
  } else if (action.type === MiscActionTypes.LOAD_THEME) {
    const theme = electronStore.get('theme') || 'light'
    setTheme(theme)

    return { ...state, theme }
  } else if (action.type === MiscActionTypes.SET_SEEN_DONATION_PAGE) {
    electronStore.set('seenDonationPage', new Date())
    return { ...state, seenDonationPage: action.payload }
  } else {
    return state
  }
}

const setTheme = (theme: IMiscState['theme']) => {
  const elements = document.getElementsByTagName('html')
  const html = elements[0]

  if (theme === 'dark') html.classList.add('dark')
  else html.classList.remove('dark')
}

export { reducer as miscReducer }
