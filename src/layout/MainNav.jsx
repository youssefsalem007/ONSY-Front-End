import React, { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { getToken } from '../utils/cookieUtils';
import ThemeToggle from '../components/ThemeToggle';

const MainNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isSpeakPage = location.pathname === '/Speak';
  const isMoodPage = location.pathname === '/Mood';
  const isTransparentPage = isHomePage || isMoodPage;

  const isAuthenticated = !!getToken();

  const getUserRole = () => {
    const token = getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload.role;
    } catch {
      return null;
    }
  };

  const isAdmin = getUserRole() === 'admin';

  const handleAuthAction = () => {
    if (isAuthenticated) {
      navigate("/SignOut");
    } else {
      navigate("/SignIn");
    }
  };

  /* ── shared nav-pill base ── */
  const navLinkBase =
    "relative px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all duration-300 ease-in-out focus:outline-none";

  const getNavClass = ({ isActive }) =>
    isMoodPage
      ? isActive
        ? `${navLinkBase} bg-white/20 text-white ring-1 ring-white/40`
        : `${navLinkBase} text-white/80 hover:text-white hover:bg-white/10`
      : isActive
        ? `${navLinkBase} bg-teal-500/10 dark:bg-teal-400/15 text-teal-700 dark:text-teal-300 ring-1 ring-teal-400/50 dark:ring-teal-400/30`
        : `${navLinkBase} text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/30`;

  const getMobileNavClass = ({ isActive }) =>
    isActive
      ? "w-full text-center py-3 px-6 rounded-2xl bg-teal-500/10 dark:bg-teal-400/15 text-teal-700 dark:text-teal-300 ring-1 ring-teal-400/40 dark:ring-teal-400/30 font-semibold text-sm transition-all duration-200"
      : "w-full text-center py-3 px-6 rounded-2xl text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-teal-700 dark:hover:text-teal-300 transition-all duration-200";

  return (
    <section
      className={`w-full fixed top-0 z-50 px-5 lg:px-10 transition-all duration-300
        ${isSpeakPage ? 'hidden h-0' : ''}
        ${!isTransparentPage ? 'bg-white/80 dark:bg-slate-900/95 backdrop-blur-sm' : ''}
      `}
    >
      {/* ── Glass pill navbar ── */}
      <div
        className={`mx-auto mt-4 max-w-6xl flex items-center justify-between gap-4 rounded-2xl px-5 h-16
          border backdrop-blur-xl shadow-lg shadow-black/5
          ${isMoodPage
            ? 'bg-white/10 dark:bg-black/20 border-white/20'
            : 'bg-white/80 dark:bg-slate-900/85 border-white/60 dark:border-slate-700/60'
          }`}
      >

        {/* 1. Logo */}
        <div
          onClick={() => { navigate("/"); setIsOpen(false); }}
          className={`font-labrada text-2xl lg:text-3xl font-semibold cursor-pointer select-none
            transition-all duration-300 hover:scale-105 tracking-tight z-50
            ${isMoodPage ? 'text-white' : 'text-teal-700 dark:text-teal-400'}`}
        >
          ONSY
        </div>

        {/* 2. Desktop Nav Links — centered */}
        <nav className="hidden lg:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
          <NavLink to="/" className={getNavClass}>Home</NavLink>
          <NavLink to="/Speak" className={getNavClass}>
            Speak with&nbsp;<span className="text-teal-600 dark:text-teal-400 font-semibold">ONSY</span>
          </NavLink>
          {isAuthenticated && <NavLink to="/Dashboard" className={getNavClass}>Dashboard</NavLink>}
          <NavLink to="/EMotiv" className={getNavClass}>E&#8209;Motiv</NavLink>
          <NavLink to="/Mood" className={getNavClass}>Mood</NavLink>
          {isAuthenticated && <NavLink to="/Profile" className={getNavClass}>Profile</NavLink>}
          {isAdmin && <NavLink to="/admin" className={getNavClass}>Admin</NavLink>}
        </nav>

        {/* 3. Right side: Theme toggle + Auth button + hamburger */}
        <div className="flex items-center gap-2 z-50 ml-auto">

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Auth button */}
          <button
            onClick={handleAuthAction}
            className={`group relative inline-flex items-center justify-center overflow-hidden
              h-9 px-5 rounded-xl text-sm font-semibold
              transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0
              ${isHomePage && !isMoodPage
                ? 'border border-teal-300 dark:border-teal-600 bg-transparent text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:shadow-teal-200/60 dark:hover:shadow-teal-900/60'
                : 'bg-gradient-to-r from-[#036464] to-teal-500 dark:from-teal-700 dark:to-teal-500 text-white shadow-sm shadow-teal-500/25 hover:shadow-teal-500/40'
              }`}
          >
            {/* Shine sweep */}
            {!isHomePage && !isMoodPage && (
              <span className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/20 transition-transform duration-500 group-hover:translate-x-[150%]" />
            )}
            <span className="relative">{isAuthenticated ? "Log out" : "Log in"}</span>
          </button>

          {/* 4. Hamburger — mobile only */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            className={`lg:hidden flex flex-col justify-center items-center w-9 h-9 rounded-xl transition-all duration-200 focus:outline-none gap-[5px]
              ${isMoodPage ? 'hover:bg-white/20' : 'hover:bg-teal-50 dark:hover:bg-slate-700/60'}`}
          >
            <span
              className={`h-[2px] w-5 rounded-full transition-all duration-300 origin-center
                ${isMoodPage ? 'bg-white' : 'bg-teal-700 dark:bg-teal-400'}
                ${isOpen ? 'rotate-45 translate-y-[7px]' : ''}`}
            />
            <span
              className={`h-[2px] w-5 rounded-full transition-all duration-300
                ${isMoodPage ? 'bg-white' : 'bg-teal-700 dark:bg-teal-400'}
                ${isOpen ? 'opacity-0 scale-x-0' : ''}`}
            />
            <span
              className={`h-[2px] w-5 rounded-full transition-all duration-300 origin-center
                ${isMoodPage ? 'bg-white' : 'bg-teal-700 dark:bg-teal-400'}
                ${isOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* 5. Mobile dropdown */}
      <div
        className={`lg:hidden mx-auto mt-2 max-w-6xl overflow-hidden rounded-2xl border backdrop-blur-xl shadow-xl shadow-black/8
          bg-white/95 dark:bg-slate-900/95 border-white/70 dark:border-slate-700/70
          transition-all duration-500 ease-in-out
          ${isOpen ? 'max-h-[480px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none border-transparent shadow-none'}`}
      >
        <div className="flex flex-col items-stretch gap-1.5 p-4">

          {/* Divider label */}
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-2 mb-1">
            Navigation
          </p>

          <NavLink to="/" onClick={() => setIsOpen(false)} className={getMobileNavClass}>Home</NavLink>
          <NavLink to="/Speak" onClick={() => setIsOpen(false)} className={getMobileNavClass}>Speak with ONSY</NavLink>
          {isAuthenticated && <NavLink to="/Dashboard" onClick={() => setIsOpen(false)} className={getMobileNavClass}>Dashboard</NavLink>}
          <NavLink to="/EMotiv" onClick={() => setIsOpen(false)} className={getMobileNavClass}>E-Motiv</NavLink>
          <NavLink to="/Mood" onClick={() => setIsOpen(false)} className={getMobileNavClass}>Mood</NavLink>
          {isAuthenticated && <NavLink to="/Profile" onClick={() => setIsOpen(false)} className={getMobileNavClass}>Profile</NavLink>}
          {isAdmin && <NavLink to="/admin" onClick={() => setIsOpen(false)} className={getMobileNavClass}>Admin</NavLink>}

          {/* Divider */}
          <div className="my-1 h-px bg-slate-100 dark:bg-slate-700 rounded-full" />

          {/* Auth in mobile menu */}
          <button
            onClick={() => { handleAuthAction(); setIsOpen(false); }}
            className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-[#036464] to-teal-500 dark:from-teal-700 dark:to-teal-500 text-white font-semibold text-sm transition-all duration-300 hover:shadow-md hover:shadow-teal-400/30 active:scale-[0.98]"
          >
            {isAuthenticated ? "Log out" : "Log in"}
          </button>
        </div>
      </div>

    </section>
  )
}

export default MainNav