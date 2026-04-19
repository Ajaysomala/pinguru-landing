import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  Bell,
  Trash2,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Mail,
  AtSign,
  BriefcaseBusiness,
  BadgeCheck,
  PencilLine,
} from 'lucide-react';
import { getProfile, requestDataDeletion } from '../lib/api';
import type { User as UserType } from '../lib/types';
import { toTitleCase } from '../lib/utils';
import { useAuth } from '../App';
import '../styles/dashboard.css';
import '../styles/settings.css';

const PREFS_KEY = 'pg_prefs';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [pauseHours, setPauseHours] = useState(false);
  const [usageAlert, setUsageAlert] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        if (!mounted) return;
        if (profile) {
          setUser(profile);
        } else if (authUser) {
          setUser(authUser);
        }
      } catch {
        if (!mounted) return;
        if (authUser) setUser(authUser);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const rawPrefs = localStorage.getItem(PREFS_KEY);
    if (rawPrefs) {
      try {
        const parsed = JSON.parse(rawPrefs) as { pauseHours?: boolean; usageAlert?: boolean };
        setPauseHours(Boolean(parsed.pauseHours));
        setUsageAlert(parsed.usageAlert ?? true);
      } catch {
        setPauseHours(false);
        setUsageAlert(true);
      }
    }

    loadProfile();
    return () => {
      mounted = false;
    };
  }, [authUser]);

  const handleDataDeletion = async () => {
    setDeleting(true);
    setError('');
    try {
      await requestDataDeletion();
      setSuccess('Data deletion request submitted. You will receive a confirmation email.');
      setConfirmDelete(false);
      setDeleteInput('');
      setTimeout(() => {
        setSuccess('');
        navigate('/login');
      }, 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit deletion request.');
    } finally {
      setDeleting(false);
    }
  };

  const savePrefs = () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ pauseHours, usageAlert }));
    setSuccess('Preferences saved.');
    setTimeout(() => setSuccess(''), 2000);
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

  const fullName = user?.display_name || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Your profile';

  return (
    <div className="page-wrapper">
      <div className="page-header settings-hero">
        <div>
          <p className="settings-eyebrow">Account Settings</p>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your profile, automation preferences, and data controls from one place.</p>
        </div>
        <div className="settings-hero-card">
          <div className="settings-hero-avatar">{user?.first_name?.[0] || user?.display_name?.[0] || 'P'}</div>
          <div>
            <p className="settings-hero-name">{fullName}</p>
            <p className="settings-hero-meta">{user?.email}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 mb-5 text-sm">
          <AlertTriangle size={15} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 mb-5 text-sm">
          <CheckCircle size={15} className="flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="settings-grid">
        <div className="settings-section settings-section-wide">
          <div className="settings-section-header">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <User size={15} className="text-primary" />
                  <h3 className="settings-section-title">Account Profile</h3>
                </div>
                <p className="settings-section-desc">Your personal details and business info</p>
              </div>
              <Link to="/settings/profile" className="settings-edit-button">
                <PencilLine size={14} />
                Edit Profile
              </Link>
            </div>
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
                    {user?.instagram_connected ? (user.instagram_username ? `@${user.instagram_username}` : 'Connected') : 'Not connected'}
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
                  <p className="settings-summary-value">{user?.business_category || 'Not set'}</p>
                </div>
              </div>
            </div>

            <div className="profile-row">
              <span className="profile-row-label">First name</span>
              <span className="profile-row-value">{user?.first_name || 'Not set'}</span>
            </div>
            <div className="profile-row">
              <span className="profile-row-label">Last name</span>
              <span className="profile-row-value">{user?.last_name || 'Not set'}</span>
            </div>
            <div className="profile-row">
              <span className="profile-row-label">Business category</span>
              <span className="profile-row-value">{user?.business_category || 'Not set'}</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-header">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-amber-500" />
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
                onChange={(e) => setPauseHours(e.target.checked)}
              />
              <div>
                <p className="pref-label">Pause outside working hours</p>
                <p className="pref-desc">Stop automations between 10 PM - 8 AM IST</p>
              </div>
            </label>

            <label className="pref-item">
              <input
                type="checkbox"
                className="pref-checkbox"
                checked={usageAlert}
                onChange={(e) => setUsageAlert(e.target.checked)}
              />
              <div>
                <p className="pref-label">Email me at 80% usage</p>
                <p className="pref-desc">Get notified before you hit your DM limit</p>
              </div>
            </label>

            <div className="settings-note-inline">Preferences are stored locally in your browser for now.</div>

            <button onClick={savePrefs} className="w-full py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              Save Preferences
            </button>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-header">
            <div className="flex items-center gap-2">
              <Shield size={15} className="text-emerald-500" />
              <h3 className="settings-section-title">Security & Access</h3>
            </div>
            <p className="settings-section-desc">Password and login security</p>
          </div>
          <div className="settings-section-body">
            <p className="text-sm text-slate-500 mb-3">Password and login security are managed through your authentication flow.</p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 py-2.5 px-4 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <RefreshCw size={14} />
                Re-authenticate
              </button>
              <a href="/support" className="flex items-center gap-2 py-2.5 px-4 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                <Shield size={14} />
                Open Support Center
              </a>
              <a href="mailto:support@pinguru.me" className="flex items-center gap-2 py-2.5 px-4 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                <Shield size={14} />
                Email Support
              </a>
            </div>
          </div>
        </div>

        <div className="settings-section danger-zone">
          <div className="settings-section-header">
            <div className="flex items-center gap-2">
              <Trash2 size={15} className="text-danger" />
              <h3 className="settings-section-title">Data & Privacy</h3>
            </div>
            <p className="settings-section-desc">GDPR / Meta Platform Policy compliance</p>
          </div>
          <div className="settings-section-body">
            <p className="text-sm text-slate-600 mb-1">Request permanent deletion of all your data including your account, automation rules, and DM logs.</p>
            <p className="text-xs text-slate-400 mb-4">Required by Meta's Platform Policy. This action cannot be undone.</p>

            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 py-2.5 px-4 text-sm font-semibold text-danger bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
              >
                <Trash2 size={14} />
                Delete My Data
              </button>
            ) : (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                <div className="flex items-start gap-2.5 mb-3">
                  <AlertTriangle size={15} className="text-danger flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-700 font-medium">Type DELETE to confirm permanent data deletion.</p>
                </div>
                <input
                  type="text"
                  className="settings-field-input mb-3"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="Type DELETE"
                />
                <div className="flex gap-2.5">
                  <button
                    onClick={handleDataDeletion}
                    disabled={deleting || deleteInput !== 'DELETE'}
                    className="flex-1 py-2 text-sm font-bold text-white bg-danger hover:bg-rose-600 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      'Yes, delete everything'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setConfirmDelete(false);
                      setDeleteInput('');
                    }}
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
