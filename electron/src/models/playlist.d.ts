interface IPlaylistSong {
  songName: string
  key?: string
  hash?: string
}

export interface IPlaylist {
  fileName: string
  title: string
  archiveUrl: string
  raw: string
  songs: IPlaylistSong[]
}
