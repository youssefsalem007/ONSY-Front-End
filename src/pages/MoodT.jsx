import { useState, useRef, useCallback, useEffect } from "react";
import arrowl from "../assets/arrowl.png"
import arrowr from "../assets/arrowr.png"
import done from "../assets/done.png"
import hdone from "../assets/hdone.png"
import ndone from "../assets/ndone.png"
import { getAllMoods, logMood, updateMood, deleteMood } from "../services/moodService";

const MOODS = [
  { score: 0,  emoji: "😩", label: "Terrible",    sub: "Extremely distressed",   color: "#E24B4A" },
  { score: 1,  emoji: "😞", label: "Very bad",    sub: "Feeling very down",      color: "#D85A30" },
  { score: 2,  emoji: "😟", label: "Bad",         sub: "Not doing well",         color: "#EF9F27" },
  { score: 3,  emoji: "😕", label: "Poor",        sub: "Struggling a bit",       color: "#BA7517" },
  { score: 4,  emoji: "😐", label: "Low",         sub: "Below average day",      color: "#888780" },
  { score: 5,  emoji: "🙂", label: "Okay",        sub: "Neither good nor bad",   color: "#5DCAA5" },
  { score: 6,  emoji: "😊", label: "Good",        sub: "Feeling decent",         color: "#1D9E75" },
  { score: 7,  emoji: "😄", label: "Pretty good", sub: "Having a good day",      color: "#1D9E75" },
  { score: 8,  emoji: "😁", label: "Great",       sub: "Feeling really well",    color: "#0F6E56" },
  { score: 9,  emoji: "😃", label: "Excellent",   sub: "Almost at my best",      color: "#085041" },
  { score: 10, emoji: "🤩", label: "Amazing",     sub: "Feeling absolutely great",color: "#085041" },
];

