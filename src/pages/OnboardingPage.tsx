import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, ArrowRight, CheckCircle, MessageCircle, BarChart3 } from 'lucide-react';
import { updateOnboarding, getMe } from '../lib/api';
import { BUSINESS_CATEGORIES } from '../lib/types';
import '../styles/auth.css';

const steps = ['Profile', 'Business', 'Done'];

const OnboardingPage: React.FC = () => {
  const navigate  = useNavigate();
  const [step, setStep]           = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [category, setCategory]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  // Pre-fill from registration data — skip name step if already set
  useEffect(() => {
    getMe().then(user => {
      if (user?.first_name) {
        setFirstName(user.first_name);
        setLastName(user.last_name || '');
        setCategory(user.business_category || '');
        setStep(1); // skip to Business step
      }
    }).catch(() => {});
  }, []);

  const handleNext = () => {
    if (step === 0) {
      if (!firstName.trim()) { setError('First name is required'); return; }
      setError(''); setStep(1);
    }
  };

  const handleSubmit = async () => {
    if (!category) { setError('Please select a business category'); return; }
    setLoading(true); setError('');
    try {
      await updateOnboarding({ first_name: firstName.trim(), last_name: lastName.trim(), business_category: category });
      setStep(2);
      setTimeout(() => navigate('/dashboard'), 1800);
    } catch (err: any) {
      setError(err.message || 'Setup failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-screen auth-screen-split auth-screen-onboarding">
      <section className="auth-showcase">
        <div className="auth-showcase-orb auth-showcase-orb-a" />
        <div className="auth-showcase-orb auth-showcase-orb-b" />
        <div className="auth-showcase-inner">
          <div className="auth-showcase-brand-mark">PG</div>
          <h2 className="auth-showcase-brand">Set up your workspace</h2>
          <p className="auth-showcase-copy">Personalize PinGuru so your first automation starts with the right templates and reporting.</p>

          <div className="auth-feature-stack">
            <div className="auth-feature-item"><span><MessageCircle size={18} /></span><p>Templates tuned to your business type</p></div>
            <div className="auth-feature-item"><span><BarChart3 size={18} /></span><p>Dashboard metrics tailored from day one</p></div>
          </div>
        </div>
      </section>

      <section className="auth-pane">
        <div className="auth-panel auth-onboarding-panel">
          <div className="auth-panel-brand auth-card-brand" aria-label="PinGuru">
            <div className="auth-panel-brand-mark">PG</div>
            <span>PinGuru</span>
          </div>

          <div className="onboarding-steps" aria-label="Onboarding progress">
            {steps.map((_, i) => (
              <div key={i} className={`onboarding-step-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
            ))}
          </div>

          {step === 0 && (
            <div className="auth-step-section">
              <div className="auth-icon-tile">
                <User size={22} />
              </div>
              <h1 className="auth-panel-title auth-centered-title">What's your name?</h1>
              <p className="auth-panel-subtitle auth-centered-subtitle">This will appear in your PinGuru profile.</p>

              {error && <div className="auth-alert error auth-alert-spaced">{error}</div>}

              <div className="auth-panel-form">
                <div className="form-group">
                  <label className="form-label">First Name <span className="text-danger">*</span></label>
                  <input
                    type="text" className="form-input" placeholder="e.g. Sarah"
                    value={firstName} onChange={e => setFirstName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleNext()}
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text" className="form-input" placeholder="e.g. Johnson"
                    value={lastName} onChange={e => setLastName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleNext()}
                  />
                </div>
                <button onClick={handleNext} className="auth-gradient-btn">
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="auth-step-section">
              <div className="auth-icon-tile">
                <Briefcase size={22} />
              </div>
              <h1 className="auth-panel-title auth-centered-title">Your business type?</h1>
              <p className="auth-panel-subtitle auth-centered-subtitle">Helps us tailor automation templates for you.</p>

              {error && <div className="auth-alert error auth-alert-spaced">{error}</div>}

              <div className="auth-panel-form">
                <div className="form-group">
                  <label className="form-label">Business Category <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                  >
                    <option value="">Select your category...</option>
                    {BUSINESS_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="auth-actions-row">
                  <button onClick={() => setStep(0)} className="auth-secondary-btn">
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="auth-gradient-btn"
                  >
                    {loading ? (
                      <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving...</>
                    ) : <>Finish setup <ArrowRight size={16} /></>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="auth-step-section auth-success-state">
              <div className="auth-success-tile">
                <CheckCircle size={32} />
              </div>
              <h1 className="auth-panel-title auth-centered-title">You're all set, {firstName}!</h1>
              <p className="auth-panel-subtitle auth-centered-subtitle">Taking you to your dashboard...</p>
              <div className="auth-loading-row">
                <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default OnboardingPage;