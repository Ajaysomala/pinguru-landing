import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, Save, User, BriefcaseBusiness } from 'lucide-react';
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

  return (
    <div className="page-wrapper settings-edit-page">
      <div className="page-header mb-5">
        <Link to="/settings" className="settings-back-link">
          <ArrowLeft size={14} />
          Back to Settings
        </Link>
        <h1 className="page-title mt-2">Edit Profile</h1>
        <p className="page-subtitle">Update your account details and business category.</p>
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

      <div className="settings-section settings-edit-shell">
        <div className="settings-section-header">
          <div className="flex items-center gap-2">
            <User size={15} className="text-primary" />
            <h3 className="settings-section-title">Profile Details</h3>
          </div>
          <p className="settings-section-desc">This information appears throughout your dashboard.</p>
        </div>

        <div className="settings-section-body">
          <div className="settings-summary-grid">
            <div className="settings-summary-card settings-summary-card-primary">
              <div>
                <p className="settings-summary-label">Email</p>
                <p className="settings-summary-value">{user?.email}</p>
              </div>
            </div>
            <div className="settings-summary-card">
              <div>
                <p className="settings-summary-label">Instagram</p>
                <p className="settings-summary-value">
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
