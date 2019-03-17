const npmPackage = require('../../package.json') // tslint:disable-line no-var-requires

export const VERSION = npmPackage.version
export const REPO = npmPackage.repository.url.replace(
  /git\+https:\/\/github.com\/(.+).git/,
  '$1'
)
export const BASE_URL = 'https://www.modsaber.org'
export const API_URL = `${BASE_URL}/api/v1.1`

export const USER_AGENT = `ModSaber Installer/${VERSION}`
export const HASTE_URL = 'https://paste.n3s.co'

export const AUTO_UPDATE_JOB = 'update'

export const IPA_EXE = 'IPA.exe'
export const BEAT_SABER_EXE = 'Beat Saber.exe'
export const BPM_EXE = 'Game.exe'
export const STEAM_APP_ID = '620980'

export const ERRORS = {
  CUSTOM_FILE_UNTRUSTED:
    'For security reasons we do not allow custom files from untrusted sources!',
  DIAGNOSTICS_FAILURE: 'Failed to run diagnostics!\nError written to log file.',
  DIAGNOSTICS_TOO_LARGE:
    'Failed to upload diagnostics!\nReport is too big to upload.',
  INVALID_INSTALL_DIR:
    'Could not find your Beat Saber directory.\nRun the mod manager once first!',
  PLAYLIST_DOWNLOAD_ERROR:
    'Playlist info could not be downloaded!\nDouble check the URL exists and is valid.',
  PLAYLIST_INVALID: 'Invalid Playlist File!',
  PLAYLIST_UNTRUSTED:
    'For security reasons we do not allow playlists with custom archive URLs!',
}

export const REGISTERED_EXTS = [
  '.avatar',
  '.saber',
  '.plat',
  '.bmap',
  '.bplist',
]

export const CUSTOM_FILE_DIRS: { [key: string]: string } = {
  '.avatar': 'CustomAvatars',
  '.bplist': 'Playlists',
  '.plat': 'CustomPlatforms',
  '.saber': 'CustomSabers',
}

export const BLOCKED_EXTENSIONS = [
  '.jar',
  '.msi',
  '.com',
  '.bat',
  '.cmd',
  '.nt',
  '.scr',
  '.ps1',
  '.psm1',
  '.sh',
  '.bash',
  '.bsh',
  '.csh',
  '.bash_profile',
  '.bashrc',
  '.profile',
  '.zip',
  '.rar',
  '.tar.gz',
]
