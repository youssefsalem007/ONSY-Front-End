import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import heroBg from '../../assets/hero1.png'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
}

const Hero1 = () => {
  const navigate = useNavigate();

  return (
    <section
      className="relative min-h-screen w-full overflow-hidden flex items-center pt-20"
      style={{ backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
    >
      {/* ── Colour overlay for readability (light + dark) ── */}
      <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/75 transition-colors duration-300" />

      {/* ── Decorative ambient blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-teal-200/40 via-cyan-200/30 to-transparent dark:from-teal-800/20 dark:via-cyan-800/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-teal-100/50 via-emerald-100/30 to-transparent dark:from-teal-900/30 dark:via-emerald-900/20 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 h-[260px] w-[260px] -translate-y-1/2 rounded-full bg-gradient-to-br from-cyan-100/40 to-transparent dark:from-cyan-900/20 blur-2xl" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(#0d9488 1px, transparent 1px), linear-gradient(90deg, #0d9488 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-20 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-start gap-8 max-w-3xl max-md:items-center max-md:text-center"
        >

          {/* Eyebrow badge */}
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 dark:border-teal-700/60 bg-white/70 dark:bg-teal-900/30 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold text-teal-700 dark:text-teal-300 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 dark:bg-teal-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500 dark:bg-teal-400" />
              </span>
              AI-Powered Mental Wellness
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="font-Gabarito text-5xl sm:text-6xl lg:text-[76px] xl:text-[88px] font-medium leading-[1.1] tracking-tight bg-gradient-to-br from-gray-900 via-teal-800 to-teal-500 dark:from-slate-100 dark:via-teal-300 dark:to-teal-500 bg-clip-text text-transparent animate-text-flow"
          >
            AI That Helps Your Mental Health
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl lg:text-2xl font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl"
          >
            Open up, express your feelings, and get AI support to understand emotions,
            reduce stress, and build a healthier mindset.
          </motion.p>

          {/* CTA row */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 mt-2 max-md:w-full"
          >
            <button
              onClick={() => navigate("/SignIn")}
              className="cursor-pointer group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#036464] to-teal-500 dark:from-teal-700 dark:to-teal-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-teal-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/40 active:translate-y-0 max-md:w-full"
            >
              <span className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/20 transition-transform duration-500 group-hover:translate-x-[150%]" />
              <span className="relative">Get Started</span>
              <svg className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>

            <button
              onClick={() => navigate("/EMotiv")}
              className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl border border-teal-200 dark:border-teal-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm px-8 py-3.5 text-base font-semibold text-teal-700 dark:text-teal-300 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-400 dark:hover:border-teal-500 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md active:translate-y-0 max-md:w-full"
            >
              Learn More
            </button>
          </motion.div>

          {/* Social proof strip */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-6 pt-2 max-md:justify-center"
          >
            <div className="flex -space-x-3">
              {['bg-teal-400', 'bg-cyan-400', 'bg-emerald-400', 'bg-sky-400'].map((color, i) => (
                <div
                  key={i}
                  className={`h-9 w-9 rounded-full border-2 border-white dark:border-slate-900 ${color} flex items-center justify-center text-white text-xs font-bold shadow-sm`}
                >
                  {['A', 'M', 'S', 'J'][i]}
                </div>
              ))}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-200">10,000+</span> people improving their mental health
            </div>
            <div className="hidden sm:block h-5 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">4.9</span>
            </div>
          </motion.div>

        </motion.div>
      </div>

      {/* ── Floating decorative card (right side, desktop) ── */}
      <motion.div
        initial={{ opacity: 0, x: 60, y: 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
        className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4"
      >
        {/* Mood card */}
        <div className="w-64 rounded-3xl border border-white/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-5 shadow-xl shadow-teal-100/60 dark:shadow-teal-900/30">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-500 dark:text-teal-400 mb-3">Today's Mood</p>
          <div className="flex justify-between mb-3">
            {['😔', '😐', '🙂', '😊', '😄'].map((emoji, i) => (
              <button key={i} className={`text-2xl transition-transform duration-200 hover:scale-125 ${i === 3 ? 'scale-125' : 'opacity-50'}`}>
                {emoji}
              </button>
            ))}
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400" />
          </div>
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Feeling pretty good today</p>
        </div>

        {/* Insight card */}
        <div className="w-64 rounded-3xl border border-white/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-5 shadow-xl shadow-teal-100/60 dark:shadow-teal-900/30">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-500 dark:text-cyan-400 mb-3">AI Insight</p>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Your stress levels have dropped <span className="font-semibold text-teal-600 dark:text-teal-400">23%</span> this week. Keep up the great reflection habit!
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center">
              <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Onsy AI · just now</span>
          </div>
        </div>
      </motion.div>

    </section>
  )
}

export default Hero1