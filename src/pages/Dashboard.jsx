import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
  ResponsiveContainer,
} from 'recharts'
import axiosInstance from '../utils/axiosInstance'
import { useSocket } from '../context/SocketContext'

// ── Framer Motion Variants ────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: "easeOut" } 
  },
}

// ── SVG Circular Gauge — scales via CSS wrapper ───────────────────────────────
const CircularGauge = ({ value = 0, label = "" }) => {
  const size = 230
  const cx = size / 2
  const cy = size / 2
  const strokeWidth = 30
  const radius = (size - strokeWidth) / 2 - 6
  const circumference = 2 * Math.PI * radius
  const filled = (value / 100) * circumference
  const gap = circumference - filled

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="gaugeGrad" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#5dd6e4" />
          <stop offset="55%"  stopColor="#1b8799" />
          <stop offset="100%" stopColor="#0b3645" />
        </linearGradient>
        <radialGradient id="innerGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="#e8f5f7" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#c2dde1" stopOpacity="0.3" />
        </radialGradient>
        <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
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

      {/* Filled progress arc */}
      <motion.circle cx={cx} cy={cy} r={radius}
        fill="none"
        stroke="url(#gaugeGrad)"
        strokeWidth={strokeWidth}
        strokeLinecap="butt"
        transform={`rotate(-90, ${cx}, ${cy})`}
        filter="url(#arcGlow)"
        initial={{ strokeDasharray: `0 ${circumference}` }}
        animate={{ strokeDasharray: `${filled} ${gap}` }}
        transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
      />

      {/* Inner circle depth */}
      <circle cx={cx} cy={cy} r={radius - strokeWidth / 2 - 2}
        fill="url(#innerGrad)" />
      <circle cx={cx} cy={cy} r={radius - strokeWidth / 2 - 2}
        fill="none" stroke="rgba(97,132,117,0.2)" strokeWidth={1} />

      {/* Center text */}
      <motion.text x={cx} y={cy} textAnchor="middle"
        fill="#2d7d8a" fontSize={32} fontWeight={800}
        fontFamily="inherit" letterSpacing="-1"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 2 }}
      >
        {value}%
      </motion.text>
      <motion.text x={cx} y={cy + 24} textAnchor="middle"
        fill="#147E8F" fontSize={14} fontWeight={600}
        fontFamily="inherit"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 2 }}
      >
        {label}
      </motion.text>
    </svg>
  )
}

