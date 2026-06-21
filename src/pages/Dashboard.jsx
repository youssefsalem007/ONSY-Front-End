import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import axiosInstance from '../utils/axiosInstance'
import { useSocket } from '../context/SocketContext'

// ── Framer Motion Variants ────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
}

// ── SVG Circular Gauge — key prop forces remount on every new value ────────────
// The `gaugeKey` prop must change whenever the value changes so Framer Motion
// re-runs the initial→animate transition (arc fill + number fade-in).
const CircularGauge = ({ value = 0, label = '', gaugeKey }) => {
  const size = 230
  const cx = size / 2
  const cy = size / 2
  const strokeWidth = 30
  const radius = (size - strokeWidth) / 2 - 6
  const circumference = 2 * Math.PI * radius
  const filled = (value / 100) * circumference
  const gap = circumference - filled

  // Colour the arc based on wellness score
  const gradId = `gaugeGrad-${gaugeKey ?? value}`
  const glowId = `arcGlow-${gaugeKey ?? value}`
  const innerGradId = `innerGrad-${gaugeKey ?? value}`

  const startColor = value >= 70 ? '#5dd6e4' : value >= 40 ? '#f0a500' : '#ef4444'
  const midColor   = value >= 70 ? '#1b8799' : value >= 40 ? '#c47d00' : '#b91c1c'
  const endColor   = value >= 70 ? '#0b3645' : value >= 40 ? '#7c4f00' : '#7f1d1d'

  return (
    <svg key={gaugeKey} width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id={gradId} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={startColor} />
          <stop offset="55%"  stopColor={midColor} />
          <stop offset="100%" stopColor={endColor} />
        </linearGradient>
        <radialGradient id={innerGradId} cx="40%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="#e8f5f7" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#c2dde1" stopOpacity="0.3" />
        </radialGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer border ring */}
      <circle cx={cx} cy={cy} r={radius + strokeWidth / 2 + 2}
        fill="none" stroke="rgba(97,132,117,0.18)" strokeWidth={1.5} />

      {/* Background track */}
      <circle cx={cx} cy={cy} r={radius}
        fill="none" stroke="rgba(97,132,117,0.22)" strokeWidth={strokeWidth} />

      {/* Filled progress arc — animates from 0 every time gaugeKey changes */}
      <motion.circle cx={cx} cy={cy} r={radius}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="butt"
        transform={`rotate(-90, ${cx}, ${cy})`}
        filter={`url(#${glowId})`}
        initial={{ strokeDasharray: `0 ${circumference}` }}
        animate={{ strokeDasharray: `${filled} ${gap}` }}
        transition={{ duration: 1.6, ease: 'easeOut', delay: 0.1 }}
      />

      {/* Inner circle depth */}
      <circle cx={cx} cy={cy} r={radius - strokeWidth / 2 - 2}
        fill={`url(#${innerGradId})`} />
      <circle cx={cx} cy={cy} r={radius - strokeWidth / 2 - 2}
        fill="none" stroke="rgba(97,132,117,0.2)" strokeWidth={1} />

      {/* Center text — fades in after arc fills */}
      <motion.text x={cx} y={cy} textAnchor="middle"
        fill="#2d7d8a" fontSize={32} fontWeight={800}
        fontFamily="inherit" letterSpacing="-1"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        {value}%
      </motion.text>
      <motion.text x={cx} y={cy + 24} textAnchor="middle"
        fill="#147E8F" fontSize={14} fontWeight={600}
        fontFamily="inherit"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.4 }}
      >
        {label}
      </motion.text>
    </svg>
  )
}

// ── EEG Metric bar ─────────────────────────────────────────────────────────────
const MetricBar = ({ label, value, color, icon }) => {
  const pct = Math.round((value || 0) * 100)
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
          <span>{icon}</span>{label}
        </span>
        <motion.span
          key={pct}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ color }}
        >
          {pct}%
        </motion.span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden">
        <motion.div
          key={pct}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  )
}

// ── Mood level labels ─────────────────────────────────────────────────────────
const moodLabels = { 1: 'Normal', 2: 'Mild', 3: 'Moderate', 4: 'High Risk' }

const MoodTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const val  = payload[0].value
  const name = val <= 1 ? 'Normal' : val <= 2 ? 'Mild' : val <= 3 ? 'Moderate' : 'High Risk'
  return (
    <div style={{
      background: '#0e6b78', color: '#fff', fontSize: 11, fontWeight: 600,
      padding: '5px 10px', borderRadius: 7, boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    }}>
      Record {label}: <span style={{ color: '#a8e6ef' }}>{name}</span>
    </div>
  )
}

