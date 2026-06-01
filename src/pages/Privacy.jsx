import PageLayout from './PageLayout'

export default function Privacy() {
  return (
    <PageLayout title="Privacy Policy" subtitle="Last updated: May 2025">
      <Section title="1. Information We Collect">
        <p>We collect information you provide directly when you register, including your username, email address, and password. We also collect usage data such as task completions, referral activity, coin balances, and withdrawal history.</p>
      </Section>
      <Section title="2. How We Use Your Information">
        <ul>
          <li>To create and manage your account</li>
          <li>To process coin earnings, stakes, and withdrawals</li>
          <li>To send account-related emails (verification, password reset, notifications)</li>
          <li>To calculate and distribute referral commissions</li>
          <li>To detect and prevent fraud or abuse</li>
        </ul>
      </Section>
      <Section title="3. Data Sharing">
        <p>We do not sell, trade, or rent your personal information to third parties. We may share data with service providers who assist in operating our platform, subject to confidentiality agreements.</p>
      </Section>
      <Section title="4. Data Security">
        <p>Your password is stored as a bcrypt hash and never in plain text. All sensitive data is transmitted over HTTPS. We implement industry-standard security measures to protect your information.</p>
      </Section>
      <Section title="5. Cookies">
        <p>We use localStorage to maintain your session and preferences. No third-party tracking cookies are used.</p>
      </Section>
      <Section title="6. Your Rights">
        <p>You may request deletion of your account and associated data at any time by contacting support. We will process your request within 30 days.</p>
      </Section>
      <Section title="7. Contact">
        <p>For privacy-related inquiries, email us at <a href="mailto:privacy@bigtenx.com" style={{ color: '#ff6f00' }}>privacy@bigtenx.com</a>.</p>
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
