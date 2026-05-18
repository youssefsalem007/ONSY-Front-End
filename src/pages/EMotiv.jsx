import React, { useState, useEffect, useRef } from 'react'

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

  return (
    <div className="min-h-screen bg-white dark:bg-[#030712] text-slate-900 dark:text-white overflow-x-hidden transition-colors duration-300">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-16 overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-[#030712] dark:to-[#030712]">

        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-teal-100 dark:bg-teal-600/10 blur-[100px] opacity-50 dark:opacity-100" />
          <div
            className="absolute inset-0 opacity-[0.05] dark:opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(20,184,166,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,1) 1px, transparent 1px)',
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        {/* Badge */}
        <div className="relative mb-6 flex items-center gap-2 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs font-semibold px-4 py-1.5 rounded-full tracking-widest uppercase shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
          Next-Gen Neurotechnology
        </div>

        {/* Headline */}
        <h1 className="relative text-center text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
          <span className="text-slate-800 dark:text-slate-50">Meet </span>
          <span className="bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-700 dark:from-teal-400 dark:via-cyan-300 dark:to-teal-500 bg-clip-text text-transparent">
            E-Motiv
          </span>
        </h1>

        <p className="relative max-w-xl text-center text-slate-600 dark:text-slate-400 text-lg md:text-xl leading-relaxed mb-10 font-medium">
          The world's first emotionally-aware EEG headset, built for everyday use.
          Understand your brain. Master your mood. Live better.
        </p>

        {/* CTAs */}
        <div className="relative flex flex-wrap gap-4 justify-center mb-16">
          <a href='https://www.emotiv.com/?srsltid=AfmBOopdt4WsfIppifDnu2PH7Rztn_n2k6PpZUsuq__HaLkFLN4nXnCJ' target='_blank' className="group px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-teal-300 dark:shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-300 dark:hover:shadow-teal-500/50 hover:-translate-y-0.5 transition-all duration-300">
            Pre-Order Now
            <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
        </div>

        {/* Device placeholder */}
        <div className="relative group">
          <div className="absolute inset-0 rounded-3xl bg-teal-300/30 dark:bg-teal-500/20 blur-3xl scale-90 group-hover:scale-105 transition-all duration-700" />
          <img
            src="/emotiv-device.png"
            alt="E-Motiv Device"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
            className="relative w-72 md:w-96 drop-shadow-2xl group-hover:-translate-y-3 transition-transform duration-700"
          />
          <div
            style={{ display: 'none' }}
            className="relative w-72 md:w-80 h-56 rounded-3xl bg-white dark:bg-slate-800/80 border-2 border-teal-100 dark:border-teal-500/20 shadow-2xl shadow-teal-100 dark:shadow-none items-center justify-center flex-col gap-3 group-hover:-translate-y-3 transition-transform duration-700"
          >
            <span className="text-6xl">🧠</span>
            <span className="text-teal-700 dark:text-teal-400 font-bold text-lg tracking-wide">E-Motiv</span>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Headset Visual</span>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 dark:text-slate-600 text-xs font-medium">
          <span>Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border-2 border-slate-300 dark:border-slate-700 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-teal-500 animate-bounce" />
          </div>
        </div>
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
            <div
              key={i}
              className="text-center p-6 rounded-2xl bg-white dark:bg-white/[0.03] border-2 border-slate-100 dark:border-white/8 shadow-md dark:shadow-none hover:border-teal-200 dark:hover:border-teal-500/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="text-4xl font-black bg-gradient-to-r from-teal-600 to-cyan-500 dark:from-teal-400 dark:to-cyan-300 bg-clip-text text-transparent">
                <Counter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-slate-600 dark:text-slate-500 text-sm mt-2 font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6 bg-white dark:bg-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-teal-700 dark:text-teal-400 text-sm font-bold tracking-widest uppercase mb-3">Capabilities</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-800 dark:text-slate-50">
              Everything your brain<br />
              <span className="bg-gradient-to-r from-teal-600 to-cyan-500 dark:from-teal-400 dark:to-cyan-300 bg-clip-text text-transparent">
                deserves to know
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-default overflow-hidden
                  ${hoveredFeature === i
                    ? `bg-slate-50 dark:bg-white/[0.06] border-slate-200 dark:border-white/15 -translate-y-1 shadow-xl ${feat.shadow} dark:shadow-none`
                    : 'bg-white dark:bg-white/[0.03] border-slate-100 dark:border-white/6'
                  }`}
              >
                {hoveredFeature === i && (
                  <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br ${feat.color} opacity-10 blur-3xl pointer-events-none`} />
                )}

                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} text-2xl mb-4 shadow-lg`}>
                  {feat.icon}
                </div>

                <h3 className="font-bold text-slate-800 dark:text-slate-50 text-lg mb-2">{feat.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECS ── */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-transparent border-y border-slate-100 dark:border-transparent">
        <div className="max-w-4xl mx-auto">
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
                <div
                  key={i}
                  className={`px-8 py-6
                    ${i % 3 !== 2 ? 'border-r-2 border-slate-100 dark:border-white/6' : ''}
                    ${i < 3 ? 'border-b-2 border-slate-100 dark:border-white/6' : ''}
                    hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors duration-200`}
                >
                  <div className="text-2xl font-black bg-gradient-to-r from-teal-600 to-cyan-500 dark:from-teal-400 dark:to-cyan-300 bg-clip-text text-transparent mb-1">
                    {spec.value}
                  </div>
                  <div className="text-slate-600 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">{spec.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6 bg-white dark:bg-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-teal-700 dark:text-teal-400 text-sm font-bold tracking-widest uppercase mb-3">Simple Setup</p>
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-slate-50">How it works</h2>
          </div>
          <div className="relative flex flex-col md:flex-row gap-6">
            <div className="hidden md:block absolute top-10 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-teal-300 dark:via-teal-500/40 to-transparent" />
            {[
              { step: '01', title: 'Wear it', desc: 'Put on the E-Motiv headset. The dry sensors auto-adjust to your head shape in seconds.', icon: '🎧' },
              { step: '02', title: 'Connect', desc: 'Pair with ONSY app via Bluetooth. A guided calibration takes just 30 seconds.', icon: '📱' },
              { step: '03', title: 'Discover', desc: 'Watch your emotional state unfold in real-time. Get personalized insights and coaching.', icon: '✨' },
            ].map((step, i) => (
              <div
                key={i}
                className="flex-1 relative flex flex-col items-center text-center p-8 rounded-2xl bg-white dark:bg-white/[0.03] border-2 border-slate-100 dark:border-white/6 shadow-md dark:shadow-none hover:border-teal-200 dark:hover:border-teal-500/30 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{step.icon}</div>
                <div className="text-teal-600 dark:text-teal-500/80 text-xs font-mono font-black tracking-widest mb-2">{step.step}</div>
                <h3 className="text-slate-800 dark:text-slate-50 font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-transparent border-t border-slate-100 dark:border-transparent">
        <div className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl
          bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-600
          dark:from-teal-900/60 dark:via-slate-900 dark:to-cyan-900/40
          border border-teal-500 dark:border-teal-500/20
          shadow-2xl shadow-teal-200 dark:shadow-none
          p-12 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-white/10 dark:bg-teal-500/20 blur-3xl rounded-full pointer-events-none" />
          <p className="relative text-teal-100 dark:text-teal-400 text-sm font-bold tracking-widest uppercase mb-4">Limited Early Access</p>
          <h2 className="relative text-4xl md:text-5xl font-black mb-4 text-white">
            Ready to understand<br />
            <span className="text-teal-200 dark:text-cyan-300">your mind?</span>
          </h2>
          <p className="relative text-teal-50 dark:text-slate-400 mb-8 max-w-md mx-auto font-medium">
            Join thousands of early adopters and be among the first to experience E-Motiv.
          </p>
          <button className="relative group px-10 py-4 rounded-2xl bg-white text-teal-700 font-bold shadow-xl hover:-translate-y-0.5 transition-all duration-300 text-lg hover:shadow-2xl hover:bg-teal-50">
            Get Early Access
            <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </button>
        </div>
      </section>

      <div className="h-16" />
    </div>
  )
}