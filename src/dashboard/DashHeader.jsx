import { Sun, Moon, Bell } from 'lucide-react'
import { C, t } from './tokens'

// Country name → ISO 3166-1 alpha-2 code mapping (for flag emoji generation)
const COUNTRY_CODE_MAP = {
  'nigeria': 'NG',
  'ghana': 'GH',
  'kenya': 'KE',
  'south africa': 'ZA',
  'united states': 'US',
  'usa': 'US',
  'united kingdom': 'GB',
  'uk': 'GB',
  'canada': 'CA',
  'australia': 'AU',
  'india': 'IN',
  'germany': 'DE',
  'france': 'FR',
  'italy': 'IT',
  'spain': 'ES',
  'brazil': 'BR',
  'mexico': 'MX',
  'indonesia': 'ID',
  'pakistan': 'PK',
  'bangladesh': 'BD',
  'ethiopia': 'ET',
  'tanzania': 'TZ',
  'uganda': 'UG',
  'rwanda': 'RW',
  'cameroon': 'CM',
  'senegal': 'SN',
  'ivory coast': 'CI',
  "cote d'ivoire": 'CI',
  'zambia': 'ZM',
  'zimbabwe': 'ZW',
  'egypt': 'EG',
  'morocco': 'MA',
  'algeria': 'DZ',
  'tunisia': 'TN',
  'sudan': 'SD',
  'angola': 'AO',
  'mozambique': 'MZ',
  'madagascar': 'MG',
  'malawi': 'MW',
  'niger': 'NE',
  'mali': 'ML',
  'burkina faso': 'BF',
  'guinea': 'GN',
  'benin': 'BJ',
  'togo': 'TG',
  'liberia': 'LR',
  'sierra leone': 'SL',
  'gambia': 'GM',
  'gabon': 'GA',
  'congo': 'CG',
  'dr congo': 'CD',
  'somalia': 'SO',
  'south sudan': 'SS',
  'botswana': 'BW',
  'namibia': 'NA',
  'lesotho': 'LS',
  'eswatini': 'SZ',
  'swaziland': 'SZ',
  'china': 'CN',
  'japan': 'JP',
  'south korea': 'KR',
  'philippines': 'PH',
  'vietnam': 'VN',
  'thailand': 'TH',
  'malaysia': 'MY',
  'singapore': 'SG',
  'myanmar': 'MM',
  'sri lanka': 'LK',
  'nepal': 'NP',
  'ukraine': 'UA',
  'russia': 'RU',
  'poland': 'PL',
  'netherlands': 'NL',
  'belgium': 'BE',
  'sweden': 'SE',
  'norway': 'NO',
  'denmark': 'DK',
  'finland': 'FI',
  'portugal': 'PT',
  'greece': 'GR',
  'turkey': 'TR',
  'saudi arabia': 'SA',
  'uae': 'AE',
  'united arab emirates': 'AE',
  'qatar': 'QA',
  'kuwait': 'KW',
  'bahrain': 'BH',
  'oman': 'OM',
  'jordan': 'JO',
  'lebanon': 'LB',
  'israel': 'IL',
  'iran': 'IR',
  'iraq': 'IQ',
  'new zealand': 'NZ',
  'argentina': 'AR',
  'colombia': 'CO',
  'chile': 'CL',
  'peru': 'PE',
  'venezuela': 'VE',
}

// Convert ISO alpha-2 code to flag emoji using regional indicator symbols
function countryCodeToFlag(code) {
  if (!code || code.length !== 2) return '🌍'
  const upper = code.toUpperCase()
  const flagEmoji = [...upper].map(char =>
    String.fromCodePoint(char.charCodeAt(0) - 65 + 0x1F1E6)
  ).join('')
  return flagEmoji
}

function getFlagForCountry(country) {
  if (!country) return '🌍'
  const key = country.toLowerCase().trim()
  const code = COUNTRY_CODE_MAP[key]
  if (code) return countryCodeToFlag(code)
  // Fallback: show world globe
  return '🌍'
}

export default function DashHeader({ user, darkMode, setDarkMode }) {
  const tk = t(darkMode)

  const country = user?.country ?? 'Nigeria'
  const flagEmoji = getFlagForCountry(country)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '24px 22px 12px', background: tk.bg,
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%', overflow: 'hidden',
          marginRight: 11, flexShrink: 0,
          background: `linear-gradient(135deg, ${C.orange}, #FF9A00)`,
          boxShadow: `0 4px 14px rgba(255,111,0,.4)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="42" height="42" viewBox="0 0 42 42">
            <circle cx="21" cy="21" r="21" fill="rgba(255,255,255,.18)"/>
            <circle cx="21" cy="16" r="7" fill="rgba(255,255,255,.8)"/>
            <ellipse cx="21" cy="38" rx="13" ry="9" fill="rgba(255,255,255,.8)"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 10.5, color: '#8899AA', fontWeight: 500 }}>Welcome Back</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: tk.text, marginTop: 1 }}>Hi {user?.username || 'Trader'}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            width: 34, height: 34, borderRadius: '50%',
            background: tk.card, boxShadow: tk.iconShadow,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', border: 'none',
          }}
        >
          {darkMode ? <Sun size={15} color={C.orange} /> : <Moon size={15} color={C.navy} />}
        </button>
        <div
          title={country}
          style={{
            width: 34, height: 34, borderRadius: '50%',
            background: tk.card, boxShadow: tk.iconShadow,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, lineHeight: 1,
          }}
        >
          {flagEmoji}
        </div>
        <button
          onClick={() => alert('Notifications coming soon')}
          style={{
            width: 34, height: 34, borderRadius: '50%',
            background: tk.card, boxShadow: tk.iconShadow,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', border: 'none',
          }}
        >
          <Bell size={15} color={tk.textMuted} />
        </button>
      </div>
    </div>
  )
}