export interface IPromotion {
  modName: string

  text: string
  url: string
}

const promotions: IPromotion[] = [
  {
    modName: 'yurfit',

    text: 'Join the Discord: https://yur.chat/',
    url: 'https://yur.chat/',
  },
]

export default promotions
