import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, CreditCard, ExternalLink, AlertCircle } from 'lucide-react';
import { getProfile, createCheckoutSession, getCustomerPortalUrl, requireAuth } from '../lib/api';
import type { User } from '../lib/types';
import { Badge } from '../components/ui/Badge';
import '../styles/dashboard.css';
import '../styles/billing.css';

interface PlanDef {
  id: 'free' | 'starter' | 'pro';
  name: string;
  priceInr: number;
  period: string;
  description: string;
  dmLimit: string;
  ruleLimit: string;
  features: string[];
  popular?: boolean;
  stripePlanId?: string;
}

const PLANS: PlanDef[] = [
  {
    id: 'free', name: 'Free', priceInr: 0, period: 'forever',
    description: 'Perfect for testing automation',
    dmLimit: '200 DMs/month', ruleLimit: '1 automation rule',
    features: ['1 automation rule', '200 DMs per month', 'Basic analytics', 'Email support', 'Meta webhook integration'],
  },
  {
    id: 'starter', name: 'Starter', priceInr: 199, period: '/month',
    description: 'For growing creators & businesses',
    dmLimit: '1,000 DMs/month', ruleLimit: '5 automation rules',
    features: ['5 automation rules', '1,000 DMs per month', 'Full analytics suite', 'Priority email support', 'Custom response templates', 'Performance tracking'],
    popular: true,
    stripePlanId: 'starter_monthly',
  },
  {
    id: 'pro', name: 'Pro', priceInr: 399, period: '/month',
    description: 'Scale your automation',
    dmLimit: '5,000 DMs/month', ruleLimit: 'Unlimited rules',
    features: ['Unlimited automation rules', '5,000 DMs per month', 'Advanced analytics', '24/7 priority support', 'Multi-account management', 'Advanced API access', 'Dedicated account manager'],
    stripePlanId: 'pro_monthly',
  },
];

const BillingPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser]             = useState<User | null>(null);
  const [loading, setLoading]       = useState(true);
  const [upgrading, setUpgrading]   = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    requireAuth().then(ok => { if (!ok) navigate('/login'); });
    getProfile().then(p => setUser(p)).finally(() => setLoading(false));
  }, [navigate]);

  const currentPlan = user?.plan ?? 'free';

  const handleUpgrade = async (plan: PlanDef) => {
    if (!plan.stripePlanId) return;
    setUpgrading(plan.id); setError('');
    try {
      const { checkout_url } = await createCheckoutSession(plan.stripePlanId);
      window.location.href = checkout_url;
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout. Please try again.');
    } finally { setUpgrading(null); }
  };

  const handleManagePortal = async () => {
    setPortalLoading(true); setError('');
    try {
      const { portal_url } = await getCustomerPortalUrl();
      window.open(portal_url, '_blank');
    } catch (err: any) {
      setError(err.message || 'Failed to open billing portal.');
    } finally { setPortalLoading(false); }
  };

  const isCurrent = (planId: string) => planId === currentPlan;
  const isUpgrade = (planId: string) => {
    const order = { free: 0, starter: 1, pro: 2 };
    return (order[planId as keyof typeof order] ?? 0) > (order[currentPlan as keyof typeof order] ?? 0);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Billing & Plans</h1>
        <p className="page-subtitle">Manage your subscription and usage limits</p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 mb-6 text-sm">
          <AlertCircle size={15} className="flex-shrink-0"/>
          <span>{error}</span>
        </div>
      )}

      {/* Current plan banner */}
      {!loading && currentPlan !== 'free' && (
        <div className="billing-info-card mb-6">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <CreditCard size={17} className="text-primary"/>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800">
              You're on the <span className="text-primary">{PLANS.find(p => p.id === currentPlan)?.name}</span> plan
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Manage invoices, update payment method, or cancel anytime.</p>
          </div>
          <button
            onClick={handleManagePortal}
            disabled={portalLoading}
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-white border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
          >
            {portalLoading ? (
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            ) : <ExternalLink size={12}/>}
            Manage
          </button>
        </div>
      )}

      {/* Plans grid */}
      <div className="billing-grid">
        {PLANS.map(plan => (
          <div
            key={plan.id}
            className={`plan-card ${plan.popular && !isCurrent(plan.id) ? 'popular' : ''} ${isCurrent(plan.id) ? 'current' : ''}`}
          >
            {/* Badge */}
            {isCurrent(plan.id) && (
              <div className="plan-badge current-badge">Current Plan</div>
            )}
            {plan.popular && !isCurrent(plan.id) && (
              <div className="plan-badge">Most Popular</div>
            )}

            <div className="plan-name">{plan.name}</div>
            <div className="plan-description">{plan.description}</div>

            {/* Price */}
            <div className="plan-price">
              {plan.priceInr === 0 ? (
                <>
                  <span className="plan-price-amount">₹0</span>
                  <span className="plan-price-period">forever</span>
                </>
              ) : (
                <>
                  <span className="plan-price-currency">₹</span>
                  <span className="plan-price-amount">{plan.priceInr}</span>
                  <span className="plan-price-period">/mo</span>
                </>
              )}
            </div>

            {/* Limits highlight */}
            <div className="flex flex-col gap-1.5 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Zap size={13} className="text-primary flex-shrink-0"/>
                <span className="font-medium text-slate-700">{plan.ruleLimit}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard size={13} className="text-slate-400 flex-shrink-0"/>
                <span className="text-slate-600">{plan.dmLimit}</span>
              </div>
            </div>

            <div className="plan-divider"/>

            {/* Features */}
            <ul className="plan-features">
              {plan.features.map(f => (
                <li key={f} className="plan-feature">
                  <div className="plan-feature-check">
                    <Check size={10}/>
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            {isCurrent(plan.id) ? (
              <button disabled className="w-full py-2.5 text-sm font-semibold text-slate-400 bg-slate-100 rounded-xl cursor-not-allowed">
                Current Plan
              </button>
            ) : isUpgrade(plan.id) ? (
              <button
                onClick={() => handleUpgrade(plan)}
                disabled={!!upgrading}
                className="w-full py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {upgrading === plan.id ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Redirecting…</>
                ) : `Upgrade to ${plan.name}`}
              </button>
            ) : (
              <button
                onClick={handleManagePortal}
                className="w-full py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Downgrade
              </button>
            )}
          </div>
        ))}
      </div>

      {/* All plans include */}
      <div className="mt-8 p-5 bg-slate-50 border border-slate-200 rounded-xl">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">All plans include</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            '24-hour messaging window compliance',
            '200 messages/hour rate limiting',
            'Meta webhook integration',
            'Real-time analytics',
          ].map(f => (
            <div key={f} className="flex items-center gap-1.5 text-xs text-slate-600">
              <Check size={12} className="text-success flex-shrink-0"/>
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
