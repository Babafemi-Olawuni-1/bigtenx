// Country name → flag emoji + SVG colors for custom flag rendering
export const FLAGS = {
  'Nigeria':        { emoji: '🇳🇬', colors: ['#008751','#ffffff','#008751'] },
  'Ghana':          { emoji: '🇬🇭', colors: ['#006B3F','#FCD116','#CE1126'], star: true },
  'Kenya':          { emoji: '🇰🇪', colors: ['#006600','#CC0001','#000000'] },
  'South Africa':   { emoji: '🇿🇦', colors: ['#007A4D','#FFB612','#DE3831'] },
  'Tanzania':       { emoji: '🇹🇿', colors: ['#1EB53A','#FCD116','#00A3DD'] },
  'Uganda':         { emoji: '🇺🇬', colors: ['#000000','#FCDC04','#DE3108'] },
  'Ethiopia':       { emoji: '🇪🇹', colors: ['#078930','#FCDD09','#DA121A'] },
  'Cameroon':       { emoji: '🇨🇲', colors: ['#007A5E','#CE1126','#FCD116'] },
  'Senegal':        { emoji: '🇸🇳', colors: ['#00853F','#FDEF42','#E31B23'] },
  'Ivory Coast':    { emoji: '🇨🇮', colors: ['#F77F00','#FFFFFF','#009A44'] },
  'Rwanda':         { emoji: '🇷🇼', colors: ['#20603D','#FAD201','#E5BE01'] },
  'Zambia':         { emoji: '🇿🇲', colors: ['#198A00','#EF7D00','#DE2010'] },
  'Zimbabwe':       { emoji: '🇿🇼', colors: ['#006400','#FFD200','#D40000'] },
  'Mozambique':     { emoji: '🇲🇿', colors: ['#009A44','#FCE100','#E03C31'] },
  'Angola':         { emoji: '🇦🇴', colors: ['#CC0000','#000000','#CC0000'] },
  'United Kingdom': { emoji: '🇬🇧', colors: ['#012169','#FFFFFF','#C8102E'] },
  'United States':  { emoji: '🇺🇸', colors: ['#B22234','#FFFFFF','#3C3B6E'] },
  'Canada':         { emoji: '🇨🇦', colors: ['#FF0000','#FFFFFF','#FF0000'] },
  'Australia':      { emoji: '🇦🇺', colors: ['#00008B','#FFFFFF','#FF0000'] },
  'India':          { emoji: '🇮🇳', colors: ['#FF9933','#FFFFFF','#138808'] },
  'Germany':        { emoji: '🇩🇪', colors: ['#000000','#DD0000','#FFCE00'] },
  'France':         { emoji: '🇫🇷', colors: ['#002395','#FFFFFF','#ED2939'] },
  'Netherlands':    { emoji: '🇳🇱', colors: ['#AE1C28','#FFFFFF','#21468B'] },
  'UAE':            { emoji: '🇦🇪', colors: ['#00732F','#FFFFFF','#000000'] },
  'Saudi Arabia':   { emoji: '🇸🇦', colors: ['#006C35','#FFFFFF','#006C35'] },
  'Other':          { emoji: '🌍', colors: ['#4A90D9','#FFFFFF','#4A90D9'] },
}

export function getFlagEmoji(country) {
  return FLAGS[country]?.emoji || '🌍'
}

export function getFlagColors(country) {
  return FLAGS[country]?.colors || ['#4A90D9','#FFFFFF','#4A90D9']
}
