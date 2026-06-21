import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, changePassword, deleteAccount } from '../services/profileService';
import { getAllMoods } from '../services/moodService';
import { removeToken } from '../utils/cookieUtils';
import { motion } from 'framer-motion';
import { 
  User, Lock, Trash2, Edit3, Check, Eye, EyeOff, Camera, 
  Activity, Brain, Calendar, ShieldCheck
} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';

/* ─── Toast ─────────────────────────────────────────────────────── */
const Toast = ({ message, type, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  const colors = {
    success: 'bg-teal-500 text-white',
    error:   'bg-red-500 text-white',
    info:    'bg-slate-700 text-white',
  };
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-2xl shadow-xl text-sm font-semibold animate-fade-in-up ${colors[type] || colors.info}`}>
      {message}
    </div>
  );
};

/* ─── Skeleton loader ───────────────────────────────────────────── */
const Skeleton = ({ className }) => (
  <div className={`animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700 ${className}`} />
);

/* ─── Section card wrapper ───────────────────────────────────────── */
const SectionCard = ({ icon, title, children, accent = 'teal', delay = 0 }) => {
  const ring = accent === 'red' ? 'ring-red-200 dark:ring-red-900/40' : 'ring-teal-200/60 dark:ring-teal-700/30';
  const iconBg = accent === 'red' ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl ring-1 ${ring} shadow-lg shadow-black/[0.04] dark:shadow-black/20 p-6 md:p-8 transition-colors duration-300`}
    >
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700/50 pb-4">
        <span className={`p-2.5 rounded-xl ${iconBg}`}>
          {icon}
        </span>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
};

/* ─── Input field ───────────────────────────────────────────────── */
const Field = ({ label, id, type = 'text', value, onChange, disabled, placeholder, extra }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full rounded-xl px-4 py-3 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600/60 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/60 dark:focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      />
      {extra}
    </div>
  </div>
);

