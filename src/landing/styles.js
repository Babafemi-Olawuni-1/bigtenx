export const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; }

body { font-family: 'Sora', sans-serif; overflow-x: hidden; background: #0a0f1e; color: white; }

/* Shimmer */
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
.shimmer-text {
  background: linear-gradient(90deg, #ff6f00 0%, #ff9a3c 40%, #ff6f00 60%, #ffb347 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 2s linear infinite;
}

/* Float - faster */
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-14px) rotate(2deg); }
}
.animate-float { animation: float ease-in-out infinite; }

/* Fade up - faster */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-up { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards; opacity: 0; }

.delay-100 { animation-delay: 0.08s; }
.delay-200 { animation-delay: 0.16s; }
.delay-300 { animation-delay: 0.24s; }
.delay-400 { animation-delay: 0.32s; }
.delay-500 { animation-delay: 0.40s; }

/* Ripple */
@keyframes ripple { to { transform: scale(4); opacity: 0; } }
.ripple-container { position: relative; overflow: hidden; }
.ripple-effect { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.3); transform: scale(0); animation: ripple 0.5s linear; pointer-events: none; }

/* Scroll reveal - faster */
.reveal { opacity: 0; transform: translateY(22px); transition: opacity 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1); }
.reveal.visible { opacity: 1; transform: translateY(0); }

/* Glow pulse */
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(255,111,0,0.35); }
  50% { box-shadow: 0 0 40px rgba(255,111,0,0.65), 0 0 80px rgba(255,111,0,0.2); }
}
.glow-pulse { animation: glowPulse 2s ease-in-out infinite; }

/* Typing cursor */
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
.cursor { animation: blink 0.8s step-end infinite; }

/* Bottom sheet */
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.slide-up { animation: slideUp 0.35s cubic-bezier(0.22,1,0.36,1) forwards; }

/* Confetti */
@keyframes confettiFall { 0% { transform: translateY(-10px) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
.confetti-piece { animation: confettiFall linear forwards; position: fixed; pointer-events: none; z-index: 9999; border-radius: 2px; top: 0; }

/* Scroll progress */
.scroll-progress { position: fixed; top: 0; left: 0; height: 3px; background: linear-gradient(90deg, #ff6f00, #ff9a3c); z-index: 9999; transition: width 0.1s linear; }

/* Mesh orb */
@keyframes meshMove {
  0%,100% { transform: translate(0,0) scale(1); }
  25% { transform: translate(25px,-18px) scale(1.04); }
  50% { transform: translate(-18px,25px) scale(0.96); }
  75% { transform: translate(18px,18px) scale(1.02); }
}
.mesh-orb { animation: meshMove ease-in-out infinite; border-radius: 50%; filter: blur(80px); position: absolute; pointer-events: none; }

/* Ping */
@keyframes ping { 75%,100% { transform: scale(2); opacity: 0; } }
.animate-ping { animation: ping 1.2s cubic-bezier(0,0,0.2,1) infinite; }

/* Bounce */
@keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
.animate-bounce { animation: bounce 1s ease-in-out infinite; }

/* Cursor glow */
.cursor-glow { position: fixed; width: 280px; height: 280px; border-radius: 50%; background: radial-gradient(circle, rgba(255,111,0,0.07) 0%, transparent 70%); pointer-events: none; z-index: 0; transform: translate(-50%, -50%); transition: left 0.12s ease, top 0.12s ease; }

/* 3D tilt */
.tilt-card { transform-style: preserve-3d; transition: transform 0.25s ease; }
`
