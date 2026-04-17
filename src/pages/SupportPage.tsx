import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, LifeBuoy, ExternalLink, ArrowRight, ShieldCheck, Clock3 } from 'lucide-react';

const SUPPORT_EMAIL = 'support@pinguru.me';

const faqs = [
  {
    q: 'How fast can I get help?',
    a: 'We typically respond within 24 hours on weekdays. Billing and account access issues are prioritized.',
  },
  {
    q: 'What should I include in a support request?',
    a: 'Share your account email, Instagram handle, issue summary, and screenshots if possible. This helps us resolve issues much faster.',
  },
  {
    q: 'Can you help with DM automation setup?',
    a: 'Yes. We can guide rule setup, trigger mapping, and response templates while staying within Meta policy limits.',
  },
  {
    q: 'How do I request data deletion?',
    a: 'Open Settings > Data & Privacy and submit a deletion request. You can also email support if you cannot access your account.',
  },
];

const SupportPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-canvas py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-primary text-xs font-semibold uppercase tracking-wide">
            <LifeBuoy size={13} />
            Support Center
          </div>
          <h1 className="mt-4 text-slate-900 font-display font-bold text-3xl sm:text-4xl tracking-tight">
            Get help quickly
          </h1>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Find answers, contact support, and resolve account or automation issues without delay.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-primary flex items-center justify-center mb-3">
              <Mail size={16} />
            </div>
            <h2 className="text-base font-semibold text-slate-900">Email Support</h2>
            <p className="text-sm text-slate-500 mt-1">Best for account, billing, and policy questions.</p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              {SUPPORT_EMAIL}
              <ExternalLink size={14} />
            </a>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Clock3 size={16} />
            </div>
            <h2 className="text-base font-semibold text-slate-900">Response Time</h2>
            <p className="text-sm text-slate-500 mt-1">Usually within 24 hours on weekdays.</p>
            <p className="text-xs text-slate-400 mt-4">Priority queue for login and billing blockers.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <ShieldCheck size={16} />
            </div>
            <h2 className="text-base font-semibold text-slate-900">Policy & Compliance</h2>
            <p className="text-sm text-slate-500 mt-1">Guidance for Meta-compliant automation behavior.</p>
            <Link to="/privacy" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              Review Privacy Policy
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm mb-8">
          <h2 className="text-lg font-display font-semibold text-slate-900 mb-4">Frequently asked questions</h2>
          <div className="space-y-3">
            {faqs.map(item => (
              <details key={item.q} className="group border border-slate-200 rounded-xl px-4 py-3 open:border-indigo-200 open:bg-indigo-50/40">
                <summary className="cursor-pointer list-none text-sm font-semibold text-slate-800 flex items-center justify-between">
                  <span>{item.q}</span>
                  <span className="text-slate-400 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
          <h2 className="text-xl font-display font-bold">Still stuck?</h2>
          <p className="text-indigo-100 mt-2 text-sm sm:text-base">
            Send us a quick note with your account email and issue details. We will help you unblock fast.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=Pinguru%20Support%20Request`}
              className="inline-flex items-center gap-2 bg-white text-primary px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-colors"
            >
              Contact Support
              <ArrowRight size={15} />
            </a>
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 border border-white/30 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors"
            >
              Open Account Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
