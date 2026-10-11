import type { SEOProps } from '../components/SEO';

type RouteSEO = Omit<SEOProps, 'path'>;

const DEFAULT_DESCRIPTION =
  'Automate Instagram DMs for keywords, comments and story mentions. Meta-compliant, built for Indian creators and brands. Free plan available.';

/** Per-route head tags. /blog/:slug pages set their own via <SEO>. */
export const ROUTE_SEO: Record<string, RouteSEO> = {
  '/': {
    title: 'PinGuru – Instagram DM Automation & Growth Suite',
    description: DEFAULT_DESCRIPTION,
  },
  '/login': { title: 'Sign in · PinGuru', description: 'Sign in to your PinGuru workspace to manage Instagram DM automations.' },
  '/register': { title: 'Create account · PinGuru', description: 'Create a free PinGuru account and launch your first Instagram DM automation in minutes.' },
  '/auth': { title: 'Authentication · PinGuru', description: 'Sign in or create your PinGuru account.', noindex: true },
  '/verify': { title: 'Verify email · PinGuru', description: 'Verify your email address to activate your PinGuru account.', noindex: true },
  '/forgot-password': { title: 'Reset password · PinGuru', description: 'Reset the password for your PinGuru account.', noindex: true },
  '/blog': { title: 'Blog · PinGuru', description: 'Guides and strategies for Instagram DM automation, keyword triggers, story mentions and Meta policy compliance.' },
  '/support': { title: 'Support · PinGuru', description: 'Get help with PinGuru: contact support, response times, and answers to common questions.' },
  '/contact': { title: 'Contact · PinGuru', description: 'Contact PinGuru support, see response times, and reach our grievance officer.' },
  '/privacy': { title: 'Privacy Policy · PinGuru', description: 'What data PinGuru collects, why, which processors we use, how long we keep it, and your rights.' },
  '/terms': { title: 'Terms of Service · PinGuru', description: 'The terms that govern your use of PinGuru, including plans, billing and acceptable use.' },
  '/cookies': { title: 'Cookie Policy · PinGuru', description: 'How PinGuru uses cookies and browser storage, and how to control them.' },
  '/refund-policy': { title: 'Refund Policy · PinGuru', description: 'When PinGuru subscriptions are eligible for a refund and how to request one.' },
  '/data-deletion': { title: 'Data Deletion · PinGuru', description: 'How to delete your PinGuru account and data, remove the Instagram connection, and what our Meta deletion callback does.' },
  // Signed-in pages: titled, never indexed.
  '/onboarding': { title: 'Welcome · PinGuru', description: DEFAULT_DESCRIPTION, noindex: true },
  '/dashboard': { title: 'Dashboard · PinGuru', description: DEFAULT_DESCRIPTION, noindex: true },
  '/connect': { title: 'Connect Instagram · PinGuru', description: DEFAULT_DESCRIPTION, noindex: true },
  '/connect.html': { title: 'Connect Instagram · PinGuru', description: DEFAULT_DESCRIPTION, noindex: true },
  '/rules': { title: 'Automation Rules · PinGuru', description: DEFAULT_DESCRIPTION, noindex: true },
  '/contacts': { title: 'Contacts · PinGuru', description: DEFAULT_DESCRIPTION, noindex: true },
  '/analytics': { title: 'Analytics · PinGuru', description: DEFAULT_DESCRIPTION, noindex: true },
  '/billing': { title: 'Billing · PinGuru', description: DEFAULT_DESCRIPTION, noindex: true },
  '/settings': { title: 'Settings · PinGuru', description: DEFAULT_DESCRIPTION, noindex: true },
  '/settings/profile': { title: 'Edit profile · PinGuru', description: DEFAULT_DESCRIPTION, noindex: true },
  '/refund': { title: 'Request refund · PinGuru', description: DEFAULT_DESCRIPTION, noindex: true },
};

export const FALLBACK_SEO: RouteSEO = ROUTE_SEO['/'];
