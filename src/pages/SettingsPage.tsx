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
  Sparkles,
  Clock3,
  ShieldCheck,
  ExternalLink,
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
  const instagramStatus = user?.instagram_connected
    ? (user.instagram_username ? `Connected as @${user.instagram_username}` : 'Connected')
    : 'Not connected';

  return (
    <div className="page-wrapper settings-v2-page">
      <section className="settings-v2-hero">
        <div className="settings-v2-hero-copy">
          <p className="settings-v2-kicker"><Sparkles size={12} /> Account Control Center</p>
          <h1 className="settings-v2-title">Settings</h1>
          <p className="settings-v2-subtitle">A cleaner workspace for profile details, automation preferences, and privacy controls.</p>
          <div className="settings-v2-chip-row">
            <span className="settings-v2-chip"><BadgeCheck size={12} /> Plan: {toTitleCase(user?.plan ?? 'free')}</span>
            <span className="settings-v2-chip"><AtSign size={12} /> {instagramStatus}</span>
          </div>
        </div>
        <div className="settings-v2-identity-card">
          <div className="settings-v2-avatar">{user?.first_name?.[0] || user?.display_name?.[0] || 'P'}</div>
          <div>
            <p className="settings-v2-name">{fullName}</p>
            <p className="settings-v2-meta">{user?.email}</p>
          </div>
          <Link to="/settings/profile" className="settings-v2-edit-link">
            <PencilLine size={13} /> Edit Profile
          </Link>
        </div>
      </section>

      {error && (
        <div className="settings-v2-alert error">
          <AlertTriangle size={15} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="settings-v2-alert success">
          <CheckCircle size={15} className="flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="settings-v2-layout">
        <div className="settings-v2-main-col">
          <section className="settings-v2-card">
            <header className="settings-v2-card-head">
              <div>
                <p className="settings-v2-card-eyebrow"><User size={14} /> Profile Snapshot</p>
                <h3>Account Profile</h3>
              </div>
              <Link to="/settings/profile" className="settings-v2-inline-action">
                <PencilLine size={13} /> Edit
              </Link>
            </header>
            <div className="settings-v2-profile-grid">
              <div className="settings-v2-profile-tile">
                <Mail size={15} />
                <div>
                  <p className="label">Email</p>
                  <p className="value">{user?.email}</p>
                </div>
              </div>
              <div className="settings-v2-profile-tile">
                <AtSign size={15} />
                <div>
                  <p className="label">Instagram</p>
                  <p className="value">{user?.instagram_connected ? (user.instagram_username ? `@${user.instagram_username}` : 'Connected') : 'Not connected'}</p>
                </div>
              </div>
              <div className="settings-v2-profile-tile">
                <BadgeCheck size={15} />
                <div>
                  <p className="label">Plan</p>
                  <p className="value">{toTitleCase(user?.plan ?? 'free')}</p>
                </div>
              </div>
              <div className="settings-v2-profile-tile">
                <BriefcaseBusiness size={15} />
                <div>
                  <p className="label">Business Category</p>
                  <p className="value">{user?.business_category || 'Not set'}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="settings-v2-card">
            <header className="settings-v2-card-head">
              <div>
                <p className="settings-v2-card-eyebrow"><Bell size={14} /> Automation Preferences</p>
                <h3>Flow Controls</h3>
              </div>
            </header>
            <div className="settings-v2-toggle-list">
              <label className="settings-v2-toggle-item">
                <div>
                  <p className="toggle-title">Pause outside working hours</p>
                  <p className="toggle-desc">Stop automations between 10 PM and 8 AM IST.</p>
                </div>
                <input type="checkbox" checked={pauseHours} onChange={(e) => setPauseHours(e.target.checked)} />
              </label>
              <label className="settings-v2-toggle-item">
                <div>
                  <p className="toggle-title">Email me at 80% usage</p>
                  <p className="toggle-desc">Get a heads-up before you hit your monthly DM threshold.</p>
                </div>
                <input type="checkbox" checked={usageAlert} onChange={(e) => setUsageAlert(e.target.checked)} />
              </label>
            </div>
            <p className="settings-v2-note">Preferences are saved locally in this browser.</p>
            <button onClick={savePrefs} className="settings-v2-primary-btn">Save Preferences</button>
          </section>

          <section className="settings-v2-card">
            <header className="settings-v2-card-head">
              <div>
                <p className="settings-v2-card-eyebrow"><Shield size={14} /> Security & Access</p>
                <h3>Session & Support</h3>
              </div>
            </header>
            <div className="settings-v2-action-stack">
              <button onClick={() => navigate('/login')} className="settings-v2-neutral-btn">
                <RefreshCw size={14} /> Re-authenticate
              </button>
              <a href="/support" className="settings-v2-neutral-btn">
                <ShieldCheck size={14} /> Open Support Center
              </a>
              <a href="mailto:support@pinguru.me" className="settings-v2-neutral-btn">
                <ExternalLink size={14} /> Email Support
              </a>
            </div>
          </section>
        </div>

        <aside className="settings-v2-side-col">
          <section className="settings-v2-card settings-v2-health-card">
            <header className="settings-v2-card-head">
              <div>
                <p className="settings-v2-card-eyebrow"><Clock3 size={14} /> Account Health</p>
                <h3>Status Overview</h3>
              </div>
            </header>
            <div className="settings-v2-health-list">
              <div className="settings-v2-health-item">
                <span>Instagram</span>
                <strong>{user?.instagram_connected ? 'Connected' : 'Disconnected'}</strong>
              </div>
              <div className="settings-v2-health-item">
                <span>Plan</span>
                <strong>{toTitleCase(user?.plan ?? 'free')}</strong>
              </div>
              <div className="settings-v2-health-item">
                <span>Business Category</span>
                <strong>{user?.business_category || 'Not set'}</strong>
              </div>
            </div>
          </section>

          <section className="settings-v2-card settings-v2-danger-card">
            <header className="settings-v2-card-head">
              <div>
                <p className="settings-v2-card-eyebrow"><Trash2 size={14} /> Data & Privacy</p>
                <h3>Danger Zone</h3>
              </div>
            </header>
            <p className="settings-v2-danger-text">Request permanent deletion of your account, automation rules, and DM logs. This action is irreversible.</p>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} className="settings-v2-danger-btn">
                <Trash2 size={14} /> Delete My Data
              </button>
            ) : (
              <div className="settings-v2-danger-confirm">
                <div className="settings-v2-danger-warning">
                  <AlertTriangle size={15} className="text-danger flex-shrink-0" />
                  <p>Type DELETE to confirm permanent deletion.</p>
                </div>
                <input
                  type="text"
                  className="settings-field-input"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="Type DELETE"
                />
                <div className="settings-v2-danger-actions">
                  <button
                    onClick={handleDataDeletion}
                    disabled={deleting || deleteInput !== 'DELETE'}
                    className="settings-v2-danger-confirm-btn"
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
                      'Confirm Delete'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setConfirmDelete(false);
                      setDeleteInput('');
                    }}
                    className="settings-v2-cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
};

export default SettingsPage;
