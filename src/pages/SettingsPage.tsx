import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Bell, Trash2, AlertTriangle, CheckCircle, RefreshCw, Mail, AtSign, BriefcaseBusiness, BadgeCheck, PencilLine } from 'lucide-react';
import { getProfile, updateProfile, requestDataDeletion } from '../lib/api';
import type { User as UserType } from '../lib/types';
import { BUSINESS_CATEGORIES } from '../lib/types';
import { toTitleCase } from '../lib/utils';
import { useAuth } from '../App';
import '../styles/dashboard.css';
import '../styles/settings.css';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [user, setUser]             = useState<UserType | null>(null);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  // Editable fields
  const [firstName, setFirstName]   = useState('');
  const [lastName, setLastName]     = useState('');
  const [category, setCategory]     = useState('');
  const [pauseHours, setPauseHours] = useState(false);
  const [usageAlert, setUsageAlert] = useState(true);

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
        if (!mounted && authUser) return;
        if (authUser) {
          setUser(authUser);
          const displayNameParts = splitDisplayName(authUser.display_name);
          setFirstName(authUser.first_name ?? displayNameParts.first);
          setLastName(authUser.last_name ?? displayNameParts.last);
          setCategory(authUser.business_category ?? '');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();
    return () => { mounted = false; };
  }, [authUser]);

  const handleSaveProfile = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const updated = await updateProfile({
        first_name: firstName.trim(),
        last_name:  lastName.trim(),
        business_category: category,
      });
      setUser(updated);
      if (updated) {
        const displayNameParts = splitDisplayName(updated.display_name);
        setFirstName(updated.first_name ?? displayNameParts.first);
        setLastName(updated.last_name ?? displayNameParts.last);
        setCategory(updated.business_category ?? '');
      }
      setSuccess('Profile updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile.');
    } finally { setSaving(false); }
  };

  const handleDataDeletion = async () => {
    setDeleting(true); setError('');
    try {
      await requestDataDeletion();
      setSuccess('Data deletion request submitted. You will receive a confirmation email.');
      setConfirmDelete(false);
      setTimeout(() => { setSuccess(''); navigate('/login'); }, 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit deletion request.');
    } finally { setDeleting(false); }
  };

  if (loading) return (
    <div className="page-wrapper flex justify-center items-center min-h-[60vh]">
      <svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="page-header settings-hero">
        <div>
          <p className="settings-eyebrow">Account Settings</p>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your profile, automation preferences, and data controls from one place.</p>
        </div>
        <div className="settings-hero-card">
          <div className="settings-hero-avatar">
            {user?.first_name?.[0] || user?.display_name?.[0] || 'P'}
          </div>
          <div>
            <p className="settings-hero-name">{user?.display_name || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Your profile'}</p>
            <p className="settings-hero-meta">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 mb-5 text-sm">
          <AlertTriangle size={15} className="flex-shrink-0"/>
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 mb-5 text-sm">
          <CheckCircle size={15} className="flex-shrink-0"/>
          <span>{success}</span>
        </div>
      )}

      <div className="settings-grid">

        {/* ── Account Profile ── */}
        <div className="settings-section settings-section-wide">
          <div className="settings-section-header">
            <div className="flex items-center gap-2">
              <User size={15} className="text-primary"/>
              <h3 className="settings-section-title">Account Profile</h3>
            </div>
            <p className="settings-section-desc">Your personal details and business info</p>
          </div>
          <div className="settings-section-body">
            <div className="settings-summary-grid">
              <div className="settings-summary-card settings-summary-card-primary">
                <div className="settings-summary-icon"><Mail size={16} /></div>
                <div>
                  <p className="settings-summary-label">Email</p>
                  <p className="settings-summary-value">{user?.email}</p>
                </div>
              </div>
              <div className="settings-summary-card">
                <div className="settings-summary-icon"><AtSign size={16} /></div>
                <div>
                  <p className="settings-summary-label">Instagram</p>
                  <p className="settings-summary-value">
                    {user?.instagram_connected
                      ? (user.instagram_username ? `@${user.instagram_username}` : 'Connected')
                      : 'Not connected'}
                  </p>
                </div>
              </div>
              <div className="settings-summary-card">
                <div className="settings-summary-icon"><BadgeCheck size={16} /></div>
                <div>
                  <p className="settings-summary-label">Plan</p>
                  <p className="settings-summary-value">{toTitleCase(user?.plan ?? 'free')}</p>
                </div>
              </div>
              <div className="settings-summary-card">
                <div className="settings-summary-icon"><BriefcaseBusiness size={16} /></div>
                <div>
                  <p className="settings-summary-label">Business Category</p>
                  <p className="settings-summary-value">{category || 'Not set'}</p>
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
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="settings-field-label">Last Name</label>
                <input
                  type="text"
                  className="settings-field-input"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label className="settings-field-label">Business Category</label>
              <select
                className="settings-field-input settings-field-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="">Select category...</option>
                {BUSINESS_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="settings-profile-note">
              <PencilLine size={14} />
              <span>
                These are the same onboarding details used to personalize your profile. Updating them here keeps the dashboard and onboarding data aligned.
              </span>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="settings-primary-action"
            >
              {saving ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving…</>
              ) : 'Save Profile'}
            </button>
          </div>
        </div>

        {/* ── Automation Preferences ── */}
        <div className="settings-section">
          <div className="settings-section-header">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-amber-500"/>
              <h3 className="settings-section-title">Automation Preferences</h3>
            </div>
            <p className="settings-section-desc">Control when and how automations fire</p>
          </div>
          <div className="settings-section-body">
            <label className="pref-item">
              <input
                type="checkbox"
                className="pref-checkbox"
                checked={pauseHours}
                onChange={e => setPauseHours(e.target.checked)}
              />
              <div>
                <p className="pref-label">Pause outside working hours</p>
                <p className="pref-desc">Stop automations between 10 PM – 8 AM IST</p>
              </div>
            </label>

            <label className="pref-item">
              <input
                type="checkbox"
                className="pref-checkbox"
                checked={usageAlert}
                onChange={e => setUsageAlert(e.target.checked)}
              />
              <div>
                <p className="pref-label">Email me at 80% usage</p>
                <p className="pref-desc">Get notified before you hit your DM limit</p>
              </div>
            </label>

            <div className="settings-note-inline">Preferences are stored locally in your browser for now.</div>

            <button
              onClick={() => { localStorage.setItem('pg_prefs', JSON.stringify({ pauseHours, usageAlert })); setSuccess('Preferences saved.'); setTimeout(() => setSuccess(''), 2000); }}
              className="w-full py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </div>

        {/* ── Security & Access ── */}
        <div className="settings-section">
          <div className="settings-section-header">
            <div className="flex items-center gap-2">
              <Shield size={15} className="text-emerald-500"/>
              <h3 className="settings-section-title">Security & Access</h3>
            </div>
            <p className="settings-section-desc">Password and login security</p>
          </div>
          <div className="settings-section-body">
            <p className="text-sm text-slate-500 mb-3">
              Password and login security are managed through your authentication flow.
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 py-2.5 px-4 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <RefreshCw size={14}/>
                Re-authenticate
              </button>
              <a
                href="/support"
                className="flex items-center gap-2 py-2.5 px-4 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <Shield size={14}/>
                Open Support Center
              </a>
              <a
                href="mailto:support@pinguru.me"
                className="flex items-center gap-2 py-2.5 px-4 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <Shield size={14}/>
                Email Support
              </a>
            </div>
          </div>
        </div>

        {/* ── Data & Meta Compliance ── */}
        <div className="settings-section danger-zone">
          <div className="settings-section-header">
            <div className="flex items-center gap-2">
              <Trash2 size={15} className="text-danger"/>
              <h3 className="settings-section-title">Data & Privacy</h3>
            </div>
            <p className="settings-section-desc">GDPR / Meta Platform Policy compliance</p>
          </div>
          <div className="settings-section-body">
            <p className="text-sm text-slate-600 mb-1">
              Request permanent deletion of all your data including your account, automation rules, and DM logs.
            </p>
            <p className="text-xs text-slate-400 mb-4">
              Required by Meta's Platform Policy. This action cannot be undone.
            </p>

            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 py-2.5 px-4 text-sm font-semibold text-danger bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
              >
                <Trash2 size={14}/>
                Delete My Data
              </button>
            ) : (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                <div className="flex items-start gap-2.5 mb-4">
                  <AlertTriangle size={15} className="text-danger flex-shrink-0 mt-0.5"/>
                  <p className="text-sm text-rose-700 font-medium">
                    This will permanently delete your account and all associated data. This cannot be undone.
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <button
                    onClick={handleDataDeletion}
                    disabled={deleting}
                    className="flex-1 py-2 text-sm font-bold text-white bg-danger hover:bg-rose-600 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <><svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Deleting…</>
                    ) : 'Yes, delete everything'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
