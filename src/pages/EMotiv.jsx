import React, { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { getToken } from '../utils/cookieUtils'

/* ── Reusable scroll-reveal wrapper ── */
const Reveal = ({ children, delay = 0, className = '', y = 30 }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── Feature data ── */
const features = [
  {
    icon: '🧠',
    title: 'Brain Wave Detection',
    desc: 'Reads Alpha, Beta, Delta, Theta & Gamma waves in real-time with medical-grade precision using 14 dry electrodes.',
    color: 'from-teal-500 to-cyan-400',
    shadow: 'hover:shadow-teal-200',
  },
  {
    icon: '❤️',
    title: 'Emotion Recognition',
    desc: 'AI-powered engine maps your brainwave patterns to 8 distinct emotional states — stress, joy, focus, calm, and more.',
    color: 'from-rose-500 to-pink-400',
    shadow: 'hover:shadow-rose-200',
  },
  {
    icon: '📡',
    title: 'Wireless & Bluetooth',
    desc: 'Low-latency Bluetooth 5.2 connection streams data straight to the ONSY app with zero wires and up to 12 hours battery.',
    color: 'from-blue-500 to-indigo-400',
    shadow: 'hover:shadow-blue-200',
  },
  {
    icon: '🔒',
    title: 'Private & Secure',
    desc: 'All data is encrypted on-device before transmission. Your mental data never leaves without your explicit consent.',
    color: 'from-violet-500 to-purple-400',
    shadow: 'hover:shadow-violet-200',
  },
  {
    icon: '⚡',
    title: 'Real-Time Feedback',
    desc: 'Instant haptic & audio cues guide breathing, focus sessions, and mood regulation the moment your brain signals shift.',
    color: 'from-amber-500 to-orange-400',
    shadow: 'hover:shadow-amber-200',
  },
  {
    icon: '📊',
    title: 'Deep Analytics',
    desc: 'Weekly & monthly trend reports, sleep quality scoring, and focus performance benchmarks visualized beautifully in the dashboard.',
    color: 'from-emerald-500 to-green-400',
    shadow: 'hover:shadow-emerald-200',
  },
]

const specs = [
  { label: 'Channels', value: '14 EEG' },
  { label: 'Sample Rate', value: '256 Hz' },
  { label: 'Battery Life', value: '12 hrs' },
  { label: 'Connectivity', value: 'BT 5.2' },
  { label: 'Resolution', value: '16-bit' },
  { label: 'Weight', value: '68 g' },
]

/* ── Animated counter ── */
const Counter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        let start = 0
        const step = Math.ceil(target / 60)
        const timer = setInterval(() => {
          start += step
          if (start >= target) { setCount(target); clearInterval(timer) }
          else setCount(start)
        }, 16)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{count}{suffix}</span>
}

export default function EMotiv() {
  const [hoveredFeature, setHoveredFeature] = useState(null)
  const [hasPaid, setHasPaid] = useState(false)
  const navigate = useNavigate()

  // Check once on mount whether the user already completed payment
  useEffect(() => {
    setHasPaid(localStorage.getItem('emotiv_paid') === 'true')
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white dark:bg-[#030712] text-slate-900 dark:text-white overflow-x-hidden transition-colors duration-300"
    >

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-16 overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-[#030712] dark:to-[#030712]">

        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-teal-100 dark:bg-teal-600/10 blur-[100px] dark:opacity-100"
          />
          <div
            className="absolute inset-0 opacity-[0.05] dark:opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(20,184,166,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,1) 1px, transparent 1px)',
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative mb-6 flex items-center gap-2 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs font-semibold px-4 py-1.5 rounded-full tracking-widest uppercase shadow-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
          Next-Gen Neurotechnology
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative text-center text-5xl md:text-7xl font-black tracking-tight leading-none mb-6"
        >
          <span className="text-slate-800 dark:text-slate-50">Meet </span>
          <span className="bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-700 dark:from-teal-400 dark:via-cyan-300 dark:to-teal-500 bg-clip-text text-transparent">
            E-Motiv
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="relative max-w-xl text-center text-slate-600 dark:text-slate-400 text-lg md:text-xl leading-relaxed mb-10 font-medium"
        >
          The world's first emotionally-aware EEG headset, built for everyday use.
          Understand your brain. Master your mood. Live better.
        </motion.p>

        {/* CTA button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative flex flex-col items-center gap-6 mb-16 w-full z-10"
        >

          <motion.a
            href="https://www.emotiv.com/?srsltid=AfmBOopdt4WsfIppifDnu2PH7Rztn_n2k6PpZUsuq__HaLkFLN4nXnCJ"
            target="_blank"
            rel="noreferrer"
            whileHover={{ y: -3, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-teal-300 dark:shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-300 dark:hover:shadow-teal-500/50 transition-shadow duration-300"
          >
            Pre-Order Now
            <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </motion.a>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 cursor-pointer group"
        >
          <span className="text-teal-600 dark:text-teal-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase bg-teal-50/80 dark:bg-teal-900/40 px-4 py-1.5 rounded-full shadow-sm backdrop-blur-sm border border-teal-100 dark:border-teal-800 transition-colors group-hover:bg-teal-100 dark:group-hover:bg-teal-800/50">
            Scroll down for Early Access
          </span>
          <div className="w-6 h-10 rounded-full border-2 border-teal-200 dark:border-teal-700/60 flex items-start justify-center pt-2 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1.5 h-3 rounded-full bg-gradient-to-b from-teal-500 to-cyan-400"
            />
          </div>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="py-20 px-6 bg-slate-50 dark:bg-transparent border-y border-slate-100 dark:border-transparent">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: 98, suffix: '%', label: 'Accuracy Rate' },
            { value: 14, suffix: '', label: 'EEG Channels' },
            { value: 12, suffix: 'h', label: 'Battery Life' },
            { value: 8, suffix: '+', label: 'Emotions Detected' },
          ].map((stat, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="text-center p-6 rounded-2xl bg-white dark:bg-white/[0.03] border-2 border-slate-100 dark:border-white/8 shadow-md dark:shadow-none hover:border-teal-200 dark:hover:border-teal-500/30 hover:-translate-y-0.5 transition-all duration-300">
                <div className="text-4xl font-black bg-gradient-to-r from-teal-600 to-cyan-500 dark:from-teal-400 dark:to-cyan-300 bg-clip-text text-transparent">
                  <Counter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-slate-600 dark:text-slate-500 text-sm mt-2 font-semibold">{stat.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6 bg-white dark:bg-transparent">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-teal-700 dark:text-teal-400 text-sm font-bold tracking-widest uppercase mb-3">Capabilities</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-800 dark:text-slate-50">
              Everything your brain<br />
              <span className="bg-gradient-to-r from-teal-600 to-cyan-500 dark:from-teal-400 dark:to-cyan-300 bg-clip-text text-transparent">
                deserves to know
              </span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, i) => (
              <Reveal key={i} delay={i * 0.08} y={20}>
                <motion.div
                  onMouseEnter={() => setHoveredFeature(i)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.25 }}
                  className={`relative p-6 rounded-2xl border-2 transition-colors duration-300 cursor-default overflow-hidden h-full
                    ${hoveredFeature === i
                      ? `bg-slate-50 dark:bg-white/[0.06] border-slate-200 dark:border-white/15 shadow-xl ${feat.shadow} dark:shadow-none`
                      : 'bg-white dark:bg-white/[0.03] border-slate-100 dark:border-white/6'
                    }`}
                >
                  {hoveredFeature === i && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br ${feat.color} opacity-10 blur-3xl pointer-events-none`}
                    />
                  )}
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} text-2xl mb-4 shadow-lg`}>
                    {feat.icon}
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-50 text-lg mb-2">{feat.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECS ── */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-transparent border-y border-slate-100 dark:border-transparent">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="rounded-3xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 border-2 border-slate-100 dark:border-white/8 shadow-lg dark:shadow-none overflow-hidden">
              <div className="px-8 py-8 border-b-2 border-slate-100 dark:border-white/8 flex items-center gap-4 bg-slate-50 dark:bg-transparent">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center text-xl">⚙️</div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-50">Technical Specifications</h2>
                  <p className="text-slate-600 dark:text-slate-500 text-sm font-medium">Hardware built to clinical standards</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3">
                {specs.map((spec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.4, delay: i * 0.07 }}
                    className={`px-8 py-6
                      ${i % 3 !== 2 ? 'border-r-2 border-slate-100 dark:border-white/6' : ''}
                      ${i < 3 ? 'border-b-2 border-slate-100 dark:border-white/6' : ''}
                      hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors duration-200`}
                  >
                    <div className="text-2xl font-black bg-gradient-to-r from-teal-600 to-cyan-500 dark:from-teal-400 dark:to-cyan-300 bg-clip-text text-transparent mb-1">
                      {spec.value}
                    </div>
                    <div className="text-slate-600 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">{spec.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6 bg-white dark:bg-transparent">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-teal-700 dark:text-teal-400 text-sm font-bold tracking-widest uppercase mb-3">Simple Setup</p>
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-slate-50">How it works</h2>
          </Reveal>
          <div className="relative flex flex-col md:flex-row gap-6">
            <div className="hidden md:block absolute top-10 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-teal-300 dark:via-teal-500/40 to-transparent" />
            {[
              { step: '01', title: 'Wear it', desc: 'Put on the E-Motiv headset. The dry sensors auto-adjust to your head shape in seconds.', icon: '🎧' },
              { step: '02', title: 'Connect', desc: 'Pair with ONSY app via Bluetooth. A guided calibration takes just 30 seconds.', icon: '📱' },
              { step: '03', title: 'Discover', desc: 'Watch your emotional state unfold in real-time. Get personalized insights and coaching.', icon: '✨' },
            ].map((step, i) => (
              <Reveal key={i} delay={i * 0.15} y={24} className="flex-1">
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="relative flex flex-col items-center text-center p-8 rounded-2xl bg-white dark:bg-white/[0.03] border-2 border-slate-100 dark:border-white/6 shadow-md dark:shadow-none hover:border-teal-200 dark:hover:border-teal-500/30 transition-colors duration-300 h-full"
                >
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <div className="text-teal-600 dark:text-teal-500/80 text-xs font-mono font-black tracking-widest mb-2">{step.step}</div>
                  <h3 className="text-slate-800 dark:text-slate-50 font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-transparent border-t border-slate-100 dark:border-transparent">
        <Reveal y={20}>
          <div className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl
            bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-600
            dark:from-teal-900/60 dark:via-slate-900 dark:to-cyan-900/40
            border border-teal-500 dark:border-teal-500/20
            shadow-2xl shadow-teal-200 dark:shadow-none
            p-12 text-center"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-white/10 dark:bg-teal-500/20 blur-3xl rounded-full pointer-events-none" />
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative text-teal-100 dark:text-teal-400 text-sm font-bold tracking-widest uppercase mb-4"
            >
              Limited Early Access
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative text-4xl md:text-5xl font-black mb-4 text-white"
            >
              Ready to understand<br />
              <span className="text-teal-200 dark:text-cyan-300">your mind?</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative text-teal-50 dark:text-slate-400 mb-8 max-w-md mx-auto font-medium"
            >
              Join thousands of early adopters and be among the first to experience E-Motiv.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative inline-flex flex-col items-center gap-5 mt-4"
            >
              {/* Animated arrows pointing down */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="flex flex-col items-center text-teal-100 dark:text-cyan-200 drop-shadow-md"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="7 13 12 18 17 13"></polyline>
                  <polyline points="7 6 12 11 17 6"></polyline>
                </svg>
              </motion.div>

              <div className="relative">
                {/* Glowing pulse ring behind button */}
                <div className="absolute -inset-1.5 rounded-[1.3rem] bg-gradient-to-r from-teal-200 to-white dark:from-cyan-300 dark:to-teal-300 opacity-60 blur-lg animate-pulse" />

                <motion.button
                  whileHover={{ y: -3, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(hasPaid ? '/EEGAnalysis' : '/checkout')}
                  className="relative group px-12 py-4 rounded-2xl bg-white text-teal-800 font-black shadow-2xl transition-all duration-300 text-xl hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] ring-4 ring-white/40 dark:ring-white/20"
                >
                  {hasPaid ? 'Go to EEG Analysis' : 'Get Early Access'}
                  <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-2">→</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </Reveal>
      </section>

      <div className="h-16" />
    </motion.div>
  )
}