// ── EEG metric config ─────────────────────────────────────────────────────────
const EEG_METRICS = [
  { key: 'focus',      label: 'Focus',      icon: '🎯', color: '#3b82f6' },
  { key: 'engagement', label: 'Engagement', icon: '💡', color: '#ec4899' },
  { key: 'excitement', label: 'Excitement', icon: '🚀', color: '#f97316' },
  { key: 'relaxation', label: 'Relaxation', icon: '🌊', color: '#14b8a6' },
  { key: 'stress',     label: 'Stress',     icon: '⚡', color: '#ef4444' },
  { key: 'interest',   label: 'Interest',   icon: '✨', color: '#818cf8' },
]

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { analysisState, analysisTimestamp } = useSocket()
  const [latestAnalysis, setLatestAnalysis] = useState(null)
  const [historyData, setHistoryData]       = useState([])
  const [loading, setLoading]               = useState(true)
  const [lastUpdated, setLastUpdated]       = useState(null)
  const lastProcessedTimestamp              = useRef(null)
  const [hasPaymentToken]                   = useState(() => {
    try {
      const tokenString = localStorage.getItem('payment_token')
      if (!tokenString) return false
      const tokenData = JSON.parse(tokenString)
      return tokenData && tokenData.expiry && Date.now() < tokenData.expiry
    } catch (err) {
      return false
    }
  })

  // ── Fetch initial data ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch latest AIAnalysis (has result.dominant_emotion, recommendations, eegMetrics…)
        const latestRes = await axiosInstance.get('/analysis/latest').catch(err => {
          // 404 means user has no analyses yet — treat as empty, not a crash
          if (err?.response?.status === 404) return null
          throw err
        })
        if (latestRes?.data?.data) setLatestAnalysis(latestRes.data.data)

        // Fetch history for the line chart
        const historyRes = await axiosInstance.get('/analysis/history').catch(err => {
          if (err?.response?.status === 404) return null
          throw err
        })
        if (historyRes?.data?.data) {
          const formatted = historyRes.data.data
            .slice()
            .reverse()
            .map((item, index) => ({
              index: index + 1,
              mood: item.result?.mental_level || 2,
            }))
          setHistoryData(formatted)
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // ── Live socket / poll updates ─────────────────────────────────────────────
  useEffect(() => {
    if (!analysisState || !analysisTimestamp) return
    if (lastProcessedTimestamp.current === analysisTimestamp) return
    lastProcessedTimestamp.current = analysisTimestamp

    setLatestAnalysis(analysisState)
    setLastUpdated(new Date())
    setHistoryData(prev => {
      const next = [
        ...prev,
        {
          index: prev.length ? prev[prev.length - 1].index + 1 : 1,
          mood: analysisState.result?.mental_level || 2,
        },
      ]
      return next.length > 20 ? next.slice(next.length - 20) : next
    })
  }, [analysisTimestamp])

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="min-h-screen bg-[#FEFDFE] dark:bg-slate-900 transition-colors duration-300 py-24 px-5 sm:px-10 lg:px-16 xl:px-24 flex flex-col gap-10">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-10">
          <div className="flex flex-col gap-6 w-full lg:w-[48%]">
            <div className="w-full h-64 sm:h-80 lg:h-[400px] bg-[#147E8F1A] dark:bg-teal-900/20 rounded-3xl border border-teal-200/30 dark:border-teal-700/30 flex flex-col items-start justify-start px-6 py-5 gap-4 overflow-hidden shadow-lg">
              <div className="skeleton-shimmer h-4 w-48 rounded-full" />
              <div className="flex-1 w-full flex items-end gap-2 pb-2">
                {[45,65,40,75,55,80,50,70,60,85,45,65,72,50,90,60,78,55,68,40].map((h, i) => (
                  <div key={i} className="skeleton-shimmer flex-1 rounded-t-md" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="skeleton-shimmer h-[2px] w-full rounded-full opacity-50" />
            </div>
            <div className="w-full flex flex-col gap-4">
              <div className="skeleton-shimmer h-7 w-52 rounded-full" />
              {[85,70,90,60].map((w, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="skeleton-shimmer w-2 h-2 rounded-full shrink-0" />
                  <div className="skeleton-shimmer h-3.5 rounded-full" style={{ width: `${w}%` }} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-6 w-full lg:w-[48%]">
            <div className="w-full h-64 sm:h-80 lg:h-[400px] bg-[#61847520] dark:bg-slate-800/40 rounded-3xl border border-teal-200/20 dark:border-slate-700/50 flex flex-col items-center justify-center gap-5 shadow-lg">
              <div className="skeleton-shimmer h-4 w-40 rounded-full" />
              <div className="skeleton-shimmer w-40 h-40 sm:w-48 sm:h-48 lg:w-[230px] lg:h-[230px] rounded-full" />
            </div>
            <div className="w-full flex flex-col gap-4">
              <div className="skeleton-shimmer h-7 w-56 rounded-full" />
              <div className="skeleton-shimmer h-4 w-48 rounded-full" />
              <div className="skeleton-shimmer h-4 w-52 rounded-full" />
              <div className="skeleton-shimmer h-4 w-40 rounded-full" />
            </div>

            {hasPaymentToken && (
              <div className="w-full flex flex-col gap-3 mt-2">
                <div className="skeleton-shimmer h-7 w-56 rounded-full" />
                {EEG_METRICS.map((_, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex justify-between">
                      <div className="skeleton-shimmer h-3 w-24 rounded-full" />
                      <div className="skeleton-shimmer h-3 w-8 rounded-full" />
                    </div>
                    <div className="skeleton-shimmer h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }

  // ── Derive display values ──────────────────────────────────────────────────
  const result     = latestAnalysis?.result || {}
  const eegMetrics = result.eegMetrics || {}

  // Mental wellness score: 0-100 (higher = better)
  const currentMoodScore =
    result.risk_score !== undefined
      ? Math.max(0, Math.min(100, Math.round(100 - result.risk_score)))
      : Math.max(0, Math.min(100, Math.round(100 - ((result.mental_level || 2) - 1) * 25)))

  // Gauge key — changes whenever score OR timestamp changes, forcing re-animation
  const gaugeKey = `${currentMoodScore}-${analysisTimestamp ?? 'init'}`

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-[#FEFDFE] dark:bg-slate-900 transition-colors duration-300 py-24 px-5 sm:px-10 lg:px-16 xl:px-24 flex flex-col gap-10"
    >
      {/* ── Live indicator ── */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500" />
          </span>
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">
            Live Dashboard
          </span>
        </div>
        <AnimatePresence mode="wait">
          {lastUpdated && (
            <motion.span
              key={lastUpdated.getTime()}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-slate-400 dark:text-slate-500 font-medium"
            >
              Last updated: {lastUpdated.toLocaleTimeString()}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="flex flex-col lg:flex-row lg:justify-between gap-10">

        {/* ── Left Column ── */}
        <div className="flex flex-col gap-6 w-full lg:w-[48%]">

          {/* Line Chart */}
          <motion.div variants={itemVariants} className="
            w-full h-64 sm:h-80 lg:h-[400px]
            bg-[#147E8F3D] dark:bg-teal-900/30
            rounded-3xl
            shadow-[0_0_40px_0_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_0_rgba(0,0,0,0.4)]
            border border-teal-200/30 dark:border-teal-700/30
            flex flex-col items-center justify-center
            px-2 py-4
          ">
            <h3 className="text-[#2d5c5c] dark:text-teal-300 font-semibold mb-2">
              Mental Level History (Last 20)
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 20, right: 16, left: 4, bottom: 24 }}>
                <CartesianGrid vertical horizontal={false}
                  stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
                <XAxis
                  dataKey="index"
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(20,126,143,0.35)' }}
                  tick={{ fill: '#3a7c89', fontSize: 10, fontWeight: 500 }}
                  label={{
                    value: 'Records', position: 'insideBottom', offset: -12,
                    style: { fill: '#147E8F', fontSize: 12, fontWeight: 700 },
                  }}
                />
                <YAxis
                  domain={[1, 4]} ticks={[1, 2, 3, 4]}
                  reversed={true}
                  tickLine={false} axisLine={false} width={72}
                  tickFormatter={(v) => moodLabels[v] ?? ''}
                  tick={{ fill: '#3a7c89', fontSize: 10, fontWeight: 500 }}
                  label={{
                    value: 'Mood Level', angle: -90, position: 'insideLeft', offset: 14,
                    style: { fill: '#147E8F', fontSize: 12, fontWeight: 700 },
                  }}
                />
                <Tooltip content={<MoodTooltip />}
                  cursor={{ stroke: 'rgba(20,126,143,0.3)', strokeWidth: 1 }} />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#0e6b78"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#0e6b78' }}
                  activeDot={{ r: 5, fill: '#0e6b78', stroke: 'white', strokeWidth: 2 }}
                  isAnimationActive={true}
                  animationDuration={800}
                  animationEasing="ease-out"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* AI Recommendations */}
          <motion.div variants={itemVariants} className="w-full flex flex-col gap-4">
            <h2 className="font-bold text-xl sm:text-2xl text-[#111111] dark:text-slate-100">
              AI Recommendations
            </h2>
            <AnimatePresence mode="wait">
              {result.recommendations && result.recommendations.length > 0 ? (
                <motion.ul
                  key={analysisTimestamp ?? 'recs'}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col gap-3 font-medium list-disc pl-5 text-[#5F5F5F] dark:text-slate-400"
                >
                  {result.recommendations.map((rec, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.07 }}
                    >
                      <span className="text-[#147E8F] dark:text-teal-400">{rec}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              ) : (
                <motion.p
                  key="no-recs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[#5F5F5F] dark:text-slate-400"
                >
                  No recommendations yet. Upload EEG data or log a mood to get started.
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* ── Right Column ── */}
        <div className="flex flex-col gap-6 w-full lg:w-[48%]">

          {/* Gauge Card — key forces full remount & re-animation on each update */}
          <motion.div variants={itemVariants} className="
            w-full h-64 sm:h-80 lg:h-[400px]
            bg-[#61847547] dark:bg-slate-800/50
            rounded-3xl
            shadow-[0_0_40px_0_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_0_rgba(0,0,0,0.4)]
            border border-teal-200/20 dark:border-slate-700/50
            flex flex-col items-center justify-center gap-3
          ">
            <p className="text-[#2d5c5c] dark:text-teal-300 font-semibold text-base tracking-wide">
              Mental Wellness Score
            </p>
            <div className="w-40 h-40 sm:w-48 sm:h-48 lg:w-[230px] lg:h-[230px]">
              <CircularGauge
                key={gaugeKey}
                gaugeKey={gaugeKey}
                value={currentMoodScore}
                label={result.dominant_emotion || 'Unknown'}
              />
            </div>
          </motion.div>

          {/* Current Mental State */}
          <motion.div variants={itemVariants} className="w-full flex flex-col gap-4">
            <h2 className="font-bold text-xl sm:text-2xl text-[#111111] dark:text-slate-100">
              Current Mental State
            </h2>
            <AnimatePresence mode="wait">
              <motion.ul
                key={analysisTimestamp ?? 'state'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-4 font-semibold list-disc pl-5 text-[#5F5F5F] dark:text-slate-400"
              >
                <li>
                  Dominant Emotion:{' '}
                  <span className="text-[#147E8F] dark:text-teal-400 capitalize">
                    {result.dominant_emotion || 'N/A'}
                  </span>
                </li>
                <li>
                  Sentiment:{' '}
                  <span className="text-[#147E8F] dark:text-teal-400 capitalize">
                    {result.sentiment || 'N/A'}
                  </span>
                  {result.sentiment_score !== undefined && (
                    <span className="text-sm ml-2 opacity-70">
                      (Score: {result.sentiment_score.toFixed(2)})
                    </span>
                  )}
                </li>
                <li>
                  Mental Level:{' '}
                  <span className="text-[#147E8F] dark:text-teal-400">
                    {moodLabels[result.mental_level] || 'N/A'}
                  </span>
                </li>
                {result.emotions && (
                  <li className="mt-1">
                    <div className="flex flex-wrap gap-2 mt-1">
                      {Object.entries(result.emotions).map(([emo, val]) => (
                        <motion.span
                          key={emo}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 px-2 py-1 rounded text-xs"
                        >
                          {emo}: {(val * 100).toFixed(1)}%
                        </motion.span>
                      ))}
                    </div>
                  </li>
                )}
              </motion.ul>
            </AnimatePresence>
          </motion.div>

          {/* EEG Metrics — real-time bars */}
          {hasPaymentToken && (
            <motion.div variants={itemVariants} className="w-full flex flex-col gap-4">
              <h2 className="font-bold text-xl sm:text-2xl text-[#111111] dark:text-slate-100">
                EEG Brain Metrics
              </h2>
              <AnimatePresence mode="wait">
                {Object.keys(eegMetrics).length > 0 ? (
                  <motion.div
                    key={analysisTimestamp ?? 'eeg'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-3"
                  >
                    {EEG_METRICS.map((m) => (
                      <MetricBar
                        key={m.key}
                        label={m.label}
                        icon={m.icon}
                        color={m.color}
                        value={eegMetrics[m.key] ?? 0}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.p
                    key="no-eeg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[#5F5F5F] dark:text-slate-400 text-sm"
                  >
                    No EEG data yet. Upload a CSV on the E-Motiv page.
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}

        </div>
      </div>
    </motion.section>
  )
}

export default Dashboard