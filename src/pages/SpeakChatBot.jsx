import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import victor1 from '../assets/Vector1.png'
import victor2 from '../assets/Vector2.png'
import victor3 from '../assets/Vector3.png'
import victor4 from '../assets/Vector4.png'
import victor5 from '../assets/Vector5.png'
import arrow from '../assets/mdi_arrow.png'
import { useNavigate } from 'react-router-dom';
import { aiService } from '../services/aiService';

const SUGGESTIONS = [
  "How am I feeling today?",
  "Give me a breathing exercise",
  "Help me journal my thoughts",
  "Why do I feel anxious?",
  "Motivate me",
  "Sleep tips for tonight",
];



const customStyles = `
@keyframes blink {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
`;

function TypingDots() {
  return (
    <div className="flex items-end gap-2.5 w-full justify-start" style={{ animation: "fadeUp 0.3s ease both" }}>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[22px_22px_22px_4px] px-5 py-3 shadow-sm flex gap-1.5 items-center h-[46px]">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400 inline-block" style={{ animation: "blink 1.4s infinite ease-in-out", animationDelay: "0s" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400 inline-block" style={{ animation: "blink 1.4s infinite ease-in-out", animationDelay: "0.2s" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400 inline-block" style={{ animation: "blink 1.4s infinite ease-in-out", animationDelay: "0.4s" }} />
      </div>
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  const time = new Date(msg.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex flex-col gap-1.5 w-full ${isUser ? "items-end" : "items-start"}`} style={{ animation: "fadeUp 0.3s ease-out both" }}>
      <div className={`max-w-[85%] sm:max-w-[75%] px-5 py-3.5 ${isUser
        ? "bg-teal-50 dark:bg-teal-900/40 border border-teal-200/60 dark:border-teal-800 rounded-[22px_22px_4px_22px] shadow-sm text-teal-950 dark:text-teal-50"
        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-[22px_22px_22px_4px] shadow-sm text-slate-800 dark:text-slate-200"
        }`}>
        <p className={`m-0 text-[15px] leading-relaxed whitespace-pre-wrap break-words`}>
          {msg.content}
        </p>
      </div>
      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium px-2">{time}</span>
    </div>
  );
}

const sidebarVariants = {
  hidden: { x: -50, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
}

const mainContentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, delay: 0.3, ease: "easeOut" }
  },
}

const SpeakChatBot = () => {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    aiService.getAllSessions().then(data => {
      if (Array.isArray(data)) setChatHistory(data);
    }).catch(console.error);
  }, []);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Responsive sidebar toggle
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 50);
  }, [messages, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const sendMessage = useCallback(async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    setInput("");

    const userMsg = {
      _id: `msg-${Date.now()}`,
      role: "user",
      content,
      sent_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await aiService.sendMessage(content, sessionId);
      const aiMsg = {
        _id: `msg-${Date.now() + 1}`,
        role: "ai",
        content: response.reply,
        sent_at: new Date().toISOString(),
      };

      if (response.sessionId && response.sessionId !== sessionId) {
        setSessionId(response.sessionId);
        aiService.getAllSessions().then(data => {
          if (Array.isArray(data)) setChatHistory(data);
        }).catch(console.error);
      }

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      let errorMessage = err.response?.data?.message || err.message || "Something went wrong";
      if (err.response?.status === 500 && errorMessage.includes('status code 401')) {
        errorMessage = "My AI engine is currently disconnected. (The GROQ_API_KEY in the Vercel backend environment appears to be invalid or expired).";
      }

      const errorMsg = {
        _id: `msg-${Date.now() + 1}`,
        role: "ai",
        content: `Sorry, I encountered an error: ${errorMessage}`,
        sent_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, sessionId]);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <>
      <style>{customStyles}</style>
      <section className="flex h-screen overflow-hidden bg-gradient-to-br from-teal-50/60 via-white to-cyan-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300">

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/20 dark:bg-slate-900/60 z-20 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <motion.nav
          variants={sidebarVariants}
          initial="hidden"
          animate="visible"
          className={`absolute lg:relative z-30 h-screen flex flex-col gap-5 items-center pt-5 border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 transition-transform duration-300 w-72 sm:w-80 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          {/* Mobile close button inside sidebar */}
          <button
            className="lg:hidden absolute top-5 right-4 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="will-change-transform text-[#147E8F] dark:text-teal-400 pb-5 font-labrada text-[28px] lg:text-[40px] font-semibold cursor-pointer z-50 transition-colors"
            onClick={() => { navigate("/"); }}
          >
            ONSY
          </motion.div>

          <div className="flex flex-col gap-3 w-full px-4 overflow-y-auto hide-scrollbar">
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.03, x: 4 }}
              whileTap={{ scale: 0.97 }}
              className="will-change-transform pl-4 text-slate-700 dark:text-slate-200 flex content-center items-center gap-3 h-11 w-full border border-[#036464] dark:border-teal-700 rounded-2xl cursor-pointer bg-transparent hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all duration-200"
              onClick={() => {
                setMessages([]);
                setSessionId(null);
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            >
              <img src={victor1} alt="" />
              New chat
            </motion.button>

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.03, x: 4 }}
              whileTap={{ scale: 0.97 }}
              className="will-change-transform pl-4 text-slate-700 dark:text-slate-200 flex content-center items-center gap-3 h-11 w-full border border-[#036464] dark:border-teal-700 rounded-2xl cursor-pointer bg-transparent hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all duration-200"
              onClick={() => navigate('/Dashboard')}
            >
              <img src={victor2} alt="" />
              Dashboard
            </motion.button>

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.03, x: 4 }}
              whileTap={{ scale: 0.97 }}
              className="will-change-transform pl-4 text-slate-700 dark:text-slate-200 flex content-center items-center gap-3 h-11 w-full border border-[#036464] dark:border-teal-700 rounded-2xl cursor-pointer bg-transparent hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all duration-200"
              onClick={() => navigate('/Mood')}
            >
              <img src={victor2} alt="" />
              Mood
            </motion.button>

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.03, x: 4 }}
              whileTap={{ scale: 0.97 }}
              className="will-change-transform pl-4 text-slate-700 dark:text-slate-200 flex content-center items-center gap-3 h-11 w-full border border-[#036464] dark:border-teal-700 rounded-2xl cursor-pointer bg-transparent hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all duration-200"
              onClick={() => navigate('/EMotiv')}
            >
              <img src={victor3} alt="" />
              E-Motiv
            </motion.button>

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.03, x: 4 }}
              whileTap={{ scale: 0.97 }}
              className="will-change-transform pl-4 text-slate-700 dark:text-slate-200 flex content-center items-center gap-3 h-11 w-full border border-[#036464] dark:border-teal-700 rounded-2xl cursor-pointer bg-transparent hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all duration-200"
              onClick={() => navigate('/Profile')}
            >
              <img src={victor4} alt="" />
              Profile
            </motion.button>

            <motion.div variants={itemVariants} className="flex flex-col gap-4 w-full mt-4">
              <p className="flex justify-between text-lg font-semibold text-slate-800 dark:text-slate-200 pb-1">Chat history <img src={arrow} alt="" /></p>
              {chatHistory.slice(0, 5).map(session => (
                <motion.p
                  key={session.id}
                  whileHover={{ x: 5 }}
                  className="flex gap-1.5 cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-sm transition-colors whitespace-nowrap overflow-hidden text-ellipsis"
                  onClick={async () => {
                    try {
                      const s = await aiService.getSession(session.id);
                      setSessionId(session.id);
                      setMessages(s.messages.map((m, i) => ({
                        _id: `msg-${session.id}-${i}`,
                        role: m.role === 'assistant' ? 'ai' : 'user',
                        content: m.content,
                        sent_at: s.updatedAt
                      })));
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    } catch (e) {
                      console.error(e);
                    }
                  }}>
                  <img src={arrow} alt="" className="shrink-0" />
                  <span className="truncate">{session.preview || "New Session"}</span>
                </motion.p>
              ))}
            </motion.div>
          </div>
        </motion.nav>

        <motion.div
          variants={mainContentVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 flex flex-col min-w-0 bg-transparent transition-colors duration-300 relative"
        >
          {/* Mobile Sidebar Toggle - Floating */}
          <header className="lg:hidden flex items-center px-4 pt-4 shrink-0 z-20 absolute top-0 left-0 w-full pointer-events-none">
            <button
              className="pointer-events-auto text-slate-600 dark:text-slate-300 p-2.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
              onClick={() => setSidebarOpen(v => !v)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </header>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 pt-20 lg:pt-8 pb-6 flex flex-col gap-5 scroll-smooth">
            {isEmpty && (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8 max-w-2xl mx-auto w-full" style={{ animation: "fadeUp 0.4s ease-out both" }}>
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800 flex items-center justify-center mb-6 shadow-sm">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" className="dark:stroke-teal-400">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <path d="M12 2v6" /><path d="M12 16v6" />
                  </svg>
                </div>
                <h2 className="m-0 text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3 tracking-tight">How can I help you today?</h2>
                <p className="m-0 text-[15px] text-slate-500 dark:text-slate-400 mb-8 max-w-md">
                  I'm your AI companion. Feel free to talk about your day, ask for advice, or explore mental wellbeing exercises.
                </p>
                <div className="grid gap-3 w-full sm:grid-cols-2">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      className="px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[14px] font-medium text-left transition-all duration-200 hover:border-teal-400 hover:bg-teal-50/50 dark:hover:bg-slate-700 dark:hover:border-teal-500 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0"
                      onClick={() => sendMessage(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isEmpty && messages.map((msg) => (
              <MessageBubble key={msg._id} msg={msg} />
            ))}

            {loading && <TypingDots />}

            <div ref={bottomRef} className="h-1 shrink-0" />
          </div>

          {/* Input Area */}
          <footer className="px-4 sm:px-6 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shrink-0 z-10">
            <div className="max-w-4xl mx-auto relative">
              <div className={`flex items-end gap-2 bg-slate-100 dark:bg-slate-800 rounded-[24px] border border-transparent focus-within:border-teal-400 dark:focus-within:border-teal-500 px-4 py-2 sm:py-2.5 transition-all duration-200 shadow-sm ${loading ? 'opacity-70 pointer-events-none' : ''}`}>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent resize-none outline-none border-none text-[15px] leading-relaxed text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 max-h-[120px] overflow-y-auto py-2 px-1 hide-scrollbar"
                  rows={1}
                  disabled={loading}
                />
                <button
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${input.trim() && !loading ? 'bg-teal-600 text-white shadow-md hover:bg-teal-700 hover:scale-105 active:scale-95' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-default'}`}
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={input.trim() ? "translate-x-[2px] -translate-y-[2px]" : ""}>
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
              <div className="text-center mt-2">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  AI companion can make mistakes. Consider verifying important information.
                </span>
              </div>
            </div>
          </footer>
        </motion.div>
      </section>
    </>
  )
}

export default SpeakChatBot