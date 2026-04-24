import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle, Mail, KeyRound, ArrowRight } from 'lucide-react';
import { registerUser } from '../lib/api';
import '../styles/auth.css';

const rules = [
  { id: 'len',    label: 'At least 8 characters',   test: (p: string) => p.length >= 8 },
  { id: 'upper',  label: 'One uppercase letter',     test: (p: string) => /[A-Z]/.test(p) },
  { id: 'num',    label: 'One number',               test: (p: string) => /[0-9]/.test(p) },
];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [focused, setFocused]   = useState(false);

  const allPassed = rules.every(r => r.test(password));
  const match     = password === confirm && confirm.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allPassed) { setError('Password does not meet requirements'); return; }
    if (!match)     { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      await registerUser(email, password);
      localStorage.setItem('pg_verify_email', email);
      navigate(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-screen auth-screen-split register">
      <section className="auth-showcase">
        <div className="auth-showcase-video-layer" aria-hidden="true">
          <video
            className="auth-showcase-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src="/auth-showcase.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="auth-showcase-orb auth-showcase-orb-a" />
        <div className="auth-showcase-orb auth-showcase-orb-b" />
        <div className="auth-showcase-inner">
          <div className="auth-showcase-brand-mark">PG</div>
          <h2 className="auth-showcase-brand">PinGuru</h2>
          <p className="auth-showcase-copy">Join 5,000+ Indian creators &amp; brands automating Instagram with PinGuru.</p>

          <div className="auth-testimonial-card">
            <p className="stars">★★★★★</p>
            <p className="quote">"PinGuru took us from manually answering 200 DMs/day to fully automated. Revenue up 3x."</p>
            <div className="author-row">
              <span className="avatar">AK</span>
              <div>
                <strong>Ananya K.</strong>
                <small>Fashion brand, Mumbai</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-pane">
        <div className="auth-panel register-wide">
          <Link to="/" className="auth-panel-brand">
            <div className="auth-panel-brand-mark">PG</div>
            <span>PinGuru</span>
          </Link>

          <h1 className="auth-panel-title">Create your account</h1>
          <p className="auth-panel-subtitle">Free forever · No credit card required</p>

          {error && (
            <div className="auth-alert error" style={{ marginBottom: 12 }}>
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="auth-panel-form" onSubmit={handleSubmit}>
            <div className="auth-two-col">
              <div className="form-group">
                <label className="form-label">First name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ravi"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Sharma"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <div className="auth-input-wrap">
                <Mail size={16} className="auth-input-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="auth-input-wrap">
                <KeyRound size={16} className="auth-input-icon" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Min 8 chars, A-Z, 0-9, symbol"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused(true)}
                />
                <button type="button" className="auth-input-action" onClick={() => setShowPwd(v => !v)}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {focused && password.length > 0 && (
                <div className="auth-rules-list">
                  {rules.map(r => (
                    <div key={r.id} className={`auth-rule-row ${r.test(password) ? 'ok' : ''}`}>
                      <CheckCircle size={12} />
                      <span>{r.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm password</label>
              <input
                type={showPwd ? 'text' : 'password'}
                className={`form-input ${confirm.length > 0 ? (match ? 'auth-valid' : 'auth-invalid') : ''}`}
                placeholder="Repeat your password"
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Business category <span className="auth-mute">(optional)</span></label>
              <select className="form-input" value={businessCategory} onChange={e => setBusinessCategory(e.target.value)}>
                <option value="">Select a category</option>
                <option>Fashion &amp; Clothing</option>
                <option>Food &amp; Beverage</option>
                <option>Education &amp; Courses</option>
                <option>Fitness &amp; Wellness</option>
                <option>E-commerce</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="auth-gradient-btn">
              {loading ? 'Creating account...' : <>Create Account Free <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="auth-terms-line">By creating an account you agree to our <Link to="/terms">Terms</Link> &amp; <Link to="/privacy">Privacy Policy</Link></p>
          <p className="auth-panel-footer">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </section>
    </div>
  );
};

export default RegisterPage;
