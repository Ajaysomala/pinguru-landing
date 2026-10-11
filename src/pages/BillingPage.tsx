import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Zap, Users, CreditCard, ExternalLink, AlertCircle, MessageSquare, Sparkles, RefreshCw } from 'lucide-react';
import { cancelPendingCheckout, createPlanCheckout, getCustomerPortalUrl, getPlanStatus } from '../lib/api';
import type { PlanStatus } from '../lib/types';
import { sanitizeApiError } from '../lib/utils';
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

type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

const BILLING_CYCLE_META: Record<BillingCycle, { label: string; multiplier: number; discount: number; periodLabel: string; billedEvery: string }> = {
  monthly: { label: 'Monthly', multiplier: 1, discount: 0, periodLabel: '/mo', billedEvery: 'billed monthly' },
  quarterly: { label: 'Quarterly', multiplier: 3, discount: 0.08, periodLabel: '/qtr', billedEvery: 'billed every 3 months' },
  yearly: { label: 'Yearly', multiplier: 12, discount: 0.15, periodLabel: '/yr', billedEvery: 'billed annually' },
};

const PLANS: PlanDef[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    highlight: { rules: '5 automation flows', dms: 'Unlimited DMs', contacts: '500 contacts/mo' },
    features: [
      'Basic analytics',
      'Email support',
      'DM footer: © PinGuru',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For growing creators & businesses',
    monthlyPrice: 199,
    highlight: { rules: '15 automation flows', dms: 'Unlimited DMs', contacts: 'Unlimited contacts' },
    features: [
      'Premium analytics',
      'No DM footer branding',
      'Ask-to-follow before DM delivery',
      'Priority email support (faster queue)',
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
      'Premium analytics',
      '24/7 faster support response',
      'No DM footer branding',
      'Ask-to-follow before DM delivery',
    ],
  },
];

function getCyclePrice(monthlyPrice: number, cycle: BillingCycle): number {
  if (monthlyPrice <= 0) return 0;
  const meta = BILLING_CYCLE_META[cycle];
  const raw = monthlyPrice * meta.multiplier * (1 - meta.discount);
  return Math.round(raw);
}

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

const BILLING_POLL_SUPPRESS_KEY = 'pg_billing_poll_suppressed_until';
const PENDING_SEEN_KEY = 'pg_pending_upgrade_seen';
const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS = 10 * 60 * 1000;
/** The backend expires pending upgrades after 60 minutes. */
const PENDING_EXPIRY_MS = 60 * 60 * 1000;

/** The plan an upgrade is waiting on, or null. Works for free and paid users. */
function getPendingUpgradePlan(status: PlanStatus | null): PlanStatus['pending_plan'] {
  if (!status?.pending_plan || status.pending_plan === status.current_plan) return null;
  // Older backends report is_checkout_pending only for free users, so a paid user's
  // pending upgrade shows up as pending_plan alone.
  return status.is_checkout_pending || status.is_active_paid ? status.pending_plan : null;
}

/** When this browser first saw the pending upgrade (the API sends no start time). */
function getPendingFirstSeen(plan: string): number {
  try {
    const raw = sessionStorage.getItem(PENDING_SEEN_KEY);
    const parsed = raw ? (JSON.parse(raw) as { plan?: string; at?: number }) : null;
    if (parsed?.plan === plan && typeof parsed.at === 'number') return parsed.at;
    const at = Date.now();
    sessionStorage.setItem(PENDING_SEEN_KEY, JSON.stringify({ plan, at }));
    return at;
  } catch {
    return Date.now();
  }
}

function clearPendingFirstSeen() {
  try { sessionStorage.removeItem(PENDING_SEEN_KEY); } catch { /* storage unavailable */ }
}

const PLAN_LABEL: Record<string, string> = { free: 'Free', starter: 'Starter', pro: 'Pro' };

