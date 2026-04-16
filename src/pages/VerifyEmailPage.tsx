import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { verifyEmailOtp, resendEmailOtp } from '../lib/api';
import '../styles/auth.css';

const VerifyEmailPage: React.FC = () => {
  const navigate      = useNavigate();
  const [params]      = useSearchParams();
  const email         = params.get('email') || localStorage.getItem('pg_verify_email') || '';

  const [otp, setOtp]           = useState(['', '', '', '', '', '']);
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown(v => v - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  const handleChange = (i: number, val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = cleaned;
    setOtp(next);
    if (cleaned && i < 5) inputRefs.current[i + 1]?.focus();
    if (next.every(d => d)) handleVerify(next.join(''));
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    if (digits.length === 6) {
      setOtp(digits);
      setTimeout(() => handleVerify(digits.join('')), 50);
    }
  };

  const handleVerify = async (code: string) => {
    if (code.length !== 6) return;
    setLoading(true); setError('');
    try {
      await verifyEmailOtp(email, code);
      setSuccess('Email verified! Redirecting...');
      localStorage.removeItem('pg_verify_email');
      setTimeout(() => navigate('/onboarding'), 1200);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP');
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResending(true); setError('');
    try {
      await resendEmailOtp(email);
      setSuccess('New OTP sent! Check your inbox.');
      setResendCooldown(60);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally { setResending(false); }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <div className="auth-logo-mark">PG</div>
          <span className="auth-logo-name">PinGuru</span>
        </Link>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <Mail size={26} className="text-primary" />
          </div>
        </div>

        <h1 className="auth-title">Check your email</h1>
        <p className="auth-subtitle">
          We sent a 6-digit code to<br />
          <strong className="text-slate-700">{email}</strong>
        </p>

        {error && (
          <div className="auth-alert error my-4">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="auth-alert success my-4">
            <CheckCircle size={15} className="flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* OTP inputs */}
        <div className="otp-container my-6" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="text" inputMode="numeric" maxLength={1}
              className={`otp-input ${digit ? 'filled' : ''} ${loading ? 'opacity-50' : ''}`}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              disabled={loading}
            />
          ))}
        </div>

        {loading && (
          <div className="flex justify-center mb-4">
            <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        )}

        <button
          onClick={handleResend}
          disabled={resendCooldown > 0 || resending}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-500 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
        </button>

        <p className="auth-footer mt-4">
          Wrong email? <Link to="/register">Go back</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
