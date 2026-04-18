import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Zap, Users, CreditCard, ExternalLink, AlertCircle, MessageSquare } from 'lucide-react';
import { createPlanCheckout, getCustomerPortalUrl, getPlanStatus, requireAuth } from '../lib/api';
import type { PlanStatus } from '../lib/types';
import '../styles/dashboard.css';
import '../styles/billing.css';

interface PlanDef {
  id: 'free' | 'starter' | 'pro';
  name: string;
  description: string;
  monthlyPrice: number;
  features: string[];
  highlight: { rules: string; dms: string; contacts: string };
  popular?: boolean;
}

type StatusBannerKind = 'processing' | 'success' | 'timeout';

interface StatusBanner {
  kind: StatusBannerKind;
  message: string;
}

const PLANS: PlanDef[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    highlight: { rules: '5 automation flows', dms: 'Unlimited DMs', contacts: '500 contacts/mo' },
    features: [
      '5 automation flows',
      'Unlimited DMs',
      '500 monthly contacts',
      'Basic analytics',
      'Email support',
      'Meta webhook integration',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For growing creators & businesses',
    monthlyPrice: 199,
    highlight: { rules: '15 automation flows', dms: 'Unlimited DMs', contacts: 'Unlimited contacts' },
    features: [
      '15 automation flows',
      'Unlimited DMs',
      'Unlimited contacts',
      'Premium analytics',
      'Priority email support',
      'Custom response templates',
      'Performance tracking',
    ],
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For agencies & power users',
    monthlyPrice: 499,
    highlight: { rules: 'Unlimited flows', dms: 'Unlimited DMs', contacts: 'Unlimited contacts' },
    features: [
      'Unlimited automation flows',
      'Unlimited DMs',
      'Unlimited contacts',
      'Premium analytics',
      'Dedicated email support',
      'Custom response templates',
      'Remove "Powered by PinGuru"',
    ],
  },
];

function getCheckoutErrorMessage(status?: number, fallback?: string): string {
  if (status === 400) return 'Cannot checkout free plan. Only upgrades are allowed.';
  if (status === 409) return 'A checkout is already pending confirmation.';
  if (status === 503) return 'Payments temporarily unavailable. The selected plan is not configured right now.';
  if (status === 502) return 'Failed to create payment session. Please try again in a moment.';
  return fallback || 'Failed to start checkout. Please try again.';
}

function formatProvider(provider: string | null | undefined): string {
  if (!provider) return 'Unknown';
  if (provider.toLowerCase() === 'razorpay') return 'Razorpay';
  return provider;
}

const BillingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<'starter' | 'pro' | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState('');
  const [banner, setBanner] = useState<StatusBanner | null>(null);

  const hasProcessingParam = searchParams.get('payment') === 'processing';

  const fetchStatus = useCallback(async (): Promise<PlanStatus> => {
    const status = await getPlanStatus();
    setPlanStatus(status);
    return status;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const ok = await requireAuth();
        if (!ok) {
          navigate('/login');
          return;
        }
        if (!cancelled) {
          await fetchStatus();
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Failed to load billing status.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [fetchStatus, navigate]);

  useEffect(() => {
    if (!planStatus) return;

    const shouldPoll = hasProcessingParam || planStatus.is_checkout_pending;
    if (!shouldPoll) return;

    let active = true;
    let elapsed = 0;
    const intervalMs = 4000;
    const timeoutMs = 90000;

    setBanner({ kind: 'processing', message: 'Processing payment. Waiting for Razorpay confirmation...' });

    const poll = async () => {
      if (!active) return;
      elapsed += intervalMs;

      try {
        const latest = await fetchStatus();
        const paidActivated = latest.is_active_paid && (latest.current_plan === 'starter' || latest.current_plan === 'pro');

        if (paidActivated) {
          setBanner({ kind: 'success', message: `Payment confirmed. Your ${latest.current_plan} plan is now active.` });
          active = false;
          return;
        }

        if (elapsed >= timeoutMs) {
          setBanner({ kind: 'timeout', message: 'Payment is still processing. Please refresh again in a few minutes.' });
          active = false;
        }
      } catch {
        if (elapsed >= timeoutMs) {
          setBanner({ kind: 'timeout', message: 'Payment status check timed out. Please refresh again in a few minutes.' });
          active = false;
        }
      }
    };

    const id = window.setInterval(() => {
      void poll();
    }, intervalMs);

    void poll();

    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [fetchStatus, hasProcessingParam, planStatus]);

  const currentPlan = planStatus?.current_plan ?? 'free';
  const pendingPlan = planStatus?.pending_plan;

  const isCurrent = (planId: PlanDef['id']) => planId === currentPlan;

  const isUpgrade = useMemo(() => {
    const order = { free: 0, starter: 1, pro: 2 };
    return (planId: PlanDef['id']) => {
      return (order[planId] ?? 0) > (order[currentPlan] ?? 0);
    };
  }, [currentPlan]);

  const handleUpgrade = async (plan: PlanDef) => {
    if (plan.id === 'free') {
      setError('Cannot checkout free plan. Only upgrades are allowed.');
      return;
    }
    if (planStatus?.is_checkout_pending) {
      setError('A checkout is already pending confirmation. Please wait for it to complete.');
      return;
    }

    setUpgrading(plan.id);
    setError('');

    try {
      const { checkout_url } = await createPlanCheckout(plan.id);
      window.location.href = checkout_url;
    } catch (err: any) {
      setError(getCheckoutErrorMessage(err?.status, err?.message));
    } finally {
      setUpgrading(null);
    }
  };

  const handleManagePortal = async () => {
    setPortalLoading(true);
    setError('');
    try {
      const { portal_url } = await getCustomerPortalUrl();
      window.open(portal_url, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      setError(err?.message || 'Failed to open billing portal.');
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Billing & Plans</h1>
        <p className="page-subtitle">Manage your subscription and usage limits</p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 mb-6 text-sm">
          <AlertCircle size={15} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {banner && (
        <div className={`flex items-center gap-2.5 rounded-xl px-4 py-3 mb-6 text-sm border ${
          banner.kind === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : banner.kind === 'processing'
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
              : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          {banner.kind === 'success' ? <Check size={15} className="flex-shrink-0" /> : <AlertCircle size={15} className="flex-shrink-0" />}
          <span>{banner.message}</span>
        </div>
      )}

      {/* Current plan + backend status */}
      {!loading && planStatus && (
        <div className="billing-info-card mb-6">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <CreditCard size={17} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800">
              Current plan: <span className="text-primary capitalize">{planStatus.current_plan}</span>
              {planStatus.pending_plan && <span className="text-amber-700"> · Pending: {planStatus.pending_plan}</span>}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Provider: {formatProvider(planStatus.payment_provider)} · Subscription: {planStatus.subscription_id || 'none'} · Paid active: {planStatus.is_active_paid ? 'yes' : 'no'}
            </p>
          </div>
          <button
            onClick={handleManagePortal}
            disabled={portalLoading}
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-white border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
          >
            {portalLoading ? (
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            ) : <ExternalLink size={12} />}
            Manage
          </button>
        </div>
      )}

      {/* Plans grid */}
      <div className="billing-grid">
        {PLANS.map(plan => {
          return (
            <div
              key={plan.id}
              className={`plan-card ${plan.popular && !isCurrent(plan.id) ? 'popular' : ''} ${isCurrent(plan.id) ? 'current' : ''}`}
            >
              {isCurrent(plan.id) && <div className="plan-badge current-badge">Current Plan</div>}
              {plan.popular && !isCurrent(plan.id) && <div className="plan-badge">Most Popular</div>}
              {pendingPlan === plan.id && <div className="plan-badge" style={{ top: 42, background: '#f59e0b' }}>Pending Confirmation</div>}

              <div className="plan-name">{plan.name}</div>
              <div className="plan-description">{plan.description}</div>

              <div className="plan-price">
                {plan.monthlyPrice === 0 ? (
                  <>
                    <span className="plan-price-amount">₹0</span>
                    <span className="plan-price-period">forever</span>
                  </>
                ) : (
                  <div className="flex items-end gap-1">
                    <span className="plan-price-currency">₹</span>
                    <span className="plan-price-amount">{plan.monthlyPrice}</span>
                    <span className="plan-price-period">/mo</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Zap size={13} className="text-primary flex-shrink-0" />
                  <span className="font-medium text-slate-700">{plan.highlight.rules}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MessageSquare size={13} className="text-slate-400 flex-shrink-0" />
                  <span className="text-slate-600">{plan.highlight.dms}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users size={13} className="text-slate-400 flex-shrink-0" />
                  <span className="text-slate-600">{plan.highlight.contacts}</span>
                </div>
              </div>

              <div className="plan-divider" />

              <ul className="plan-features">
                {plan.features.map(f => (
                  <li key={f} className="plan-feature">
                    <div className="plan-feature-check"><Check size={10} /></div>
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent(plan.id) ? (
                <button disabled className="w-full py-2.5 text-sm font-semibold text-slate-400 bg-slate-100 rounded-xl cursor-not-allowed">
                  Current Plan
                </button>
              ) : isUpgrade(plan.id) ? (
                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={!!upgrading || planStatus?.is_checkout_pending}
                  className="w-full py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {upgrading === plan.id ? (
                    <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Redirecting...</>
                  ) : planStatus?.is_checkout_pending ? 'Checkout Pending' : `Upgrade to ${plan.name}`}
                </button>
              ) : (
                <button
                  onClick={handleManagePortal}
                  className="w-full py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Manage in Portal
                </button>
              )}
            </div>
          );
        })}
      </div>

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
              <Check size={12} className="text-success flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