// AI returns: 1=Normal (best), 2=Mild, 3=Moderate, 4=High Risk (worst)
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

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { analysisState, analysisTimestamp } = useSocket();
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  // Track the timestamp we last processed so we don't re-run on mount
  const lastProcessedTimestamp = useRef(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [latestRes, historyRes] = await Promise.all([
          axiosInstance.get('/analysis/latest'),
          axiosInstance.get('/analysis/history')
        ]);
        
        if (latestRes.data?.data) setLatestAnalysis(latestRes.data.data);
        
        if (historyRes.data?.data) {
          // Map to chart format
          const formattedHistory = historyRes.data.data.reverse().map((item, index) => ({
            index: index + 1,
            mood: item.result?.mental_level || 2, // 1-4 level
          }));
          setHistoryData(formattedHistory);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Listen to socket updates — only react to genuinely NEW analyses
  useEffect(() => {
    if (!analysisState || !analysisTimestamp) return;
    // Skip if we already processed this exact update
    if (lastProcessedTimestamp.current === analysisTimestamp) return;
    lastProcessedTimestamp.current = analysisTimestamp;

    setLatestAnalysis(analysisState);
    setHistoryData(prev => {
      const newData = [...prev, {
        index: prev.length ? prev[prev.length - 1].index + 1 : 1,
        mood: analysisState.result?.mental_level || 2
      }];
      if (newData.length > 20) return newData.slice(newData.length - 20);
      return newData;
    });
  }, [analysisTimestamp]);

  if (loading) {
    return (
      <section className="min-h-screen bg-[#FEFDFE] dark:bg-slate-900 transition-colors duration-300 py-24 px-5 sm:px-10 lg:px-16 xl:px-24 flex flex-col gap-10">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-10">

          {/* ── Left Column Skeleton ── */}
          <div className="flex flex-col gap-6 w-full lg:w-[48%]">

            {/* Line Chart Card Skeleton */}
            <div className="
              w-full h-64 sm:h-80 lg:h-[400px]
              bg-[#147E8F1A] dark:bg-teal-900/20
              rounded-3xl
              shadow-[0_0_40px_0_rgba(0,0,0,0.08)] dark:shadow-[0_0_40px_0_rgba(0,0,0,0.3)]
              border border-teal-200/30 dark:border-teal-700/30
              flex flex-col items-start justify-start
              px-6 py-5 gap-4 overflow-hidden
            ">
              {/* Chart title */}
              <div className="skeleton-shimmer h-4 w-48 rounded-full" />
              {/* Fake chart bars */}
              <div className="flex-1 w-full flex items-end gap-2 pb-2">
                {[45, 65, 40, 75, 55, 80, 50, 70, 60, 85, 45, 65, 72, 50, 90, 60, 78, 55, 68, 40].map((h, i) => (
                  <div
                    key={i}
                    className="skeleton-shimmer flex-1 rounded-t-md"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              {/* X-axis line */}
              <div className="skeleton-shimmer h-[2px] w-full rounded-full opacity-50" />
            </div>

            {/* AI Recommendations Skeleton */}
            <div className="w-full flex flex-col gap-4">
              <div className="skeleton-shimmer h-7 w-52 rounded-full" />
              <div className="flex flex-col gap-3 pl-2">
                {[85, 70, 90, 60].map((w, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="skeleton-shimmer w-2 h-2 rounded-full shrink-0" />
                    <div className={`skeleton-shimmer h-3.5 rounded-full`} style={{ width: `${w}%` }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Column Skeleton ── */}
          <div className="flex flex-col gap-6 w-full lg:w-[48%]">

            {/* Gauge Card Skeleton */}
            <div className="
              w-full h-64 sm:h-80 lg:h-[400px]
              bg-[#61847520] dark:bg-slate-800/40
              rounded-3xl
              shadow-[0_0_40px_0_rgba(0,0,0,0.08)] dark:shadow-[0_0_40px_0_rgba(0,0,0,0.3)]
              border border-teal-200/20 dark:border-slate-700/50
              flex flex-col items-center justify-center gap-5
            ">
              {/* Label above gauge */}
              <div className="skeleton-shimmer h-4 w-40 rounded-full" />
              {/* Circular gauge */}
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 lg:w-[230px] lg:h-[230px]">
                <svg width="100%" height="100%" viewBox="0 0 230 230" className="opacity-30">
                  <circle cx="115" cy="115" r="80" fill="none" stroke="rgba(20,126,143,0.25)" strokeWidth="30" />
                </svg>
                <svg width="100%" height="100%" viewBox="0 0 230 230" className="absolute inset-0">
                  <circle cx="115" cy="115" r="80"
                    fill="none" strokeWidth="30" strokeLinecap="butt"
                    transform="rotate(-90, 115, 115)"
                    className="skeleton-shimmer"
                    style={{ stroke: 'url(#skeletonGrad)' }}
                  />
                  <defs>
                    <linearGradient id="skeletonGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="rgba(20,126,143,0.15)" />
                      <stop offset="50%" stopColor="rgba(20,126,143,0.35)" />
                      <stop offset="100%" stopColor="rgba(20,126,143,0.15)" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Center placeholder */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="skeleton-shimmer h-8 w-16 rounded-full" />
                  <div className="skeleton-shimmer h-3 w-20 rounded-full" />
                </div>
              </div>
            </div>

            {/* Current Mental State Skeleton */}
            <div className="w-full flex flex-col gap-4">
              <div className="skeleton-shimmer h-7 w-56 rounded-full" />
              <div className="flex flex-col gap-4 pl-2">
                {[
                  { label: 55, value: 38 },
                  { label: 42, value: 62 },
                  { label: 30, value: 45 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="skeleton-shimmer w-2 h-2 rounded-full shrink-0" />
                    <div className="flex gap-2 flex-wrap">
                      <div className="skeleton-shimmer h-3.5 rounded-full" style={{ width: `${item.label * 0.8}px` }} />
                      <div className="skeleton-shimmer h-3.5 rounded-full" style={{ width: `${item.value * 1}px` }} />
                    </div>
                  </div>
                ))}
                {/* Emotion chips row */}
                <div className="flex flex-wrap gap-2 mt-1 pl-4">
                  {[60, 72, 50, 68, 80].map((w, i) => (
                    <div key={i} className="skeleton-shimmer h-6 rounded-md" style={{ width: `${w}px` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    );
  }

  const result = latestAnalysis?.result || {};
  const currentMoodScore = result.risk_score !== undefined 
    ? Math.max(0, Math.min(100, Math.round(100 - result.risk_score)))
    : Math.max(0, Math.min(100, Math.round(100 - ((result.mental_level || 2) - 1) * 25)));

  return (
    <motion.section 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-[#FEFDFE] dark:bg-slate-900 transition-colors duration-300 py-24 px-5 sm:px-10 lg:px-16 xl:px-24 flex flex-col gap-10"
    >
      <div className="flex flex-col lg:flex-row lg:justify-between gap-10">
        {/* ── Left Column ── */}
        <div className="flex flex-col gap-6 w-full lg:w-[48%]">

          {/* Line Chart Card */}
          <motion.div variants={itemVariants} className="
            w-full h-64 sm:h-80 lg:h-[400px]
            bg-[#147E8F3D] dark:bg-teal-900/30
            rounded-3xl
            shadow-[0_0_40px_0_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_0_rgba(0,0,0,0.4)]
            border border-teal-200/30 dark:border-teal-700/30
            flex flex-col items-center justify-center
            px-2 py-4
          ">
            <h3 className="text-[#2d5c5c] dark:text-teal-300 font-semibold mb-2">Recent Mental Levels (Last 20)</h3>
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
                  tickLine={false} axisLine={false} width={70}
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
                  animationDuration={1500}
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
            {result.recommendations && result.recommendations.length > 0 ? (
              <ul className="flex flex-col gap-3 font-medium list-disc pl-5 text-[#5F5F5F] dark:text-slate-400">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx}><span className="text-[#147E8F] dark:text-teal-400">{rec}</span></li>
                ))}
              </ul>
            ) : (
              <p className="text-[#5F5F5F] dark:text-slate-400">No recommendations available at this time. Start by logging a mood or uploading EEG data.</p>
            )}
          </motion.div>
        </div>

        {/* ── Right Column ── */}
        <div className="flex flex-col gap-6 w-full lg:w-[48%]">

          {/* Gauge Card */}
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
              <CircularGauge value={currentMoodScore} label={result.dominant_emotion || "Unknown"} />
            </div>
          </motion.div>

          {/* Overall Mood Text */}
          <motion.div variants={itemVariants} className="w-full flex flex-col gap-4">
            <h2 className="font-bold text-xl sm:text-2xl text-[#111111] dark:text-slate-100">
              Current Mental State
            </h2>
            <ul className="flex flex-col gap-4 font-semibold list-disc pl-5 text-[#5F5F5F] dark:text-slate-400">
              <li>
                Dominant Emotion: <span className="text-[#147E8F] dark:text-teal-400 capitalize">{result.dominant_emotion || "N/A"}</span>
              </li>
              <li>
                Sentiment: <span className="text-[#147E8F] dark:text-teal-400 capitalize">{result.sentiment || "N/A"}</span> 
                <span className="text-sm ml-2 opacity-70">(Score: {result.sentiment_score !== undefined ? result.sentiment_score.toFixed(2) : "N/A"})</span>
              </li>
              {result.emotions && (
                <li className="mt-2">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.entries(result.emotions).map(([emo, val]) => (
                      <span key={emo} className="bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 px-2 py-1 rounded text-xs">
                        {emo}: {(val * 100).toFixed(1)}%
                      </span>
                    ))}
                  </div>
                </li>
              )}
            </ul>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

export default Dashboard