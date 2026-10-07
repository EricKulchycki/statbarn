// One accent per team, tuned to stay legible on the dark slate background.
// Teams whose official primary is near-black or navy use a lighter shade
// of their secondary or primary colour instead.
export const TEAM_COLORS: Readonly<Record<string, string>> = {
  ANA: '#F47A38',
  BOS: '#FFB81C',
  BUF: '#3A6FC4',
  CAR: '#D7263D',
  CBJ: '#3C5A99',
  CGY: '#E03A3E',
  CHI: '#CF3A45',
  COL: '#8C2F50',
  DAL: '#1F8A5B',
  DET: '#D6343F',
  EDM: '#FF6A13',
  FLA: '#D23A48',
  LAK: '#A2AAAD',
  MIN: '#2F7A55',
  MTL: '#C8333F',
  NJD: '#D23A3A',
  NSH: '#FFB81C',
  NYI: '#F47D30',
  NYR: '#3B6FC4',
  OTT: '#C52032',
  PHI: '#F74902',
  PIT: '#FCB514',
  SEA: '#3D8A99',
  SJS: '#11878F',
  STL: '#3D6BC4',
  TBL: '#2B5DAE',
  TOR: '#2A5BB0',
  UTA: '#71AFE5',
  VAN: '#00843D',
  VGK: '#B4975A',
  WPG: '#4B6EA8',
  WSH: '#D23A48',
}

export const FALLBACK_TEAM_COLORS = {
  away: '#B4975A',
  home: '#3D8A99',
} as const

export function getTeamColor(abbrev: string, side: 'away' | 'home'): string {
  return TEAM_COLORS[abbrev] ?? FALLBACK_TEAM_COLORS[side]
}
