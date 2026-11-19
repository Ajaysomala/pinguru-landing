import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, KeyRound, Mail } from 'lucide-react';
import { requestPasswordReset, resetPassword } from '../lib/api';
import '../styles/auth.css';

type ApiError = Error & { status?: number };

function getRequestError(error: unknown): string {
  if (error instanceof Error) {
    const status = (error as ApiError).status;
    if (status === 429) return 'Too many attempts. Please wait before trying again.';
    if (status === 503) return 'Password recovery is unavailable because the recovery email is not configured.';
    if (status === 400 || status === 401) return 'The code is invalid or expired.';
    if (error instanceof TypeError) return 'Network error. Check your connection and try again.';
  }
  return 'Unable to complete the request. Please try again.';
}

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const sendCode = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (loading || cooldown > 0) return;

    setLoading(true);
    setError('');
    try {
      await requestPasswordReset(email.trim());
      setStep(2);
      setCooldown(60);
    } catch (requestError) {
      setError(getRequestError(requestError));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the 6-digit code.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim(), otp, newPassword);
      navigate('/login', {
        replace: true,
        state: { message: 'Password updated, sign in' },
      });
    } catch (resetError) {
      setError(getRequestError(resetError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen auth-screen-centered">
      <div className="auth-showcase-orb auth-showcase-orb-a" />
      <div className="auth-showcase-orb auth-showcase-orb-b" />
      <div className="auth-panel auth-reset-panel">
        <Link to="/" className="auth-panel-brand auth-card-brand">
          <div className="auth-panel-brand-mark">PG</div>
          <span>PinGuru</span>
        </Link>

        <div className="auth-icon-tile">
          <KeyRound size={22} />
        </div>
        <h1 className="auth-panel-title auth-centered-title">
          {step === 1 ? 'Reset your password' : 'Enter recovery code'}
        </h1>
        <p className="auth-panel-subtitle auth-centered-subtitle">
          {step === 1
            ? 'Enter the admin email to request a password reset code.'
            : 'If this is the admin account, a code was sent to the recovery email.'}
        </p>

        {error && (
          <div className="auth-alert error auth-alert-spaced">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form className="auth-panel-form" onSubmit={sendCode}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Admin email</label>
              <div className="auth-input-wrap">
                <Mail size={16} className="auth-input-icon" />
                <input
                  id="email"
                  className="form-input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <button type="submit" disabled={loading || cooldown > 0} className="auth-gradient-btn">
              {loading ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Send reset code'}
            </button>
          </form>
        ) : (
          <form className="auth-panel-form" onSubmit={handleReset}>
            <div className="form-group">
              <label className="form-label" htmlFor="otp">6-digit code</label>
              <input
                id="otp"
                className="form-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                placeholder="000000"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                className="form-input"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm new password</label>
              <input
                id="confirmPassword"
                className="form-input"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Repeat your new password"
              />
            </div>

            <button type="submit" disabled={loading} className="auth-gradient-btn">
              {loading ? 'Updating...' : 'Update password'}
            </button>

            <button
              type="button"
              onClick={() => sendCode()}
              disabled={loading || cooldown > 0}
              className="auth-gradient-btn"
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
            </button>
          </form>
        )}

        <p className="auth-panel-footer">
          <Link to="/login" className="inline-flex items-center gap-1">
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