function getBillingPollSuppressedUntil(): number {
  const value = sessionStorage.getItem(BILLING_POLL_SUPPRESS_KEY);
  if (!value) return 0;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();
    if (document.querySelector('script[src*="checkout.razorpay.com"]')) return resolve();
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout'));
    document.body.appendChild(script);
  });
}

const BillingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<'starter' | 'pro' | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState('');
  const [banner, setBanner] = useState<StatusBanner | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [pollingSuppressedUntil, setPollingSuppressedUntil] = useState<number>(() => getBillingPollSuppressedUntil());
  const [pendingExpired, setPendingExpired] = useState(false);

  const hasProcessingParam = searchParams.get('payment') === 'processing';
  const isPollingSuppressed = pollingSuppressedUntil > Date.now();

  const clearPaymentParams = useCallback(() => {
    if (searchParams.has('payment') || searchParams.has('provider')) {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const suppressPolling = useCallback((durationMs: number) => {
    const until = Date.now() + durationMs;
    sessionStorage.setItem(BILLING_POLL_SUPPRESS_KEY, String(until));
    setPollingSuppressedUntil(until);
  }, []);

  const clearPollingSuppression = useCallback(() => {
    sessionStorage.removeItem(BILLING_POLL_SUPPRESS_KEY);
    setPollingSuppressedUntil(0);
  }, []);

  const fetchStatus = useCallback(async (): Promise<PlanStatus> => {
    const status = await getPlanStatus();
    setPlanStatus(status);
    return status;
  }, []);

  const syncStatusAfterReturn = useCallback(async () => {
    try {
      const latest = await fetchStatus();
      if (latest.is_checkout_pending) {
        setBanner({ kind: 'processing', message: 'Processing payment. Waiting for Razorpay confirmation...' });
      }
      if (!latest.is_checkout_pending && !latest.pending_plan) {
        clearPaymentParams();
      }
    } catch {
      // Keep existing UI state if refresh fails; periodic polling and user actions can retry.
    }
  }, [clearPaymentParams, fetchStatus]);

  useEffect(() => {
    const init = async () => {
      try {
        await fetchStatus();
      } catch (err: any) {
        setError(sanitizeApiError(err));
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [fetchStatus]);

  useEffect(() => {
    const onFocus = () => {
      void syncStatusAfterReturn();
    };

    const onPageShow = () => {
      void syncStatusAfterReturn();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void syncStatusAfterReturn();
      }
    };

    window.addEventListener('focus', onFocus);
    window.addEventListener('pageshow', onPageShow);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [syncStatusAfterReturn]);

  const shouldPoll = !isPollingSuppressed && (hasProcessingParam || Boolean(planStatus?.is_checkout_pending));

  useEffect(() => {
    if (!shouldPoll) return;

    let active = true;
    const startedAt = Date.now();
    const intervalMs = POLL_INTERVAL_MS;
    const timeoutMs = POLL_TIMEOUT_MS;

    setBanner({ kind: 'processing', message: 'Processing payment. Waiting for Razorpay confirmation...' });

    const poll = async () => {
      if (!active) return;
      const elapsedMs = Date.now() - startedAt;

      try {
        const latest = await fetchStatus();
        const paidActivated = latest.is_active_paid
          && (latest.current_plan === 'starter' || latest.current_plan === 'pro')
          && !getPendingUpgradePlan(latest)
          && !latest.is_checkout_pending;

        if (paidActivated) {
          setBanner({ kind: 'success', message: `Payment confirmed. Your ${latest.current_plan} plan is now active.` });
          clearPaymentParams();
          clearPollingSuppression();
          active = false;
          return;
        }

        if (elapsedMs >= timeoutMs) {
          setBanner({ kind: 'timeout', message: 'Payment is still processing. We stopped checking automatically after 10 minutes.' });
          clearPaymentParams();
          suppressPolling(10 * 60 * 1000);
          active = false;
        }
      } catch {
        if (elapsedMs >= timeoutMs) {
          setBanner({ kind: 'timeout', message: 'We could not confirm the payment status in 10 minutes.' });
          clearPaymentParams();
          suppressPolling(10 * 60 * 1000);
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
  }, [clearPaymentParams, clearPollingSuppression, fetchStatus, hasProcessingParam, shouldPoll, suppressPolling]);

  const currentPlan = planStatus?.current_plan ?? 'free';
  const pendingPlan = planStatus?.pending_plan;
  const pendingUpgradePlan = getPendingUpgradePlan(planStatus);
  const upgradeNotice = typeof planStatus?.upgrade_notice === 'string' ? planStatus.upgrade_notice.trim() : '';

  // A pending upgrade older than 60 minutes has expired on the backend: refetch and drop the banner.
  const statusLoaded = planStatus !== null;
  useEffect(() => {
    if (!statusLoaded) return; // not loaded yet: keep the stored first-seen time
    if (!pendingUpgradePlan) {
      clearPendingFirstSeen();
      setPendingExpired(false);
      return;
    }
    const remaining = getPendingFirstSeen(pendingUpgradePlan) + PENDING_EXPIRY_MS - Date.now();
    const expire = () => {
      setPendingExpired(true);
      setBanner(null);
      suppressPolling(PENDING_EXPIRY_MS);
      void fetchStatus().catch(() => undefined);
    };
    if (remaining <= 0) {
      expire();
      return;
    }
    const id = window.setTimeout(expire, remaining);
    return () => window.clearTimeout(id);
  }, [fetchStatus, statusLoaded, pendingUpgradePlan, suppressPolling]);

  const handleRetryStatus = () => {
    setBanner(null);
    clearPollingSuppression();
    void syncStatusAfterReturn();
  };

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
    if (planStatus?.is_checkout_pending || pendingUpgradePlan) {
      setError('An upgrade is already pending. Cancel it first to choose a different plan.');
      return;
    }

    setUpgrading(plan.id);
    setError('');

    try {
      const session = await createPlanCheckout(plan.id, billingCycle);

      if (session.subscription_id && session.key_id && typeof window !== 'undefined') {
        await loadRazorpayScript();
        const razorpayCtor = (window as Window & { Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, callback: (response: Record<string, unknown>) => void) => void } }).Razorpay;
        if (razorpayCtor) {
          const rzp = new razorpayCtor({
            key: session.key_id,
            subscription_id: session.subscription_id,
            name: 'PinGuru',
            description: `${plan.name} Plan (${billingCycle})`,
            prefill: { email: session.prefill_email },
            theme: { color: '#7C3AED' },
            handler: () => {
              setBanner({ kind: 'processing', message: 'Payment received. Activating your plan...' });
              navigate('/billing?payment=processing&provider=razorpay', { replace: true });
            },
            modal: {
              ondismiss: () => {
                setError('Payment was cancelled. You can try again anytime.');
                void syncStatusAfterReturn();
              },
            },
          });

          rzp.on('payment.failed', (response: Record<string, unknown>) => {
            const description = typeof response?.error === 'object' && response.error && 'description' in response.error ? String((response.error as { description?: string }).description) : '';
            setError(`Payment failed: ${description || 'Please try again.'}`);
          });

          rzp.open();
          return;
        }
      }

      if (!session.checkout_url) {
        setError('Payment session is missing a checkout URL. Please try again.');
        return;
      }

      window.location.href = session.checkout_url;
    } catch (err: unknown) {
      setError(getCheckoutErrorMessage((err as { status?: number })?.status, sanitizeApiError(err)));
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
      setError(sanitizeApiError(err, 'Failed to open billing portal.'));
    } finally {
      setPortalLoading(false);
    }
  };

  const handleCancelPending = async () => {
    setCancelLoading(true);
    setError('');
    try {
      await cancelPendingCheckout();
      clearPendingFirstSeen();
      const latest = await fetchStatus();
      setPlanStatus(latest);
      clearPaymentParams();
      clearPollingSuppression();
      setBanner({ kind: 'success', message: 'Pending upgrade cancelled. Your current plan is unchanged.' });
    } catch (err: any) {
      setError(sanitizeApiError(err, 'Failed to cancel pending checkout.'));
    } finally {
      setCancelLoading(false);
    }
  };

  const bannerClass = banner
    ? banner.kind === 'success'
      ? 'billing-v6-banner success'
      : banner.kind === 'processing'
        ? 'billing-v6-banner processing'
        : 'billing-v6-banner timeout'
    : '';

  return (
    <div className="page-wrapper billing-v6-page">
      <section className="pg-surface-hero billing-v6-header">
        <div>
          <p className="pg-surface-kicker"><Sparkles size={12} /> Premium Growth Plans</p>
          <h1 className="pg-surface-title">Billing &amp; Plans</h1>
          <p className="pg-surface-subtitle">Choose your plan, manage subscription status, and unlock the workflows that match your growth stage.</p>
        </div>
      </section>

      {error && (
        <div className="billing-v6-error">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {banner && (
        <div className={bannerClass} role="status" aria-live="polite">
          {banner.kind === 'success' ? <Check size={15} /> : <AlertCircle size={15} />}
          <span>{banner.message}</span>
          {banner.kind === 'timeout' && isPollingSuppressed && (
            <button type="button" onClick={handleRetryStatus} className="billing-v6-info-btn">
              <RefreshCw size={12} aria-hidden="true" /> Check again
            </button>
          )}
        </div>
      )}

      {loading && (
        <div className="billing-info-card billing-v6-info-card" aria-busy="true">
          <p className="meta">Loading your plan…</p>
        </div>
      )}

      {!loading && !planStatus && (
        <div className="billing-info-card billing-v6-info-card">
          <p className="meta">We could not load your current plan.</p>
          <button type="button" onClick={() => { setLoading(true); setError(''); void fetchStatus().catch((err: unknown) => setError(sanitizeApiError(err))).finally(() => setLoading(false)); }} className="billing-v6-info-btn">
            <RefreshCw size={12} aria-hidden="true" /> Retry
          </button>
        </div>
      )}

      {!loading && pendingUpgradePlan && (
        <div className="billing-info-card billing-v6-info-card billing-v6-pending" role="status">
          <div className="billing-v6-info-copy">
            <p className="headline">Upgrade to {PLAN_LABEL[pendingUpgradePlan] ?? pendingUpgradePlan} pending</p>
            <p className="meta">
              {pendingExpired
                ? 'This upgrade request is more than 60 minutes old and has expired. Cancel it to start a new one.'
                : `Your ${PLAN_LABEL[currentPlan] ?? currentPlan} plan stays active until the payment is confirmed.`}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCancelPending}
            disabled={cancelLoading}
            className="billing-v6-info-btn danger"
          >
            {cancelLoading ? 'Cancelling…' : 'Cancel upgrade'}
          </button>
        </div>
      )}

      {/* Current plan + backend status */}
      {!loading && planStatus && (
        <div className="billing-info-card billing-v6-info-card">
          <div className="billing-v6-info-icon">
            <CreditCard size={18} />
          </div>
          <div className="billing-v6-info-copy">
            <p className="eyebrow">Active subscription</p>
            <p className="headline">
              <span className="plan">{planStatus.current_plan}</span>
              <span> · {planStatus.current_billing_cycle || 'monthly'}</span>
              {planStatus.pending_plan && <span className="pending"> · Pending: {planStatus.pending_plan}</span>}
            </p>
            <p className="meta">
              Provider: {formatProvider(planStatus.payment_provider)} · Subscription: {planStatus.subscription_id || 'none'}
              {planStatus.pending_billing_cycle ? ` · Pending cycle: ${planStatus.pending_billing_cycle}` : ''}
            </p>
          </div>
          <button
            onClick={handleManagePortal}
            disabled={portalLoading}
            className="billing-v6-info-btn"
          >
            {portalLoading ? (
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            ) : <ExternalLink size={12} />}
            Manage
          </button>
        </div>
      )}

      {upgradeNotice && (
        <div className="billing-v6-banner processing" role="note">
          <AlertCircle size={15} />
          <span>{upgradeNotice}</span>
        </div>
      )}

      <div className="billing-v6-cycle-switch">
        {(Object.keys(BILLING_CYCLE_META) as BillingCycle[]).map((cycle) => (
          <button
            key={cycle}
            type="button"
            onClick={() => setBillingCycle(cycle)}
            className={billingCycle === cycle ? 'active' : ''}
          >
            {BILLING_CYCLE_META[cycle].label}
          </button>
        ))}
      </div>

      {/* Plans grid */}
      <div className="billing-grid">
        {PLANS.map(plan => {
          const cyclePrice = getCyclePrice(plan.monthlyPrice, billingCycle);
          const cycleMeta = BILLING_CYCLE_META[billingCycle];
          return (
            <div
              key={plan.id}
              className={`plan-card ${plan.popular && !isCurrent(plan.id) ? 'popular' : ''} ${isCurrent(plan.id) ? 'current' : ''}`}
            >
              {isCurrent(plan.id) && <div className="plan-badge current-badge">Current Plan</div>}
              {plan.popular && !isCurrent(plan.id) && <div className="plan-badge">Most Popular</div>}
              {pendingPlan === plan.id && <div className="plan-badge plan-badge-pending">Pending Confirmation</div>}

              <div className="plan-name">{plan.name}</div>
              <div className="plan-description">{plan.description}</div>

              <div className="plan-price">
                {plan.monthlyPrice === 0 ? (
                  <>
                    <span className="plan-price-amount">₹0</span>
                    <span className="plan-price-period">forever</span>
                  </>
                ) : (
                  <div className="flex flex-col">
                    <div className="flex items-end gap-1">
                      <span className="plan-price-currency">₹</span>
                      <span className="plan-price-amount">{cyclePrice}</span>
                      <span className="plan-price-period">{cycleMeta.periodLabel}</span>
                    </div>
                    <span className="billing-v6-price-note">{cycleMeta.billedEvery}</span>
                    {billingCycle !== 'monthly' && cycleMeta.discount > 0 && <span className="billing-v6-savings-note">Save {Math.round(cycleMeta.discount * 100)}% vs monthly</span>}
                  </div>
                )}
              </div>

              <div className="billing-v6-highlight-list">
                <div className="billing-v6-highlight-item primary">
                  <Zap size={13} />
                  <span>{plan.highlight.rules}</span>
                </div>
                <div className="billing-v6-highlight-item">
                  <MessageSquare size={13} />
                  <span>{plan.highlight.dms}</span>
                </div>
                <div className="billing-v6-highlight-item">
                  <Users size={13} />
                  <span>{plan.highlight.contacts}</span>
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
                <button disabled className="billing-v6-plan-btn disabled">
                  Current Plan
                </button>
              ) : isUpgrade(plan.id) ? (
                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={!!upgrading || planStatus?.is_checkout_pending || Boolean(pendingUpgradePlan)}
                  className="billing-v6-plan-btn primary"
                >
                  {upgrading === plan.id ? (
                    <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Redirecting...</>
                  ) : planStatus?.is_checkout_pending || pendingUpgradePlan ? 'Upgrade pending' : `Upgrade to ${plan.name} (${cycleMeta.label})`}
                </button>
              ) : (
                <button
                  onClick={handleManagePortal}
                  className="billing-v6-plan-btn secondary"
                >
                  Manage in Portal
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="billing-v6-common">
        <p className="title">All plans include</p>
        <div className="billing-v6-common-grid">
          {[
            '24-hour messaging window compliance',
            '200 messages/hour rate limiting',
            'Meta webhook integration',
            'Real-time analytics',
          ].map(f => (
            <div key={f} className="billing-v6-common-item">
              <Check size={12} />
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
