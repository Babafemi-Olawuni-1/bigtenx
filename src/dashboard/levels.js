export const LEVELS = [
  {
    id: 1, name: 'Bronze', price: 1,
    dailyCoins: 50, referralBonus: '100 coins',
    badge: 'Bronze', commission: 20, vipMonths: 0,
    color: '#cd7f32', glow: 'rgba(205,127,50,0.4)',
    perks: ['50 coins daily task reward', '100 coins referral bonus', 'Bronze badge', '20% commission', 'Standard withdrawal'],
  },
  {
    id: 2, name: 'Silver', price: 5,
    dailyCoins: 100, referralBonus: '$2',
    badge: 'Silver', commission: 30, vipMonths: 0,
    color: '#c0c0c0', glow: 'rgba(192,192,192,0.4)',
    perks: ['100 coins daily task reward', '$2 referral bonus', 'Silver badge', '30% commission', 'Priority withdrawal'],
  },
  {
    id: 3, name: 'Gold', price: 10,
    dailyCoins: 150, referralBonus: '$4',
    badge: 'Gold', commission: 40, vipMonths: 0,
    color: '#ffd700', glow: 'rgba(255,215,0,0.4)',
    perks: ['150 coins daily task reward', '$4 referral bonus', 'Gold badge', '40% commission', 'Same-day withdrawal'],
  },
  {
    id: 4, name: 'Diamond', price: 20,
    dailyCoins: 200, referralBonus: '$10',
    badge: 'Diamond', commission: 50, vipMonths: 1,
    color: '#ff6f00', glow: 'rgba(255,111,0,0.5)',
    perks: ['200 coins daily task reward', '$10 referral bonus', 'Diamond badge', '50% commission', 'Instant withdrawal', '1 month VIP free ($10 value)'],
  },
]

export const LEVEL_MAP = Object.fromEntries(LEVELS.map(l => [l.id, l]))

export function getUserLevel(user) {
  return LEVEL_MAP[user?.level] || null
}

export function isLevelActive(user) {
  // A user is "active" if they have any badge/level or are VIP
  // Free users with level 0 or no badge can still claim weekly reward
  return true
}

export function getDailyCoins(user) {
  if (!isLevelActive(user)) return 0
  return LEVEL_MAP[user.level]?.dailyCoins || 0
}
