import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Bell, Trash2, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { updateProfile, requestDataDeletion } from '../lib/api';
import type { User as UserType } from '../lib/types';
import { BUSINESS_CATEGORIES } from '../lib/types';
import { Badge } from '../components/ui/Badge';
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
    if (!authUser) return;
    setUser(authUser);
    const displayNameParts = splitDisplayName(authUser.display_name);
    setFirstName(authUser.first_name ?? displayNameParts.first);
    setLastName(authUser.last_name ?? displayNameParts.last);
    setCategory(authUser.business_category ?? '');
    setLoading(false);
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
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account, security, and automation preferences</p>
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
        <div className="settings-section">
          <div className="settings-section-header">
            <div className="flex items-center gap-2">
              <User size={15} className="text-primary"/>
              <h3 className="settings-section-title">Account Profile</h3>
            </div>
            <p className="settings-section-desc">Your personal details and business info</p>
          </div>
          <div className="settings-section-body">
            {/* Read-only rows */}
            <div className="profile-row">
              <span className="profile-row-label">Email</span>
              <span className="profile-row-value text-slate-500">{user?.email}</span>
            </div>
            <div className="profile-row">
              <span className="profile-row-label">Instagram</span>
              <span className="profile-row-value">
                {user?.instagram_connected
                  ? <Badge variant="green" dot>@{user.instagram_username}</Badge>
                  : <Badge variant="gray">Not connected</Badge>
                }
              </span>
            </div>
            <div className="profile-row">
              <span className="profile-row-label">Plan</span>
              <span className="profile-row-value">
                <Badge variant={user?.plan === 'free' ? 'gray' : 'indigo'}>
                  {toTitleCase(user?.plan ?? 'free')}
                </Badge>
              </span>
            </div>

            {/* Editable fields */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">First Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Last Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Business Category</label>
              <select
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none bg-white"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="">Select category...</option>
                {BUSINESS_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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

            <p className="text-xs text-slate-400 mt-1">Preferences are stored locally in your browser for now.</p>

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
