import { useReveal, useScrollProgress, useCursorGlow } from '../landing/hooks'
import { FONTS } from '../landing/styles'
import Navbar from '../landing/Navbar'
import Hero from '../landing/Hero'
import Stats from '../landing/Stats'
import Features from '../landing/Features'
import HowItWorks from '../landing/HowItWorks'
import Levels from '../landing/Levels'
import Testimonials from '../landing/Testimonials'
import CTABanner from '../landing/CTABanner'
import Footer from '../landing/Footer'

export default function LandingPage({ onGetStarted, darkMode, setDarkMode }) {
  useReveal()
  const scrollProgress = useScrollProgress()
  const cursorPos = useCursorGlow()

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', color: 'white' }}>
      <style dangerouslySetInnerHTML={{ __html: FONTS }} />

      {/* Scroll progress */}
      <div style={{ position: 'fixed', top: 0, left: 0, height: 3, width: `${scrollProgress}%`, background: 'linear-gradient(90deg,#ff6f00,#ff9a3c)', zIndex: 9999, transition: 'width 0.1s linear' }} />

      {/* Cursor glow - desktop only */}
      <div className="cursor-glow" style={{ left: cursorPos.x, top: cursorPos.y, display: 'none' }} id="cursor-glow" />
      <style>{`@media(min-width:768px){#cursor-glow{display:block!important}}`}</style>

      <Navbar onLaunch={onGetStarted} darkMode={true} setDarkMode={setDarkMode} />
      <Hero onGetStarted={onGetStarted} />
      <Stats />
      <Features />
      <HowItWorks />
      <Levels />
      <Testimonials />
      <CTABanner onGetStarted={onGetStarted} />
      <Footer />
    </div>
  )
}
