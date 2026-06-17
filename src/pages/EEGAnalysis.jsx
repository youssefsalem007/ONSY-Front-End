import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { useSocket } from '../context/SocketContext'
import { eegService } from '../services/eegService'

// ── Metric config ─────────────────────────────────────────────────────────────
const METRIC_CONFIG = [
  { key: 'focus', label: 'Attention', color: '#3b82f6', bar: 'bg-blue-500', icon: '🎯' },
  { key: 'focus', label: 'Focus', color: '#10b981', bar: 'bg-emerald-500', icon: '🔍' },
  { key: 'interest', label: 'Interest', color: '#818cf8', bar: 'bg-indigo-400', icon: '✨' },
  { key: 'stress', label: 'Stress', color: '#ef4444', bar: 'bg-red-500', icon: '⚡' },
  { key: 'relaxation', label: 'Relaxation', color: '#14b8a6', bar: 'bg-teal-500', icon: '🌊' },
  { key: 'excitement', label: 'Excitement', color: '#f97316', bar: 'bg-orange-500', icon: '🚀' },
  { key: 'engagement', label: 'Engagement', color: '#ec4899', bar: 'bg-pink-500', icon: '💡' },
]

// ── Animated number ───────────────────────────────────────────────────────────
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let frame
    let start = 0
    const step = Math.ceil(value / 40)
    const run = () => {
      start += step
      if (start >= value) { setDisplay(value); return }
      setDisplay(start)
      frame = requestAnimationFrame(run)
    }
    setDisplay(0)
    if (value > 0) frame = requestAnimationFrame(run)
    return () => cancelAnimationFrame(frame)
  }, [value])
  return <>{display}</>
}

// ── Skeleton pieces ───────────────────────────────────────────────────────────
const SkeletonMetricCard = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
    className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 flex flex-col items-center justify-center relative overflow-hidden h-36 shadow-sm border border-slate-100 dark:border-slate-700/40"
  >
    <div className="skeleton-shimmer h-3.5 w-20 rounded-full mb-3" />
    <div className="skeleton-shimmer h-9 w-16 rounded-full mb-4" />
    <div className="absolute bottom-4 left-4 right-4 h-1.5 skeleton-shimmer rounded-full" />
  </motion.div>
)

