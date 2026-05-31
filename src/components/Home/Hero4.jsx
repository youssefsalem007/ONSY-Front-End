import React from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } },
}

const barVariants = {
  hidden: { scaleY: 0, opacity: 0 },
  visible: { scaleY: 1, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
}

const data = [
  { name: 'Jan', value: 400 }, { name: '', value: 480 }, { name: '', value: 250 },
  { name: 'Feb', value: 320 }, { name: '', value: 450 }, { name: 'Mar', value: 430 },
  { name: '', value: 500 }, { name: '', value: 650 }, { name: 'Apr', value: 630 },
  { name: '', value: 720 }, { name: '', value: 580 }, { name: 'May', value: 620 },
  { name: '', value: 650 }, { name: '', value: 500 }, { name: 'Jun', value: 550 },
  { name: '', value: 600 },
];

const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  if (payload.name === '') return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="#062d2a" />
      <circle cx={cx} cy={cy} r={2} fill="#000" />
    </g>
  );
};

const data01 = [
  { name: 'LightBlue', value: 100, fill: '#a5d8ff' },
  { name: 'Green', value: 150, fill: '#69db7c' },
  { name: 'Blue', value: 400, fill: '#82b1ff' },
  { name: 'Dark', value: 700, fill: '#1a1a1a' },
];

const data02 = [
  { name: 'Greenish', value: 500, fill: '#76938a' },
  { name: 'white', value: 150, fill: '#A0BCE8' },
  { name: 'Green', value: 200, fill: '#69db7c' },
  { name: 'LightBlue', value: 100, fill: '#a5d8ff' },
];

const bars = [
  { day: 'Sun', h: 'h-8',  color: 'bg-[#A0BCE8]' },
  { day: 'Mon', h: 'h-14', color: 'bg-[#6BE6D3]' },
  { day: 'Tue', h: 'h-10', color: 'bg-slate-800 dark:bg-slate-400' },
  { day: 'Wed', h: 'h-16', color: 'bg-[#7DBBFF]' },
  { day: 'Thu', h: 'h-6',  color: 'bg-[#B899EB]' },
  { day: 'Fri', h: 'h-12', color: 'bg-[#71DD8C]' },
];

const Hero4 = () => {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-teal-50/40 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-20 lg:py-28 px-6 lg:px-10 transition-colors duration-300">

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-b from-teal-100/30 dark:from-teal-900/15 to-transparent blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-gradient-to-tl from-cyan-100/25 dark:from-cyan-900/10 to-transparent blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-teal-100/20 dark:from-teal-900/10 to-transparent blur-3xl rounded-full" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center"
      >
        <motion.div variants={itemVariants} className="text-center mb-14 lg:mb-18 max-w-2xl px-4 will-change-transform">
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-200/60 dark:border-teal-700/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500 dark:bg-teal-400 animate-pulse" />
            Emotional Analytics
          </span>
          <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-3xl lg:text-5xl pb-3 leading-tight tracking-tight">
            Understand Your Mind{' '}
            <br className="hidden lg:block" />
            With{' '}
            <span className="bg-gradient-to-r from-teal-600 to-cyan-500 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Clarity
            </span>
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm lg:text-base leading-relaxed">
            Your emotional data, beautifully visualized — weekly trends, mood cycles,
            stress peaks, and AI-generated insights all in one place
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-stretch gap-6 w-full">

          {/* Left column */}
          <div className="flex flex-col gap-5 w-full lg:w-[46%]">

            {/* Bar chart card */}
            <motion.div variants={itemVariants} className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-lg shadow-slate-100/80 dark:shadow-slate-900/50 p-6 will-change-transform">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Weekly Activity</p>
                  <h4 className="text-slate-800 dark:text-slate-200 font-bold text-base">Mood by Day</h4>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 rounded-full px-3 py-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  +12% this week
                </span>
              </div>
              <div className="flex justify-around items-end h-20 px-2">
                {bars.map((item, index) => (
                  <div key={index} className="flex flex-col gap-2 items-center justify-end group">
                    <motion.span
                      variants={barVariants}
                      style={{ transformOrigin: "bottom" }}
                      className={`will-change-transform w-6 lg:w-8 rounded-xl ${item.h} ${item.color} opacity-85 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200 cursor-default`}
                    />
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] font-medium">{item.day}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Donut charts card */}
            <motion.div variants={itemVariants} className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-lg shadow-slate-100/80 dark:shadow-slate-900/50 p-6 will-change-transform">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Emotion Breakdown</p>
                  <h4 className="text-slate-800 dark:text-slate-200 font-bold text-base">Mood Composition</h4>
                </div>
              </div>
              <div className="flex justify-around items-center gap-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-36 lg:w-44 aspect-square will-change-transform">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data01} cx="50%" cy="50%" innerRadius="60%" outerRadius="100%" paddingAngle={2} cornerRadius={2} dataKey="value" stroke="none" isAnimationActive={true}>
                          {data01.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">This Week</p>
                </div>
                <div className="w-px h-28 bg-slate-100 dark:bg-slate-700 rounded-full hidden sm:block" />
                <div className="flex flex-col items-center gap-3">
                  <div className="w-36 lg:w-44 aspect-square will-change-transform">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data02} cx="50%" cy="50%" innerRadius="60%" outerRadius="100%" paddingAngle={2} cornerRadius={2} dataKey="value" stroke="none" isAnimationActive={true}>
                          {data02.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Last Week</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right column — Area chart */}
          <motion.div variants={itemVariants} className="will-change-transform w-full lg:flex-1 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-lg shadow-slate-100/80 dark:shadow-slate-900/50 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">6-Month Overview</p>
                <h4 className="text-slate-800 dark:text-slate-200 font-bold text-base">Wellness Trend</h4>
              </div>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600 dark:bg-teal-400" />
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">User</span>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/40 rounded-full px-3 py-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Improving
                </span>
              </div>
            </div>
            <div className="w-full h-[240px] lg:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 20, left: -40, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5a7d75" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#5a7d75" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={true} horizontal={false} stroke="#f5f5f5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#1a1a1a', fontSize: 11, fontWeight: 500 }} interval={0} padding={{ left: 10, right: 10 }} />
                  <YAxis hide={true} domain={[0, 800]} />
                  <Tooltip content={() => null} cursor={{ stroke: '#f0f0f0' }} />
                  <Area type="linear" dataKey="value" stroke="#4a6b64" strokeWidth={1.5} fillOpacity={1} fill="url(#colorValue)" dot={<CustomDot />} activeDot={{ r: 8, fill: '#062d2a' }} isAnimationActive={true} animationDuration={2000} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-slate-50 dark:border-slate-700">
              {[
                { label: 'Avg. Mood', value: '7.4 / 10', color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-800/40' },
                { label: 'Stress Peak', value: 'Mar 12', color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-800/40' },
                { label: 'Streak',      value: '14 days',  color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/40' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`flex flex-col rounded-2xl border px-4 py-2.5 ${color}`}>
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{label}</span>
                  <span className="text-sm font-bold mt-0.5">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </motion.div>
    </section>
  )
}

export default Hero4