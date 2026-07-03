// Shared constants and helpers for admin dashboard
// Location: src/admin/adminUtils.js

export const O  = '#FF6F00'
export const O2 = '#FF8C00'
export const DARK_BG   = '#050816'
export const DARK_CARD = '#081226'

const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
const isLocal  = hostname === 'localhost' || hostname.startsWith('192.168.') || hostname.startsWith('10.')
export const API = isLocal
  ? `http://${hostname}/bigtenx/bigtenx/api`
  : (typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api')

export const PLATFORMS     = ['Facebook','Instagram','Twitter/X','Telegram','YouTube','TikTok','WhatsApp','Other']
export const PLATFORM_ICONS = { Facebook:'📘', Instagram:'📸', 'Twitter/X':'🐦', Telegram:'✈️', YouTube:'▶️', TikTok:'🎵', WhatsApp:'💬', Other:'🌐' }
export const LEVEL_NAMES   = ['Free','Bronze','Silver','Gold','Diamond']
export const LEVEL_COLORS  = ['rgba(255,255,255,0.3)','#cd7f32','#c0c0c0','#ffd700','#ff6f00']

export function getTheme(darkMode) {
  return {
    bg:     darkMode ? DARK_BG   : '#F7F8FC',
    card:   darkMode ? DARK_CARD : '#ffffff',
    text:   darkMode ? '#ffffff' : '#001F54',
    muted:  darkMode ? 'rgba(255,255,255,0.38)' : '#8899AA',
    border: darkMode ? 'rgba(255,111,0,0.18)'   : 'rgba(0,31,84,0.07)',
  }
}

// ── Format currency helper ──────────────────────────────────────────────
export function formatCurrency(value) {
    if (!value || value === 0) return '$0.00';
    
    const absValue = Math.abs(value);
    if (absValue >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (absValue >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (absValue >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (absValue >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    
    return `$${value.toFixed(2)}`;
}