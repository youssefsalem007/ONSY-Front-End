import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, changePassword, deleteAccount } from '../services/profileService';
import { removeToken } from '../utils/cookieUtils';

/* ─── tiny icon helpers ─────────────────────────────────────────── */
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);
const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const EyeIcon = ({ open }) => open ? (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
) : (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

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
const SectionCard = ({ icon, title, children, accent = 'teal' }) => {
  const ring = accent === 'red' ? 'ring-red-200 dark:ring-red-900/40' : 'ring-teal-200/60 dark:ring-teal-700/30';
  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      className={`bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl ring-1 ${ring} shadow-lg shadow-black/[0.04] dark:shadow-black/20 p-6 md:p-8 transition-colors duration-300`}
    >
      <div className="flex items-center gap-3 mb-6">
        <span className={`p-2.5 rounded-xl ${accent === 'red' ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'}`}>
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
          <EyeIcon open={show} />
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
      
      const localAvatar = localStorage.getItem('profileAvatar');
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

  /* ── save profile info ── */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        try {
          localStorage.setItem('profileAvatar', base64String);
          setAvatarPreview(base64String);
          showToast('Profile picture saved locally!', 'success');
        } catch (error) {
          console.error("Local storage error:", error);
          showToast('Image is too large to save locally.', 'error');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    localStorage.removeItem('profileAvatar');
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
      {/* ── page wrapper ── */}
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 pt-24 pb-16 px-4 md:px-8">

        {/* ── hero / avatar strip ── */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto mb-8"
        >
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#036464] via-teal-600 to-cyan-500 dark:from-teal-900 dark:via-slate-800 dark:to-slate-900 p-8 flex flex-col sm:flex-row items-center gap-6 shadow-xl shadow-teal-500/20 dark:shadow-black/40">
            {/* decorative blobs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-cyan-300/20 blur-2xl" />
              <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
            </div>

            {/* avatar */}
            <div className="relative z-10 flex-shrink-0 w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center shadow-inner group">
              {loadingProfile ? (
                <div className="animate-pulse w-full h-full rounded-full bg-white/30" />
              ) : avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white tracking-wide">{initials}</span>
              )}

              {/* Hover overlay for changing picture */}
              {!loadingProfile && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors cursor-pointer text-white"
                    title="Change Picture"
                  >
                    <CameraIcon />
                  </button>
                  {avatarPreview && (
                    <button 
                      onClick={handleRemoveImage}
                      className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full transition-colors cursor-pointer text-white"
                      title="Remove Picture"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
            />

            {/* name + email */}
            <div className="relative z-10 text-center sm:text-left">
              {loadingProfile ? (
                <>
                  <Skeleton className="h-7 w-44 mb-2" />
                  <Skeleton className="h-4 w-36" />
                </>
              ) : (
                <>
                  <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow">
                    {profile?.firstName || ''} {profile?.lastName || ''}
                  </h1>
                  <p className="text-white/75 text-sm mt-1">{profile?.email || ''}</p>
                  {profile?.gender && (
                    <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-white/15 border border-white/25 text-white/90 text-xs font-medium capitalize">
                      {profile.gender}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── error banner ── */}
        {profileErr && (
          <div className="max-w-3xl mx-auto mb-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-sm font-medium px-5 py-4">
            {profileErr}
          </div>
        )}

        <motion.div 
          initial="hidden" animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="max-w-3xl mx-auto flex flex-col gap-6"
        >

          {/* ══ Section 1: Profile Info ══ */}
          <SectionCard icon={<UserIcon />} title="Personal Information">
            {loadingProfile ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14" />)}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="mt-4">
                  <Field
                    label="Email" id="email"
                    value={profile?.email || ''}
                    disabled
                    placeholder="—"
                  />
                  <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500 pl-1">Email cannot be changed.</p>
                </div>

                {/* action row */}
                <div className="flex gap-3 mt-6 justify-end">
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
                          : <CheckIcon />
                        }
                        {savingInfo ? 'Saving…' : 'Save Changes'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditMode(true)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 ring-1 ring-teal-300 dark:ring-teal-700/60 hover:bg-teal-100 dark:hover:bg-teal-900/50 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <EditIcon />
                      Edit Profile
                    </button>
                  )}
                </div>
              </>
            )}
          </SectionCard>

          {/* ══ Section 2: Change Password ══ */}
          <SectionCard icon={<LockIcon />} title="Change Password">
            <form onSubmit={handleChangePassword} noValidate className="flex flex-col gap-4">
              <div>
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

              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={savingPw}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#036464] to-teal-500 dark:from-teal-700 dark:to-teal-500 text-white shadow-sm shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {savingPw
                    ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <LockIcon />
                  }
                  {savingPw ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </form>
          </SectionCard>

          {/* ══ Section 3: Danger Zone ══ */}
          <SectionCard icon={<TrashIcon />} title="Danger Zone" accent="red">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Delete Account</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed max-w-xs">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-200 dark:ring-red-800/40 hover:bg-red-100 dark:hover:bg-red-900/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                <TrashIcon />
                Delete Account
              </button>
            </div>
          </SectionCard>

        </motion.div>
      </div>

      {/* ── Delete confirmation modal ── */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
          onClick={() => !deletingAcc && setShowDeleteModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-slate-100 dark:border-slate-700"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-500">
                <TrashIcon />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Delete Account?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  This will permanently delete your account and all your data. This cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
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
          </div>
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