const SkeletonFaceCard = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
    className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 flex flex-col items-center justify-center h-36 shadow-sm border border-slate-100 dark:border-slate-700/40 gap-3"
  >
    <div className="skeleton-shimmer h-3.5 w-24 rounded-full" />
    <div className="skeleton-shimmer h-5 w-20 rounded-full" />
  </motion.div>
)

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EEGAnalysis() {
  const { analysisState, analysisTimestamp } = useSocket()
  const [latestAnalysis, setLatestAnalysis] = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [analysing, setAnalysing] = useState(false)    // upload in-flight
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)
  const lastTs = useRef(null)

  // ── Initial setup
  useEffect(() => {
    setPageLoading(false)
  }, [])

  // ── Socket live updates
  useEffect(() => {
    if (!analysisState || !analysisTimestamp) return
    if (lastTs.current === analysisTimestamp) return
    lastTs.current = analysisTimestamp
    setLatestAnalysis(analysisState)
    setAnalysing(false)
  }, [analysisTimestamp])

  // ── Derived data
  const result = latestAnalysis?.result || null
  const eegMetrics = result?.eegMetrics || null
  const metrics = eegMetrics || {}

  const eegData = METRIC_CONFIG.map(m => ({
    ...m,
    value: eegMetrics ? Math.round((metrics[m.key] || 0) * 100) : null,
  }))

  const eyeBlinks = eegMetrics ? Math.max(10, Math.round((metrics.focus || 0.5) * 450)) : null
  const eyeDir = eegMetrics ? (metrics.focus > 0.5 ? 'Center' : 'Wandering') : null
  const upperFace = eegMetrics
    ? (metrics.excitement > 0.4 ? 'Brow Raise' : metrics.stress > 0.5 ? 'Frown' : 'Neutral')
    : null
  const lowerFace = eegMetrics ? (metrics.engagement > 0.6 ? 'Smile' : 'Neutral') : null

  // ── File handling
  const handleFileChange = e => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }
  const handleDrop = e => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) setFile(f)
  }

  // ── Upload
  const handleUpload = async () => {
    if (!file) { toast.error('Please select a CSV file first.'); return }
    if (!file.name.endsWith('.csv')) { toast.error('Only .csv files are allowed.'); return }

    const currentFile = file;
    setAnalysing(true)
    setFile(null)

    try {
      await eegService.uploadEegData(currentFile)
      toast.success('EEG data uploaded! Analysing…')
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to upload EEG data.'
      toast.error(errorMsg)
      setAnalysing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-[#030712] dark:via-slate-900 dark:to-[#030712] text-slate-900 dark:text-white transition-colors duration-300"
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-28 pb-20 flex flex-col gap-12">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-xs font-bold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            E-Motiv · EEG Analysis
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-800 dark:text-slate-50">
            Real-Time{' '}
            <span className="bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-700 dark:from-teal-400 dark:via-cyan-300 dark:to-teal-500 bg-clip-text text-transparent">
              Brain Analysis
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-xl">
            Upload your exported <code className="bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-1.5 py-0.5 rounded text-sm">.csv</code> file from the Emotiv Insight 2 headset to generate real-time AI analysis.
          </p>
        </motion.div>

        {/* ── Upload Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full rounded-3xl bg-white dark:bg-slate-800/60 border-2 border-dashed border-teal-200 dark:border-teal-700/50 shadow-xl backdrop-blur-md overflow-hidden"
        >
          <div
            className={`p-8 md:p-12 flex flex-col items-center gap-6 transition-all duration-300 ${dragOver ? 'bg-teal-50/80 dark:bg-teal-900/20' : ''
              }`}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {/* Icon */}
            <motion.div
              animate={dragOver ? { scale: 1.1 } : { scale: 1 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/60 dark:to-cyan-900/40 flex items-center justify-center shadow-inner"
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </motion.div>

            <div className="flex flex-col items-center gap-1 text-center">
              <p className="font-bold text-slate-700 dark:text-slate-200 text-lg">
                {file ? file.name : 'Drop your .csv file here'}
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                {file ? `${(file.size / 1024).toFixed(1)} KB · ready to upload` : 'or click to browse'}
              </p>
            </div>

            {/* Hidden input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 rounded-2xl font-semibold text-sm border-2 border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all duration-200"
              >
                {file ? 'Change File' : 'Choose File'}
              </button>

              <motion.button
                whileHover={!analysing && file ? { y: -2 } : {}}
                whileTap={!analysing && file ? { scale: 0.97 } : {}}
                onClick={handleUpload}
                disabled={analysing || !file}
                className={`flex-1 py-3 rounded-2xl font-bold text-sm text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${analysing || !file
                  ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-teal-600 to-cyan-500 hover:shadow-teal-300/50 dark:hover:shadow-teal-500/30'
                  }`}
              >
                {analysing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analysing…
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload Data
                  </>
                )}
              </motion.button>
            </div>

            {/* Analysing pulse banner */}
            <AnimatePresence>
              {analysing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full max-w-sm overflow-hidden"
                >
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700/50">
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500" />
                    </span>
                    <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                      AI is processing your EEG data… results will appear below
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Results ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col gap-10"
        >

          {/* Performance Metrics */}
          <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700/60" />
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">
                Performance Metrics
              </h2>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700/60" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {pageLoading || analysing ? (
                METRIC_CONFIG.map((_, i) => <SkeletonMetricCard key={i} delay={i * 0.06} />)
              ) : (
                eegData.map((metric, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: idx * 0.07 }}
                    className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 flex flex-col items-center justify-center relative overflow-hidden h-36 shadow-sm border border-slate-100 dark:border-slate-700/40 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                  >
                    <span className="text-xl mb-1">{metric.icon}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-semibold text-xs mb-2 tracking-wide">
                      {metric.label}
                    </span>
                    <span className="text-3xl font-light" style={{ color: metric.color }}>
                      {metric.value !== null ? <><AnimatedNumber value={metric.value} />%</> : 'N/A'}
                    </span>
                    <div className="absolute bottom-3 left-4 right-4 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.value || 0}%` }}
                        transition={{ duration: 1.2, delay: idx * 0.1, ease: 'easeOut' }}
                        className={`h-full ${metric.bar}`}
                        style={{ borderRadius: '999px' }}
                      />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Facial & Eye Tracking */}
          <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700/60" />
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">
                Facial &amp; Eye Tracking
              </h2>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700/60" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {pageLoading || analysing ? (
                [0, 1, 2, 3].map(i => <SkeletonFaceCard key={i} delay={i * 0.07} />)
              ) : (
                [
                  { label: 'Eye Blinks', value: eyeBlinks !== null ? `${eyeBlinks} times` : 'N/A', color: 'text-blue-500', icon: '👁' },
                  { label: 'Eye Direction', value: eyeDir || 'N/A', color: 'text-slate-700 dark:text-slate-200', icon: '👀' },
                  { label: 'Upper Face', value: upperFace || 'N/A', color: 'text-indigo-500', icon: '🤨' },
                  { label: 'Lower Face', value: lowerFace || 'N/A', color: 'text-slate-700 dark:text-slate-200', icon: '😐' },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-36 shadow-sm border border-slate-100 dark:border-slate-700/40 gap-2 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-semibold text-xs tracking-wide">
                      {item.label}
                    </span>
                    <span className={`text-base font-semibold ${item.color}`}>
                      {item.value}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* No data hint */}
          <AnimatePresence>
            {!pageLoading && !analysing && !eegMetrics && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 py-10 text-center"
              >
                <span className="text-5xl">🧠</span>
                <p className="text-slate-400 dark:text-slate-500 font-medium">
                  No analysis data yet. Upload a .csv file above to get started.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </motion.div>
  )
}
