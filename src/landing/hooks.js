import { useEffect, useRef, useState, useCallback } from 'react'

/* Scroll reveal observer */
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) } }),
      { threshold: 0.12 }
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

/* Animated counter with easing */
export function useCounter(target, duration = 1800) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started.current) return
      started.current = true
      observer.disconnect()
      const startTime = performance.now()
      const tick = (now) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        // Elastic easing
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress) * Math.cos((progress * 10 - 0.75) * (2 * Math.PI) / 3)
        setCount(Math.floor(eased * target))
        if (progress < 1) requestAnimationFrame(tick)
        else setCount(target)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])
  return [count, ref]
}

/* 3D tilt on card */
export function useTilt(strength = 12) {
  const ref = useRef(null)
  const handleMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(600px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) scale(1.02)`
  }, [strength])
  const handleLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)'
  }, [])
  return { ref, onMouseMove: handleMove, onMouseLeave: handleLeave }
}

/* Ripple effect */
export function useRipple() {
  const createRipple = useCallback((e) => {
    const btn = e.currentTarget
    const circle = document.createElement('span')
    const diameter = Math.max(btn.clientWidth, btn.clientHeight)
    const radius = diameter / 2
    const rect = btn.getBoundingClientRect()
    circle.style.width = circle.style.height = `${diameter}px`
    circle.style.left = `${e.clientX - rect.left - radius}px`
    circle.style.top = `${e.clientY - rect.top - radius}px`
    circle.classList.add('ripple-effect')
    btn.querySelector('.ripple-effect')?.remove()
    btn.appendChild(circle)
  }, [])
  return createRipple
}

/* Scroll progress */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const el = document.documentElement
        const scrolled = el.scrollTop / (el.scrollHeight - el.clientHeight)
        setProgress(Math.min(scrolled * 100, 100))
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return progress
}

/* Cursor glow position */
export function useCursorGlow() {
  const [pos, setPos] = useState({ x: -300, y: -300 })
  useEffect(() => {
    const onMove = (e) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])
  return pos
}

/* Confetti */
export function useConfetti() {
  const fire = useCallback(() => {
    // Clean up any existing confetti first
    document.querySelectorAll('.confetti-piece').forEach(el => el.remove())
    const colors = ['#ff6f00', '#ff9a3c', '#001F54', '#0a3080', '#ffffff']
    for (let i = 0; i < 80; i++) {
      const el = document.createElement('div')
      el.classList.add('confetti-piece')
      el.style.left = `${Math.random() * 100}vw`
      el.style.top = '-10px'
      el.style.width = `${Math.random() * 8 + 4}px`
      el.style.height = `${Math.random() * 8 + 4}px`
      el.style.background = colors[Math.floor(Math.random() * colors.length)]
      el.style.animationDuration = `${Math.random() * 2 + 1.5}s`
      el.style.animationDelay = `${Math.random() * 0.5}s`
      document.body.appendChild(el)
      el.addEventListener('animationend', () => el.remove())
    }
    // Force cleanup after 4s regardless
    setTimeout(() => document.querySelectorAll('.confetti-piece').forEach(el => el.remove()), 4000)
  }, [])
  return fire
}

/* Typing animation */
export function useTyping(words, speed = 80, pause = 1800) {
  const [display, setDisplay] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)
  useEffect(() => {
    const current = words[wordIdx]
    const timeout = setTimeout(() => {
      if (!deleting) {
        setDisplay(current.slice(0, charIdx + 1))
        if (charIdx + 1 === current.length) setTimeout(() => setDeleting(true), pause)
        else setCharIdx(c => c + 1)
      } else {
        setDisplay(current.slice(0, charIdx - 1))
        if (charIdx - 1 === 0) { setDeleting(false); setWordIdx(w => (w + 1) % words.length); setCharIdx(0) }
        else setCharIdx(c => c - 1)
      }
    }, deleting ? speed / 2 : speed)
    return () => clearTimeout(timeout)
  }, [charIdx, deleting, wordIdx, words, speed, pause])
  return display
}
