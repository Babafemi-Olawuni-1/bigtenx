import { useState } from 'react'
import PageLayout from './PageLayout'
import { ChevronDown } from 'lucide-react'

const O = '#ff6f00'

const CATEGORIES = [
  {
    label: 'Getting Started',
    items: [
      { q: 'What is BigTenX?', a: 'BigTenX is an earn-and-withdraw platform where you complete daily tasks, invite friends, and stake coins to earn real cash. No investment required.' },
      { q: 'How do I create an account?', a: 'Click "Get Started" on the homepage, fill in your username, email, and password. You\'ll receive 100 free coins instantly upon registration.' },
      { q: 'Is BigTenX free to join?', a: 'Yes. Creating an account is completely free. You start with 100 coins at no cost.' },
      { q: 'Do I need to invest money to earn?', a: 'No. You can earn through free daily tasks and referrals. Upgrading your tier is optional and unlocks higher rewards.' },
    ],
  },
  {
    label: 'Earning & Tasks',
    items: [
      { q: 'How do daily tasks work?', a: 'Tasks reset every 24 hours. Log in, complete the available tasks, and earn coins. Your streak multiplier increases the longer you maintain a daily streak.' },
      { q: 'What is the referral commission?', a: 'You earn a percentage of every coin your referrals earn. Bronze: 20%, Silver: 30%, Gold: 40%, Diamond: 50%.' },
      { q: 'What is staking?', a: 'Staking means locking your coins to earn interest over time. Staked coins grow and can be converted to real cash for withdrawal.' },
      { q: 'How do I earn more coins faster?', a: 'Maintain your daily streak, invite active friends, upgrade your tier, and complete all available tasks each day.' },
    ],
  },
  {
    label: 'Levels & Tiers',
    items: [
      { q: 'What are the tier prices?', a: 'Bronze: $1, Silver: $5, Gold: $10, Diamond: $20. Each tier unlocks higher daily rewards and referral commissions.' },
      { q: 'How do I upgrade my tier?', a: 'Go to Wallet → Upgrade and select your desired tier. Payment is processed through the platform.' },
      { q: 'What does Diamond VIP include?', a: 'Diamond members get 200 coins/day, $10 referral bonus, 50% commission, instant withdrawals, and 1 month VIP free.' },
      { q: 'Can I downgrade my tier?', a: 'Tiers are non-refundable. You can choose not to renew when your tier expires.' },
    ],
  },
  {
    label: 'Withdrawals',
    items: [
      { q: 'What is the minimum withdrawal?', a: 'The minimum withdrawal amount is $3.' },
      { q: 'How long do withdrawals take?', a: 'Standard accounts: up to 24 hours. Diamond VIP: instant processing.' },
      { q: 'What payment methods are supported?', a: 'We support mobile money, bank transfer, and crypto wallets. Available methods depend on your region.' },
      { q: 'Why was my withdrawal declined?', a: 'Withdrawals may be held for fraud review, insufficient balance, or unverified account. Contact support if the issue persists.' },
    ],
  },
  {
    label: 'Account & Security',
    items: [
      { q: 'How do I verify my email?', a: 'After registration, check your inbox for a verification email from BigTenX. Click the link inside. Check spam if not found.' },
      { q: 'I forgot my password', a: 'Click "Forgot password?" on the login page. Enter your email and we\'ll send a reset link valid for 1 hour.' },
      { q: 'Can I have multiple accounts?', a: 'No. Multiple accounts are strictly prohibited and will result in permanent suspension of all associated accounts.' },
      { q: 'How do I delete my account?', a: 'Contact support at support@bigtenx.com with your request. Account deletion is processed within 30 days.' },
    ],
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', background: 'none', border: 'none', padding: '15px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
        <span style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>{q}</span>
        <ChevronDown size={15} color={O} style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s' }} />
      </button>
      <div style={{ maxHeight: open ? 200 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.75, paddingBottom: 14, margin: 0 }}>{a}</p>
      </div>
    </div>
  )
}

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState(0)

  return (
    <PageLayout title="FAQ" subtitle="Answers to the most common questions about BigTenX.">
      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 32, paddingBottom: 4 }}>
        {CATEGORIES.map((c, i) => (
          <button key={c.label} onClick={() => setActiveCategory(i)}
            style={{ flexShrink: 0, background: i === activeCategory ? O : 'rgba(255,255,255,0.05)', color: i === activeCategory ? 'white' : 'rgba(255,255,255,0.5)', border: 'none', borderRadius: 999, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: i === activeCategory ? `0 4px 14px ${O}40` : 'none' }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Items */}
      <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '0 20px' }}>
        {CATEGORIES[activeCategory].items.map(item => <FaqItem key={item.q} {...item} />)}
      </div>

      {/* Still need help */}
      <div style={{ marginTop: 32, background: 'linear-gradient(135deg, #001F54, #0a3080)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
        <p style={{ color: 'white', fontWeight: 700, fontSize: 16, margin: '0 0 6px' }}>Still have questions?</p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '0 0 16px' }}>Our support team is ready to help you.</p>
        <a href="/support" style={{ display: 'inline-block', background: O, color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 14, padding: '10px 24px', borderRadius: 10, boxShadow: `0 4px 14px ${O}40` }}>Contact Support</a>
      </div>
    </PageLayout>
  )
}
