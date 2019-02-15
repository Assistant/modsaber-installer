export enum MiscActionTypes {
  SET_THEME = '@@misc/SET_THEME',
  LOAD_THEME = '@@misc/LOAD_THEME',
  SET_SEEN_DONATION_PAGE = '@@misc/SET_SEEN_DONATION_PAGE',
}

export interface IMiscState {
  theme: 'light' | 'dark'
  seenDonationPage: boolean
}
