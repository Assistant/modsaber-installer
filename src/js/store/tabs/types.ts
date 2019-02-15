export enum TabsActionTypes {
  SET_TABS_MAX = '@@tabs/SET_TABS_MAX',
  SET_CURRENT_TAB = '@@tabs/SET_CURRENT_TAB',
  INCREMENT_TAB_IDX = '@@tabs/INCREMENT_TAB_IDX',
  DECREMENT_TAB_IDX = '@@tabs/DECREMENT_TAB_IDX',
}

export interface ITabsState {
  max: number
  current: number
}
