import PageLayout from './PageLayout'

export default function Terms() {
  return (
    <PageLayout title="Terms of Service" subtitle="Last updated: May 2025">
      <Section title="1. Acceptance of Terms">
        <p>By creating a BigTenX account, you agree to these Terms of Service. If you do not agree, do not use the platform.</p>
      </Section>
      <Section title="2. Eligibility">
        <p>You must be at least 18 years old to use BigTenX. By registering, you confirm that you meet this requirement and that all information you provide is accurate.</p>
      </Section>
      <Section title="3. Account Responsibilities">
        <ul>
          <li>You are responsible for maintaining the confidentiality of your login credentials</li>
          <li>You must not share your account with others</li>
          <li>You must not create multiple accounts to abuse bonuses or referral systems</li>
          <li>You must not use bots, scripts, or automated tools to earn coins</li>
        </ul>
      </Section>
      <Section title="4. Earning & Withdrawals">
        <p>Coins are earned through legitimate task completion, referrals, and staking. Minimum withdrawal is $3. BigTenX reserves the right to withhold withdrawals pending fraud review. Earnings are not guaranteed and depend on your activity level and tier.</p>
      </Section>
      <Section title="5. Referral Program">
        <p>Referral commissions are paid based on your current tier (20%–50%). Fraudulent referrals — including self-referrals or fake accounts — will result in immediate account suspension and forfeiture of all earnings.</p>
      </Section>
      <Section title="6. Prohibited Conduct">
        <ul>
          <li>Fraud, manipulation, or abuse of any platform feature</li>
          <li>Impersonating other users or BigTenX staff</li>
          <li>Attempting to hack, reverse-engineer, or disrupt the platform</li>
          <li>Using the platform for money laundering or illegal activity</li>
        </ul>
      </Section>
      <Section title="7. Termination">
        <p>BigTenX reserves the right to suspend or terminate any account that violates these terms, with or without notice. Suspended accounts forfeit all pending earnings.</p>
      </Section>
      <Section title="8. Limitation of Liability">
        <p>BigTenX is not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount you have withdrawn in the past 30 days.</p>
      </Section>
      <Section title="9. Changes to Terms">
        <p>We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
      </Section>
      <Section title="10. Contact">
        <p>For legal inquiries: <a href="mailto:legal@bigtenx.com" style={{ color: '#ff6f00' }}>legal@bigtenx.com</a></p>
      </Section>
    </PageLayout>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: 'white', fontSize: 17, marginBottom: 12, borderLeft: '3px solid #ff6f00', paddingLeft: 12 }}>{title}</h2>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.8 }}>{children}</div>
    </div>
  )
}