export default function MoodTracker({ onClose, onSubmit }) {
  const [value, setValue] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [showMoodForm, setShowMoodForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [moods, setMoods] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const sliderRef = useRef(null);

  const [currentDate, setCurrentDate] = useState(new Date());

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchUserMoods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllMoods();
      const moodMap = {};
      const items = Array.isArray(data)
        ? data
        : (data?.data && Array.isArray(data.data))
          ? data.data
          : [];

      items.forEach(item => {
        const itemDate = item.createdAt || item.date;
        if (itemDate) {
          const dStr = formatDate(itemDate);
          if (!moodMap[dStr]) moodMap[dStr] = [];
          moodMap[dStr].push(item);
        }
      });
      setMoods(moodMap);
    } catch (err) {
      // Backend /mood/all endpoint not yet available — start with empty calendar
      console.warn("Could not load mood history:", err?.response?.status, err?.response?.data?.message);
      setMoods({});          // empty map — calendar still works for new entries
      setError("history");   // soft warning, not a hard block
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserMoods();
  }, [fetchUserMoods]);

  const getWeekDays = (baseDate) => {
    const days = [];
    const date = new Date(baseDate);
    const day = date.getDay(); // 0 (Sun) to 6 (Sat)

    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - day);

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const todayStr = formatDate(new Date());
  const weekDays = getWeekDays(currentDate);

  const handlePrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(currentDate.getDate() - 7);
    setCurrentDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + 7);
    setCurrentDate(next);
  };

  const handleDayClick = (date) => {
    const clickedStr = formatDate(date);
    if (clickedStr > todayStr) return; // Prevent logging future dates

    setSelectedDate(date);
    const dayMoods = moods[clickedStr] || [];
    if (dayMoods.length > 0 && dayMoods[dayMoods.length - 1].mood !== undefined) {
      const existingScore = dayMoods[dayMoods.length - 1].mood;
      setValue(existingScore >= 0 && existingScore <= 10 ? existingScore : 5);
    } else {
      setValue(5);
    }
    setFormError(null);
    setShowMoodForm(true);
    setSubmitted(false);
    setDeleted(false);
  };

  const mood = MOODS.find(m => m.score === value) || MOODS[5];
  const pct = (value / 10) * 100;

  const handleChange = useCallback((e) => {
    setValue(Number(e.target.value));
  }, []);

  const handleAddNewMood = useCallback(async () => {
    if (!selectedDate) return;
    const dateStr = formatDate(selectedDate);
    setFormError(null);
 
    try {
      const newMood = await logMood(value, dateStr);
      setMoods(prev => {
        const existing = prev[dateStr] || [];
        return { ...prev, [dateStr]: [...existing, { ...newMood, mood: value, date: dateStr }] };
      });
      setSubmitted(true);
      setTimeout(() => {
        onSubmit?.({ mood: value, date: dateStr });
        onClose?.();
        setShowMoodForm(false);
      }, 1000);
    } catch (err) {
      console.error("Failed to log mood:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to save mood. Please try again.";
      setFormError(errMsg);
    }
  }, [value, selectedDate, moods, onClose, onSubmit]);

  const handleUpdateMood = useCallback(async () => {
    if (!selectedDate) return;
    const dateStr = formatDate(selectedDate);
    const dayMoods = moods[dateStr] || [];
    const moodToUpdate = dayMoods.slice().reverse().find(m => !m.isUpdated);
    if (!moodToUpdate) return;
    
    setFormError(null);
    try {
      const moodId = moodToUpdate._id || moodToUpdate.id;
      if (moodId) {
        const updated = await updateMood(moodId, value);
        setMoods(prev => {
          const existing = prev[dateStr] || [];
          const newArr = existing.map(m => (m._id === moodId || m.id === moodId) ? { ...m, mood: value, ...updated } : m);
          return { ...prev, [dateStr]: newArr };
        });
        setSubmitted(true);
        setTimeout(() => {
          onSubmit?.({ mood: value, date: dateStr });
          onClose?.();
          setShowMoodForm(false);
        }, 1000);
      }
    } catch (err) {
      console.error("Failed to update mood:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to update mood. Please try again.";
      setFormError(errMsg);
    }
  }, [value, selectedDate, moods, onClose, onSubmit]);

  const handleDelete = useCallback(async () => {
    if (!selectedDate) return;
    const dateStr = formatDate(selectedDate);
    const dayMoods = moods[dateStr] || [];
    const moodToDelete = dayMoods[dayMoods.length - 1];
    if (!moodToDelete) return;
    
    setFormError(null);
    try {
      const moodId = moodToDelete._id || moodToDelete.id;
      if (moodId) {
        await deleteMood(moodId);
      }
      setMoods(prev => {
        const existing = prev[dateStr] || [];
        const newArr = existing.filter(m => m._id !== moodId && m.id !== moodId);
        const newMoods = { ...prev };
        if (newArr.length > 0) {
          newMoods[dateStr] = newArr;
        } else {
          delete newMoods[dateStr];
        }
        return newMoods;
      });
      setDeleted(true);
      setTimeout(() => {
        setShowMoodForm(false);
        setDeleted(false);
      }, 1200);
    } catch (err) {
      console.error("Failed to delete mood:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to delete mood. Please try again.";
      setFormError(errMsg);
    }
  }, [selectedDate, moods]);

  const dayMoodsArr = selectedDate ? (moods[formatDate(selectedDate)] || []) : [];
  const editableMood = dayMoodsArr.slice().reverse().find(m => !m.isUpdated);
  const isEditing = Boolean(editableMood);
  const isFullyDone = dayMoodsArr.length >= 2;

  return (
    <>
      {/* Main */}
      <section className="bg-gradient-to-br from-[#147E8F] via-teal-700 to-cyan-800 dark:from-teal-950 dark:via-slate-900 dark:to-slate-950 h-screen relative overflow-hidden flex flex-col items-center content-center justify-center p-4 md:p-0 transition-colors duration-300">
        {/* Decorative ambient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-cyan-400/15 blur-3xl hidden md:block" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-teal-300/15 blur-3xl hidden md:block" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #99f6e4 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        </div>

        <div className="flex flex-col items-center gap-6 md:gap-10 w-full z-10">
          <h2 className="text-6xl md:text-9xl text-white font-labrada font-semibold drop-shadow-lg">Mood</h2>
          <p className="font-semibold text-xl md:text-[32px] text-center px-2 text-white/90">
            Here you can submit, edit or delete your mood.
          </p>

          <div className="w-[95%] max-w-3xl md:w-[800px] h-auto min-h-62.5 md:h-65 rounded-3xl bg-white/15 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 flex flex-col px-4 md:px-6 py-6 md:py-3 justify-around gap-6 md:gap-0 shadow-xl">
            <div className="flex gap-5 items-center justify-center">
              <img src={arrowl} alt="Prev" onClick={handlePrevWeek} className="w-3.5 h-6 cursor-pointer opacity-80 hover:opacity-100 transition-opacity" />
              <p className="text-white text-3xl md:text-5xl font-semibold">
                {currentDate.toLocaleDateString("en-US", { month: "long" })}
              </p>
              <img src={arrowr} alt="Next" onClick={handleNextWeek} className="w-3.5 h-6 cursor-pointer opacity-80 hover:opacity-100 transition-opacity" />
            </div>

            {/* Weekly Calendar */}
            <div className="w-full md:w-[650px] min-h-20 bg-white/10 dark:bg-slate-800/50 backdrop-blur-sm mx-auto rounded-2xl p-4 flex items-center justify-between shadow-sm border border-white/10">
              {loading ? (
                <p className="text-white w-full text-center py-4">Loading moods...</p>
              ) : error && error !== 'history' ? (
                <p className="text-red-300 w-full text-center py-4">{error}</p>
              ) : (
                <div className="flex w-full justify-between items-start">
                  {weekDays.map((date) => {
                    const dateStr = formatDate(date);
                    const isToday = dateStr === todayStr;
                    const isFuture = dateStr > todayStr;
                    const dayMoods = moods[dateStr] || [];
                    const dayMoodData = dayMoods.length > 0 ? dayMoods[dayMoods.length - 1] : null;
                    const dayMood = dayMoodData ? MOODS.find(m => m.score === dayMoodData.mood) : null;
                    const dayName = date.toLocaleDateString("en-US", { weekday: 'short' });

                    return (
                      <div
                        key={dateStr}
                        onClick={() => !isFuture && handleDayClick(date)}
                        className={`flex flex-col items-center gap-2 ${isFuture ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-110 transition-transform'}`}
                        title={isFuture ? "Cannot log for future dates" : "Log mood"}
                      >
                        <span className={`text-xs md:text-sm font-medium ${isToday ? 'text-white font-bold' : 'text-white/80'}`}>
                          {dayName}
                        </span>
                        <div className="relative">
                          <div
                            className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-inner ${isToday ? 'ring-2 ring-white ring-offset-2 ring-offset-[#147E8F] dark:ring-offset-teal-950' : ''}`}
                            style={{
                              backgroundColor: dayMood ? dayMood.color : 'rgba(255, 255, 255, 0.15)',
                              border: dayMood ? `2px solid ${dayMood.color}` : '2px solid transparent'
                            }}
                          >
                            {dayMood ? (
                              <span className="text-lg md:text-2xl drop-shadow-md">{dayMood.emoji}</span>
                            ) : (
                              <span className="text-white/50 text-xs md:text-base font-semibold">{date.getDate()}</span>
                            )}
                          </div>
                          {!isFuture && (
                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 p-0.5 flex items-center justify-center w-5 h-5 md:w-6 md:h-6 shadow-sm">
                              <img 
                                src={dayMoods.length >= 2 ? done : dayMoods.length === 1 ? hdone : ndone} 
                                alt={dayMoods.length >= 2 ? "Done" : dayMoods.length === 1 ? "Half done" : "Not done"} 
                                className={dayMoods.length >= 2 ? "w-2.5 h-2" : dayMoods.length === 1 ? "w-2.5 h-2" : "w-2.5 h-2.5"} 
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 mt-2 md:mt-0">
              <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                <p className="flex items-center gap-1.5 text-xs md:text-sm text-white/90">
                  <img src={done} alt="" className="w-3 h-2.5" />Done
                </p>
                <p className="flex items-center gap-1.5 text-xs md:text-sm text-white/90">
                  <img src={hdone} alt="" className="w-3 h-2.5" />Half day done
                </p>
                <p className="flex items-center gap-1.5 text-xs md:text-sm text-white/90">
                  <img src={ndone} alt="" className="w-3 h-3" />Not Done Yet
                </p>
              </div>
              <p className="text-sm md:text-base text-white/80">Today's date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {showMoodForm && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={() => setShowMoodForm(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto relative shadow-2xl border border-slate-100 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowMoodForm(false)}
              className="absolute top-4 right-4 md:top-5 md:right-5 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-full p-1.5 cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Header Section */}
            <div className="flex items-center gap-4 mb-8 pr-8">
              <div className={`flex items-center justify-center w-12 h-12 rounded-2xl shadow-sm ${isFullyDone ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50' : 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/50'}`}>
                {isFullyDone ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                )}
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  {isFullyDone ? 'Mood Complete' : dayMoodsArr.length === 1 ? 'Log 2nd Mood' : 'Log 1st Mood'}
                </h2>
                <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedDate ? selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }) : "Today"}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1.5 mb-8">
              {submitted ? (
                <>
                  <div className="w-20 h-20 md:w-22 md:h-22 rounded-full bg-[#E1F5EE] dark:bg-teal-900/40 border-2 border-[#9FE1CB] dark:border-teal-600 flex items-center justify-center text-[36px] text-[#1D9E75] dark:text-teal-400 font-bold mb-1">
                    ✓
                  </div>
                  <p className="text-xl md:text-[22px] font-bold" style={{ color: mood.color }}>Mood logged!</p>
                  <p className="text-[13px] text-slate-400 dark:text-slate-500">Have a great day</p>
                </>
              ) : deleted ? (
                <>
                  <div className="w-20 h-20 md:w-22 md:h-22 rounded-full bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700 flex items-center justify-center mb-1">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#E24B4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </div>
                  <p className="text-xl md:text-[22px] font-bold text-red-500 dark:text-red-400">Mood Removed</p>
                  <p className="text-[13px] text-slate-400 dark:text-slate-500">Entry deleted successfully</p>
                </>
              ) : (
                <>
                  <div
                    className="w-20 h-20 md:w-22 md:h-22 rounded-full flex items-center justify-center mb-1 transition-all duration-300"
                    style={{ background: mood.color + "18", border: `2px solid ${mood.color}33` }}
                  >
                    <span className="text-4xl md:text-[48px] leading-none select-none">{mood.emoji}</span>
                  </div>
                  <p className="text-xl md:text-[22px] font-bold transition-colors duration-200" style={{ color: mood.color }}>
                    {mood.label}
                  </p>
                  <p className="text-xs md:text-[13px] transition-colors duration-200" style={{ color: mood.color + "99" }}>
                    {mood.sub}
                  </p>
                </>
              )}
            </div>

            {/* Slider Section */}
            <div className="mb-7">
              <div className="flex justify-between mb-2 px-0.5">
                {MOODS.map((m) => (
                  <span
                    key={m.score}
                    className="w-4 md:w-5 text-center inline-block leading-none select-none transition-all duration-200"
                    style={{
                      color: m.score === value ? mood.color : "#ccc",
                      fontWeight: m.score === value ? 700 : 400,
                      fontSize: m.score === value ? "14px" : "11px",
                      transform: m.score === value ? "scale(1.2)" : "scale(1)",
                    }}
                  >
                    {m.score}
                  </span>
                ))}
              </div>

              <div className="relative h-12 flex items-center">
                <div className="absolute inset-x-0 h-2.5 rounded-full bg-slate-100 dark:bg-slate-700" />
                <div
                  className="absolute left-0 h-2.5 rounded-full transition-[width] duration-75"
                  style={{ width: `${pct}%`, background: "linear-gradient(90deg, #E24B4A 0%, #EF9F27 50%, #085041 100%)" }}
                />
                <input
                  ref={sliderRef}
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={value}
                  onChange={handleChange}
                  className="absolute inset-0 w-full opacity-0 h-12 cursor-pointer z-20"
                  aria-label="Mood score"
                />
                <div
                  className="absolute w-6 h-6 md:w-7 md:h-7 rounded-full bg-white dark:bg-slate-200 border-[3px] shadow-md flex items-center justify-center z-10 transition-[left] duration-75 pointer-events-none"
                  style={{ left: `calc(${pct}% - ${pct === 0 ? 0 : pct === 100 ? 28 : 14}px)`, borderColor: mood.color }}
                >
                  <span className="text-[9px] md:text-[10px] font-bold" style={{ color: mood.color }}>
                    {value}
                  </span>
                </div>
              </div>

              <div className="flex justify-between mt-2 px-0.5">
                <span className="text-[10px] md:text-[11px] text-slate-400 dark:text-slate-500 select-none text-left">😞 Worst</span>
                <span className="text-[10px] md:text-[11px] text-slate-400 dark:text-slate-500 select-none text-center">😐 Neutral</span>
                <span className="text-[10px] md:text-[11px] text-slate-400 dark:text-slate-500 select-none text-right">🤩 Best</span>
              </div>
            </div>

            {formError && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl p-3 mb-4 text-center text-sm font-semibold">
                {formError}
              </div>
            )}

            <div className="flex gap-3 mt-2">
              {dayMoodsArr.length > 0 && !submitted && !deleted && (
                <button
                  onClick={handleDelete}
                  className="flex-[0.8] py-3.5 md:py-4 rounded-2xl text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 text-sm md:text-base font-semibold transition-all hover:bg-red-100 dark:hover:bg-red-900/50 hover:border-red-200 dark:hover:border-red-800/50 active:scale-[0.98] flex flex-col items-center justify-center gap-1 leading-none"
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  <span className="text-[10px] md:text-xs">Delete Last</span>
                </button>
              )}
              {isEditing && !submitted && !deleted && (
                <button
                  onClick={handleUpdateMood}
                  className="flex-[1.2] py-3.5 md:py-4 rounded-2xl text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/30 text-sm md:text-base font-semibold transition-all hover:bg-amber-100 dark:hover:bg-amber-900/50 active:scale-[0.98] flex flex-col items-center justify-center gap-1 leading-none"
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  <span className="text-[10px] md:text-xs">Update Last</span>
                </button>
              )}
              <button
                onClick={handleAddNewMood}
                disabled={submitted || isFullyDone}
                className="flex-[2] py-3.5 md:py-4 rounded-2xl text-white text-sm md:text-base font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                style={{ background: submitted || isFullyDone ? "#1D9E75" : mood.color, cursor: submitted || isFullyDone ? "default" : "pointer", boxShadow: submitted || isFullyDone ? "none" : `0 10px 25px -5px ${mood.color}60` }}
              >
                {!submitted && !isFullyDone && (
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                )}
                {isFullyDone ? "Done for Today!" : submitted ? "Saved!" : dayMoodsArr.length === 1 ? "Add 2nd Mood" : "Add 1st Mood"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}