/* ─── Password field with show/hide ─────────────────────────────── */
const PwField = ({ label, id, value, onChange }) => {
  const [show, setShow] = useState(false);
  return (
    <Field
      label={label}
      id={id}
      type={show ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      extra={
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
        >
          {show ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      }
    />
  );
};

/* ═══════════════════════════════════════════════════════════════ */
/*                      MAIN PAGE COMPONENT                       */
/* ═══════════════════════════════════════════════════════════════ */
export default function Profile() {
  const navigate = useNavigate();

  /* profile data */
  const [profile, setProfile]   = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileErr, setProfileErr]         = useState('');

  /* edit-info state */
  const [editMode, setEditMode] = useState(false);
  const [form, setForm]         = useState({ firstName: '', lastName: '', gender: '', age: '' });
  const [savingInfo, setSavingInfo] = useState(false);

  /* avatar state */
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  /* change-password state */
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [savingPw, setSavingPw] = useState(false);

  /* delete-account */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAcc, setDeletingAcc]         = useState(false);

  /* stats */
  const [moodLogsCount, setMoodLogsCount] = useState(0);
  const [currentMentalState, setCurrentMentalState] = useState('N/A');
  const [hasPaymentToken] = useState(() => {
    try {
      const tokenString = localStorage.getItem('payment_token');
      if (!tokenString) return false;
      const tokenData = JSON.parse(tokenString);
      return tokenData && tokenData.expiry && Date.now() < tokenData.expiry;
    } catch (err) {
      return false;
    }
  });

  /* toast */
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'info') => setToast({ message, type });

  /* ── fetch profile ── */
  const fetchProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const data = await getProfile();
      const p = data?.data || data;
      setProfile(p);
      const userEmail = p?.email || '';
      const localAvatar = localStorage.getItem(`profileAvatar_${userEmail}`) || localStorage.getItem('profileAvatar');
      setAvatarPreview(localAvatar || p?.profilePic || p?.avatar || p?.profileImage || null);
      setForm({
        firstName: p?.firstName || '',
        lastName:  p?.lastName  || '',
        gender:    p?.gender    || '',
        age:       p?.age != null ? String(p.age) : '',
      });
    } catch (err) {
      console.error(err);
      setProfileErr('Failed to load profile. Please try again.');
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const moods = await getAllMoods();
        if (Array.isArray(moods)) {
          setMoodLogsCount(moods.length);
        }
      } catch (err) {
        console.error('Failed to fetch moods for stats', err);
      }

      try {
        const latestRes = await axiosInstance.get('/analysis/latest');
        const data = latestRes?.data?.data;
        if (data && data.result) {
          const emotion = data.result.dominant_emotion;
          const level = data.result.mental_level;
          const moodLabels = { 1: 'Normal', 2: 'Mild', 3: 'Moderate', 4: 'High Risk' };
          
          if (emotion) {
            setCurrentMentalState(emotion.charAt(0).toUpperCase() + emotion.slice(1));
          } else if (level) {
            setCurrentMentalState(moodLabels[level] || 'N/A');
          }
        }
      } catch (err) {
        console.error('Failed to fetch latest analysis for stats', err);
      }
    };
    fetchStats();
  }, []);

  /* ── save profile info ── */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        try {
          const key = profile?.email ? `profileAvatar_${profile.email}` : 'profileAvatar';
          localStorage.setItem(key, base64String);
          setAvatarPreview(base64String);
          showToast('Profile picture saved for your account!', 'success');
        } catch (error) {
          console.error("Local storage error:", error);
          showToast('Image is too large to save locally.', 'error');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    const key = profile?.email ? `profileAvatar_${profile.email}` : 'profileAvatar';
    localStorage.removeItem(key);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Profile picture removed!', 'info');
  };

  const handleSaveInfo = async () => {
    try {
      setSavingInfo(true);
      const payload = {
        firstName: form.firstName,
        lastName:  form.lastName,
        gender:    form.gender,
        age:       form.age ? Number(form.age) : undefined,
      };
      await updateProfile(payload);
      setProfile(prev => ({ ...prev, ...payload }));
      setEditMode(false);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast(err?.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingInfo(false);
    }
  };

  /* ── password validation ── */
  const validatePw = () => {
    const errs = {};
    if (!pwForm.oldPassword) errs.oldPassword = 'Current password is required.';
    if (!pwForm.newPassword || pwForm.newPassword.length < 6) errs.newPassword = 'Minimum 6 characters.';
    if (pwForm.newPassword !== pwForm.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    return errs;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errs = validatePw();
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    try {
      setSavingPw(true);
      await changePassword(pwForm);
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setPwErrors({});
      showToast('Password changed successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast(err?.response?.data?.message || 'Failed to change password.', 'error');
    } finally {
      setSavingPw(false);
    }
  };

  /* ── delete account ── */
  const handleDeleteAccount = async () => {
    try {
      setDeletingAcc(true);
      await deleteAccount();
      removeToken();
      navigate('/SignIn', { replace: true });
    } catch (err) {
      console.error(err);
      showToast(err?.response?.data?.message || 'Failed to delete account.', 'error');
      setDeletingAcc(false);
      setShowDeleteModal(false);
    }
  };

  /* ── avatar initials ── */
  const initials = profile
    ? `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() || '?'
    : '?';

  const genderOptions = ['male', 'female'];

  return (
    <>
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300 pt-24 pb-16 px-4 md:px-8">
        
        <div className="max-w-6xl mx-auto">
          {/* Header Title */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Account Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your personal information, security, and preferences.</p>
          </motion.div>

          {/* Error Banner */}
          {profileErr && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-8 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-sm font-medium px-5 py-4"
            >
              {profileErr}
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* ─── LEFT COLUMN (Sidebar) ─── */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Profile Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-800/80 shadow-lg shadow-black/[0.04] dark:shadow-black/20 ring-1 ring-slate-200/60 dark:ring-slate-700/30 p-8 flex flex-col items-center text-center"
              >
                {/* Background Banner */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-[#036464] via-teal-600 to-cyan-500 dark:from-teal-900 dark:via-slate-800 dark:to-slate-900 opacity-90" />
                
                {/* Avatar */}
                <div className="relative z-10 w-28 h-28 mt-4 rounded-full bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-800 flex items-center justify-center shadow-md group">
                  {loadingProfile ? (
                    <div className="animate-pulse w-full h-full rounded-full bg-slate-200 dark:bg-slate-700" />
                  ) : avatarPreview ? (
                    <img src={avatarPreview} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-teal-600 dark:text-teal-400 tracking-wide">{initials}</span>
                  )}

                  {/* Hover overlay for changing picture */}
                  {!loadingProfile && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors cursor-pointer text-white"
                        title="Change Picture"
                      >
                        <Camera className="w-5 h-5" />
                      </button>
                      {avatarPreview && (
                        <button
                          onClick={handleRemoveImage}
                          className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full transition-colors cursor-pointer text-white"
                          title="Remove Picture"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />

                {/* Info */}
                <div className="mt-4 w-full">
                  {loadingProfile ? (
                    <div className="flex flex-col items-center gap-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        {profile?.firstName || ''} {profile?.lastName || ''}
                      </h2>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{profile?.email || ''}</p>
                      {profile?.gender && (
                        <span className="inline-block mt-3 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-xs font-semibold uppercase tracking-wider">
                          {profile.gender}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </motion.div>

              {/* Stats / Activity Overview Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl ring-1 ring-slate-200/60 dark:ring-slate-700/30 shadow-lg shadow-black/[0.04] dark:shadow-black/20 p-6"
              >
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-500" /> Overview
                </h3>
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/50 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Mood Logs</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{moodLogsCount} Entries</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/50 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Account Status</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{hasPaymentToken ? 'Premium' : 'Standard'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/50 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">
                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-500">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Current Mental State</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{currentMentalState}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>

            {/* ─── RIGHT COLUMN (Forms) ─── */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* ══ Section 1: Profile Info ══ */}
              <SectionCard icon={<User className="w-5 h-5" />} title="Personal Information" delay={0.2}>
                {loadingProfile ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field
                        label="First Name" id="firstName"
                        value={form.firstName}
                        onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                        disabled={!editMode}
                        placeholder="e.g. Maram"
                      />
                      <Field
                        label="Last Name" id="lastName"
                        value={form.lastName}
                        onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                        disabled={!editMode}
                        placeholder="e.g. Haiba"
                      />
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="gender" className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Gender</label>
                        <select
                          id="gender"
                          value={form.gender}
                          onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
                          disabled={!editMode}
                          className="w-full rounded-xl px-4 py-3 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600/60 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400/60 dark:focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <option value="">Select gender</option>
                          {genderOptions.map(g => <option key={g} value={g} className="capitalize">{g}</option>)}
                        </select>
                      </div>
                      <Field
                        label="Age" id="age" type="number"
                        value={form.age}
                        onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
                        disabled={!editMode}
                        placeholder="e.g. 25"
                      />
                    </div>

                    {/* read-only email */}
                    <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-700/50">
                      <Field
                        label="Email Address" id="email"
                        value={profile?.email || ''}
                        disabled
                        placeholder="—"
                      />
                      <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 pl-1 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-500" /> Email is verified and cannot be changed here.
                      </p>
                    </div>

                    {/* action row */}
                    <div className="flex gap-3 mt-8 justify-end">
                      {editMode ? (
                        <>
                          <button
                            onClick={() => { setEditMode(false); setForm({ firstName: profile?.firstName || '', lastName: profile?.lastName || '', gender: profile?.gender || '', age: profile?.age != null ? String(profile.age) : '' }); }}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveInfo}
                            disabled={savingInfo}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#036464] to-teal-500 dark:from-teal-700 dark:to-teal-500 text-white shadow-sm shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {savingInfo
                              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                              : <Check className="w-4 h-4" />
                            }
                            {savingInfo ? 'Saving…' : 'Save Changes'}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setEditMode(true)}
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 ring-1 ring-teal-300 dark:ring-teal-700/60 hover:bg-teal-100 dark:hover:bg-teal-900/50 hover:-translate-y-0.5 transition-all duration-200"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit Profile
                        </button>
                      )}
                    </div>
                  </>
                )}
              </SectionCard>

              {/* ══ Section 2: Change Password ══ */}
              <SectionCard icon={<Lock className="w-5 h-5" />} title="Security & Password" delay={0.3}>
                <form onSubmit={handleChangePassword} noValidate className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <PwField label="Current Password" id="oldPassword" value={pwForm.oldPassword} onChange={e => { setPwForm(p => ({ ...p, oldPassword: e.target.value })); setPwErrors(p => ({ ...p, oldPassword: '' })); }} />
                      {pwErrors.oldPassword && <p className="text-xs text-red-500 mt-1 pl-1">{pwErrors.oldPassword}</p>}
                    </div>
                    <div>
                      <PwField label="New Password" id="newPassword" value={pwForm.newPassword} onChange={e => { setPwForm(p => ({ ...p, newPassword: e.target.value })); setPwErrors(p => ({ ...p, newPassword: '' })); }} />
                      {pwErrors.newPassword && <p className="text-xs text-red-500 mt-1 pl-1">{pwErrors.newPassword}</p>}
                    </div>
                    <div>
                      <PwField label="Confirm New Password" id="confirmPassword" value={pwForm.confirmPassword} onChange={e => { setPwForm(p => ({ ...p, confirmPassword: e.target.value })); setPwErrors(p => ({ ...p, confirmPassword: '' })); }} />
                      {pwErrors.confirmPassword && <p className="text-xs text-red-500 mt-1 pl-1">{pwErrors.confirmPassword}</p>}
                    </div>
                  </div>

                  <div className="flex justify-end mt-2 pt-5 border-t border-slate-100 dark:border-slate-700/50">
                    <button
                      type="submit"
                      disabled={savingPw}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#036464] to-teal-500 dark:from-teal-700 dark:to-teal-500 text-white shadow-sm shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {savingPw
                        ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        : <Lock className="w-4 h-4" />
                      }
                      {savingPw ? 'Updating…' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </SectionCard>

              {/* ══ Section 3: Danger Zone ══ */}
              <SectionCard icon={<Trash2 className="w-5 h-5" />} title="Danger Zone" accent="red" delay={0.4}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Delete Account</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 leading-relaxed max-w-sm">
                      Permanently delete your account and all associated data. This action cannot be undone. All your EEG metrics and sessions will be lost.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-200 dark:ring-red-800/40 hover:bg-red-100 dark:hover:bg-red-900/40 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </button>
                </div>
              </SectionCard>

            </div>
          </div>
        </div>
      </div>

      {/* ── Delete confirmation modal ── */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
          onClick={() => !deletingAcc && setShowDeleteModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-slate-100 dark:border-slate-700"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-500">
                <Trash2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Delete Account?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  This will permanently delete your account and all your data. This cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deletingAcc}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deletingAcc}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {deletingAcc && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                  {deletingAcc ? 'Deleting…' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

      {/* ── tiny keyframe for toast ── */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translate(-50%, 16px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out both; }
      `}</style>
    </>
  );
}
