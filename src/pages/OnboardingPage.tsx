import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, ArrowRight, CheckCircle } from 'lucide-react';
import { updateOnboarding, requireAuth } from '../lib/api';
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

  useEffect(() => {
    requireAuth().then(ok => { if (!ok) navigate('/login'); });
  }, [navigate]);

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
      setTimeout(() => navigate('/connect?autostart=1'), 1800);
    } catch (err: any) {
      setError(err.message || 'Setup failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card" style={{ maxWidth: 460 }}>
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="auth-logo-mark">PG</div>
          <span className="font-display font-bold text-lg text-slate-900">PinGuru</span>
        </div>

        {/* Step dots */}
        <div className="onboarding-steps">
          {steps.map((_, i) => (
            <div key={i} className={`onboarding-step-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
          ))}
        </div>

        {/* Step 0 — Name */}
        {step === 0 && (
          <div className="animate-[fadeIn_0.2s_ease-out]">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                <User size={22} className="text-primary" />
              </div>
            </div>
            <h1 className="auth-title">What's your name?</h1>
            <p className="auth-subtitle">This will appear in your PinGuru profile</p>

            {error && <div className="auth-alert error my-4 text-sm">{error}</div>}

            <div className="auth-form mt-6">
              <div className="form-group">
                <label className="form-label">First Name <span className="text-danger">*</span></label>
                <input
                  type="text" className="form-input" placeholder="Ajay"
                  value={firstName} onChange={e => setFirstName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNext()}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text" className="form-input" placeholder="Somala"
                  value={lastName} onChange={e => setLastName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNext()}
                />
              </div>
              <button
                onClick={handleNext}
                className="w-full mt-2 bg-primary text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 1 — Business category */}
        {step === 1 && (
          <div className="animate-[fadeIn_0.2s_ease-out]">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Briefcase size={22} className="text-primary" />
              </div>
            </div>
            <h1 className="auth-title">Your business type?</h1>
            <p className="auth-subtitle">Helps us tailor automation templates for you</p>

            {error && <div className="auth-alert error my-4 text-sm">{error}</div>}

            <div className="auth-form mt-6">
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

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setStep(0)}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-[2] bg-primary text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving...</>
                  ) : <>Finish setup <ArrowRight size={16} /></>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Done */}
        {step === 2 && (
          <div className="text-center animate-[fadeIn_0.2s_ease-out]">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle size={32} className="text-success" />
              </div>
            </div>
            <h1 className="auth-title">You're all set, {firstName}!</h1>
            <p className="auth-subtitle">Taking you to your dashboard...</p>
            <div className="mt-6 flex justify-center">
              <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
