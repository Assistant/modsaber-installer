export enum ContainerActionTypes {
  SET_CONTAINER = '@@container/SET_CONTAINER',
  CLEAR_CONTAINER = '@@container/CLEAR_CONTAINER',
}

export type IContainerState = HTMLDivElement | null
