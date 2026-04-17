import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCheckoutSession, getCustomerPortalUrl } from '../src/lib/api';

type Plan = 'free' | 'starter' | 'pro';

const mkRes = (ok: boolean, data: unknown) => ({
  ok,
  status: ok ? 200 : 400,
  json: async () => data,
}) as Response;

describe('billing api integration (mocked)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('free user can request starter and pro checkout', async () => {
    let currentPlan: Plan = 'free';

    vi.stubGlobal('fetch', vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      if (String(_url).includes('/billing/create-checkout')) {
        const body = JSON.parse(String(init?.body ?? '{}')) as { plan?: string };
        const requestedPlan = String(body.plan ?? '').startsWith('pro') ? 'pro' : 'starter';
        const allowed = (currentPlan === 'free' && (requestedPlan === 'starter' || requestedPlan === 'pro')) ||
          (currentPlan === 'starter' && requestedPlan === 'pro');

        if (!allowed) {
          return mkRes(false, { detail: 'Only upgrades are allowed' });
        }

        currentPlan = requestedPlan;
        return mkRes(true, { checkout_url: `https://stripe.test/checkout?plan=${body.plan}` });
      }

      if (String(_url).includes('/billing/portal')) {
        return mkRes(true, { portal_url: 'https://stripe.test/portal' });
      }

      return mkRes(false, { detail: 'Unknown route' });
    }));

    const starter = await createCheckoutSession('starter_monthly');
    expect(starter.checkout_url).toContain('starter_monthly');

    currentPlan = 'free';
    const pro = await createCheckoutSession('pro_monthly');
    expect(pro.checkout_url).toContain('pro_monthly');
  });

  it('starter user cannot request starter again', async () => {
    const currentPlan: Plan = 'starter';

    vi.stubGlobal('fetch', vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      if (!String(_url).includes('/billing/create-checkout')) {
        return mkRes(false, { detail: 'Unknown route' });
      }

      const body = JSON.parse(String(init?.body ?? '{}')) as { plan?: string };
      const requestedPlan = String(body.plan ?? '').startsWith('pro') ? 'pro' : 'starter';

      const allowed = (currentPlan === 'free' && (requestedPlan === 'starter' || requestedPlan === 'pro')) ||
        (currentPlan === 'starter' && requestedPlan === 'pro');

      if (!allowed) {
        return mkRes(false, { detail: 'Only upgrades are allowed' });
      }

      return mkRes(true, { checkout_url: `https://stripe.test/checkout?plan=${body.plan}` });
    }));

    await expect(createCheckoutSession('starter_monthly')).rejects.toThrow('Only upgrades are allowed');
  });

  it('portal call returns portal_url', async () => {
    vi.stubGlobal('fetch', vi.fn(async (_url: RequestInfo | URL) => {
      if (String(_url).includes('/billing/portal')) {
        return mkRes(true, { portal_url: 'https://stripe.test/portal' });
      }
      return mkRes(false, { detail: 'Unknown route' });
    }));

    const result = await getCustomerPortalUrl();
    expect(result.portal_url).toBe('https://stripe.test/portal');
  });
});
