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

  const progress = Math.min(100, Math.max(0, (otp.filter(Boolean).length / 6) * 100));

  return (
    <div className="auth-screen auth-screen-verify">
      <div className="auth-verify-card">
        <div className="auth-verify-icon"><Mail size={24} /></div>

        <h1 className="auth-panel-title" style={{ textAlign: 'center', marginTop: 8 }}>Check your email</h1>
        <p className="auth-panel-subtitle" style={{ textAlign: 'center', marginBottom: 6 }}>We sent a 6-digit code to</p>
        <p className="auth-verify-email">{email}</p>

        {error && (
          <div className="auth-alert error" style={{ marginTop: 12 }}>
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="auth-alert success" style={{ marginTop: 12 }}>
            <CheckCircle size={15} className="flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="otp-container verify" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className={`otp-input ${digit ? 'filled' : ''} ${loading ? 'opacity-50' : ''}`}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              disabled={loading}
            />
          ))}
        </div>

        <div className="auth-verify-progress">
          <div className="bar"><span style={{ width: `${progress}%` }} /></div>
          <p>Code expires in <strong>4:32</strong></p>
        </div>

        <button
          onClick={() => handleVerify(otp.join(''))}
          disabled={loading || otp.some(d => !d)}
          className="auth-gradient-btn"
          style={{ marginTop: 10 }}
        >
          {loading ? 'Verifying...' : 'Verify Email ✓'}
        </button>

        <button
          onClick={handleResend}
          disabled={resendCooldown > 0 || resending}
          className="auth-resend-btn"
        >
          <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
          {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend code'}
        </button>

        <p className="auth-panel-footer" style={{ marginTop: 8 }}>
          Wrong email? <Link to="/register">Go back</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
