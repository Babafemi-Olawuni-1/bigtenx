// Brand tokens — single source of truth
export const C = {
  orange:     '#FF6F00',
  orangeGlow: 'rgba(255,111,0,0.55)',
  orangeDim:  'rgba(255,111,0,0.12)',
  navy:       '#001F54',
  navyMid:    '#003B8E',
  darkBg:     '#050816',
  darkCard:   '#081226',
  white:      '#ffffff',
  lightBg:    '#F7F8FC',
}

export const light = {
  bg:         C.lightBg,
  card:       C.white,
  cardBorder: 'rgba(0,31,84,0.07)',
  text:       C.navy,
  textMuted:  '#8899AA',
  navBg:      C.white,
  navBorder:  'rgba(0,31,84,0.06)',
  iconBg:     C.white,
  iconShadow: '0 2px 10px rgba(0,31,84,0.1)',
  balCard:    `linear-gradient(140deg,${C.navy} 0%,${C.navyMid} 100%)`,
}

export const dark = {
  bg:         C.darkBg,
  card:       C.darkCard,
  cardBorder: 'rgba(255,111,0,0.18)',
  text:       C.white,
  textMuted:  'rgba(255,255,255,0.38)',
  navBg:      C.darkCard,
  navBorder:  'rgba(255,111,0,0.1)',
  iconBg:     C.darkCard,
  iconShadow: `0 0 10px rgba(255,111,0,0.12)`,
  balCard:    `linear-gradient(140deg,${C.darkCard} 0%,#0D1F42 100%)`,
}

export const t = (isDark) => isDark ? dark : light
