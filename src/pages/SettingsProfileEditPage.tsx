import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, Save, User, BriefcaseBusiness, Sparkles, Camera } from 'lucide-react';
import { getProfile, updateProfile } from '../lib/api';
import { BUSINESS_CATEGORIES } from '../lib/types';
import type { User as UserType } from '../lib/types';
import { useAuth } from '../App';
import '../styles/dashboard.css';
import '../styles/settings.css';

const SettingsProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [category, setCategory] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(() => {
    return authUser?.avatar_url || localStorage.getItem('pinguru_user_avatar') || null;
  });

  const splitDisplayName = (name?: string) => {
    if (!name) return { first: '', last: '' };
    const parts = name.trim().split(/\s+/);
    return {
      first: parts[0] ?? '',
      last: parts.slice(1).join(' '),
    };
  };

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        if (!mounted || !profile) return;
        setUser(profile);
        const displayNameParts = splitDisplayName(profile.display_name);
        setFirstName(profile.first_name ?? displayNameParts.first);
        setLastName(profile.last_name ?? displayNameParts.last);
        setCategory(profile.business_category ?? '');
      } catch {
        if (!mounted) return;
        if (authUser) {
          setUser(authUser);
          const displayNameParts = splitDisplayName(authUser.display_name);
          setFirstName(authUser.first_name ?? displayNameParts.first);
          setLastName(authUser.last_name ?? displayNameParts.last);
          setCategory(authUser.business_category ?? '');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      mounted = false;
    };
  }, [authUser]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Profile image must be less than 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      localStorage.setItem('pinguru_user_avatar', result);
      window.dispatchEvent(new Event('pinguru_avatar_updated'));
      setSuccess('Profile photo updated successfully.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    localStorage.removeItem('pinguru_user_avatar');
    window.dispatchEvent(new Event('pinguru_avatar_updated'));
    setSuccess('Profile photo removed.');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updated = await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        business_category: category,
      });
      setUser(updated);
      setSuccess('Profile updated successfully. Redirecting to settings...');
      setTimeout(() => navigate('/settings'), 900);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper flex justify-center items-center min-h-[60vh]">
        <svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  const initialFirst = firstName?.[0] || (user?.display_name ? user.display_name[0] : 'P');
  const initialLast = lastName?.[0] || 'G';

  return (
    <div className="page-wrapper settings-edit-page space-y-6">
      <section className="pg-surface-hero settings-edit-hero bg-[#121218]/80 border border-white/10 backdrop-blur-md rounded-2xl p-6 lg:p-8">
        <Link to="/settings" className="settings-back-link text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 text-xs font-semibold mb-3">
          <ArrowLeft size={14} />
          Back to Settings
        </Link>
        <p className="pg-surface-kicker text-cyan-400 font-mono text-xs flex items-center gap-1.5 font-bold"><Sparkles size={12} /> Profile Studio</p>
        <h1 className="pg-surface-title text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">Edit Profile</h1>
        <p className="pg-surface-subtitle text-slate-600 dark:text-zinc-400 text-xs sm:text-sm mt-1">Update your account details and business category so onboarding and account health stay accurate.</p>
      </section>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle size={15} className="flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs flex items-center gap-2">
          <CheckCircle size={15} className="flex-shrink-0 text-cyan-400" />
          <span>{success}</span>
        </div>
      )}

      <div className="settings-section settings-edit-shell bg-[#121218]/80 border border-white/10 backdrop-blur-md rounded-2xl p-6 lg:p-8 space-y-6">
        <div className="settings-section-header border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <User size={16} className="text-cyan-400" />
            <h3 className="settings-section-title text-base font-bold text-slate-900 dark:text-white tracking-tight">Profile Details</h3>
          </div>
          <p className="settings-section-desc text-xs text-slate-600 dark:text-zinc-400 mt-1">This information appears throughout your dashboard and automation funnels.</p>
        </div>

        <div className="settings-section-body space-y-6">
          {/* Profile Photo Upload & Preview Section */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-[#09090B]/60 border border-white/10 rounded-2xl">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-full border-2 border-indigo-500/40 hover:border-indigo-400 transition-all overflow-hidden flex items-center justify-center bg-[#121218] shadow-lg">
                {avatarPreview ? (
                  <img src={avatarPreview} alt={user?.display_name || 'User'} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 flex items-center justify-center text-white text-xl font-bold uppercase tracking-tight">
                    {initialFirst}{initialLast}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Profile Photo</h4>
              <p className="text-xs text-slate-600 dark:text-zinc-400">Upload a JPG, PNG or WebP photo under 2MB. Your avatar appears across the top navigation and automation studios.</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1.5">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Camera size={13} />
                  <span>Upload New Photo</span>
                </button>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium border border-white/10 transition-all cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="settings-summary-grid grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="settings-summary-card p-4 rounded-xl bg-[#09090B]/50 border border-white/5">
              <div>
                <p className="settings-summary-label text-[11px] font-semibold text-slate-600 dark:text-zinc-400">Email Address</p>
                <p className="settings-summary-value text-xs font-mono text-slate-900 dark:text-white mt-0.5">{user?.email}</p>
              </div>
            </div>
            <div className="settings-summary-card p-4 rounded-xl bg-[#09090B]/50 border border-white/5">
              <div>
                <p className="settings-summary-label text-[11px] font-semibold text-zinc-400">Instagram Handle</p>
                <p className="settings-summary-value text-xs font-mono text-cyan-400 mt-0.5">
                  {user?.instagram_connected ? (user.instagram_username ? `@${user.instagram_username}` : 'Connected') : 'Not connected'}
                </p>
              </div>
            </div>
          </div>

          <div className="settings-edit-grid">
            <div>
              <label className="settings-field-label">First Name</label>
              <input
                type="text"
                className="settings-field-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>
            <div>
              <label className="settings-field-label">Last Name</label>
              <input
                type="text"
                className="settings-field-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>

          <div>
            <label className="settings-field-label flex items-center gap-2">
              <BriefcaseBusiness size={14} />
              Business Category
            </label>
            <select className="settings-field-input settings-field-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select category...</option>
              {BUSINESS_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="settings-edit-actions">
            <button type="button" className="settings-secondary-action" onClick={() => navigate('/settings')} disabled={saving}>
              Cancel
            </button>
            <button type="button" className="settings-primary-action" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsProfileEditPage;
