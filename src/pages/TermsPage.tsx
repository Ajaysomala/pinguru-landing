import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/landing.css';
import '../styles/legal.css';

const LAST_UPDATED = 'August 10, 2026';
const SUPPORT_EMAIL = 'support@pinguru.me';
const LEGAL_EMAIL = 'legal@pinguru.me';

const TermsPage: React.FC = () => (
  <div className="landing-page">
    <nav className="landing-nav">
      <div className="landing-nav-inner">
        <Link to="/" className="landing-nav-logo" aria-label="PinGuru home">
          <div className="landing-nav-logo-mark">PG</div>
          <span className="landing-nav-logo-text">PinGuru</span>
        </Link>
        <Link to="/" className="landing-nav-link inline-flex items-center gap-1.5">
          <ArrowLeft size={14} /> Back to home
        </Link>
      </div>
    </nav>

    <main className="legal-page">
      <div className="legal-header">
        <div className="legal-header-icon">
          <FileText size={24} className="text-primary" />
        </div>
        <div>
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-meta">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="legal-intro">
        These Terms govern your use of PinGuru, an Instagram DM automation SaaS available at pinguru.me. By creating an account, connecting Instagram, or using the service, you agree to these Terms.
      </div>

      <div className="legal-body">
        <section className="legal-section">
          <h2>1. The service</h2>
          <p>PinGuru helps businesses and creators configure rules that respond to Instagram direct messages and related Instagram events, subject to Meta's platform capabilities and policies.</p>
          <p>The service is operated from Bengaluru, Karnataka, India and is intended for professional or business use by users who are at least 18 years old.</p>
        </section>

        <section className="legal-section">
          <h2>2. Account registration</h2>
          <ul>
            <li>You must provide accurate account, billing, and business information.</li>
            <li>You are responsible for your login credentials and all activity under your account.</li>
            <li>You must have the right to connect and manage each Instagram Business or Creator account you add to PinGuru.</li>
            <li>You must promptly update account information and notify us of unauthorized access or suspected compromise.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Plans, billing, and subscription cycles</h2>
          <p>PinGuru currently offers a Free plan, Starter at ₹199/month, and Pro at ₹499/month. Paid plans may be billed monthly, quarterly, or yearly where those cycles are available at checkout.</p>
          <p>Payments are processed through Razorpay in Indian Rupees (INR). Taxes, payment method charges, bank fees, currency conversion fees, or other charges may apply depending on your payment method and location.</p>
          <p>Subscription access continues until cancellation, non-payment, termination, or plan expiry. If payment fails, we may downgrade, pause, or suspend paid features after reasonable notice where practical.</p>
        </section>

        <section className="legal-section">
          <h2>4. Cancellations and refunds</h2>
          <p>You may cancel a paid subscription from the billing area where available or by contacting support. Cancellation stops future renewals, but access generally continues until the end of the current paid billing period.</p>
          <p>We offer a 7-day refund for new paid subscriptions if the service has not been substantially used during that period. Subsequent renewals, partial months, add-ons, and substantially used subscriptions are generally non-refundable unless required by law or approved by us.</p>
          <p>For the full process, see our <Link to="/refund-policy">Refund Policy</Link>.</p>
        </section>

        <section className="legal-section">
          <h2>5. Acceptable use</h2>
          <p>You agree to use PinGuru only for lawful, consent-based, policy-compliant messaging. You must not:</p>
          <ul>
            <li>Send spam, deceptive, abusive, harassing, discriminatory, or illegal messages.</li>
            <li>Use automation to evade Meta rate limits, messaging windows, consent requirements, review requirements, or account restrictions.</li>
            <li>Collect, infer, or process personal data from Instagram users without a valid basis and required notices.</li>
            <li>Transmit malware, phishing content, scams, regulated goods offers, or content that violates Instagram Community Guidelines.</li>
            <li>Reverse engineer, scrape, overload, probe, or interfere with PinGuru, Meta, Instagram, Razorpay, or connected infrastructure.</li>
            <li>Share account access in a way that compromises security or impersonates another person or business.</li>
          </ul>
          <p>We may suspend automations or accounts that appear to violate these Terms, law, user safety, or platform policy.</p>
        </section>

        <section className="legal-section">
          <h2>6. Meta Platform Policy and Instagram terms</h2>
          <p>Your use of PinGuru must comply with Meta Platform Terms, Meta Platform Policy, Instagram Terms of Use, Instagram Community Guidelines, and all rules that apply to Instagram messaging automation.</p>
          <ul>
            <li>Meta may change APIs, permissions, messaging windows, rate limits, review status, or access tokens at any time.</li>
            <li>Meta or Instagram outages, policy changes, review requirements, or enforcement actions may limit or stop PinGuru functionality.</li>
            <li>You are responsible for the content and compliance of your automated replies, triggers, templates, offers, and business practices.</li>
            <li>You must honor opt-outs, deletion requests, privacy rights, and applicable messaging laws in your jurisdiction.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>7. Your content and data</h2>
          <p>You retain rights to your automation rules, message templates, brand content, and customer relationship data. You grant PinGuru a limited license to host, process, transmit, display, and use that content only as needed to provide, secure, support, and improve the service.</p>
          <p>Our data practices are described in the <Link to="/privacy">Privacy Policy</Link> and <Link to="/cookies">Cookie Policy</Link>.</p>
        </section>

        <section className="legal-section">
          <h2>8. PinGuru intellectual property</h2>
          <p>PinGuru, including our software, interface, workflows, documentation, graphics, trademarks, and service design, is owned by us or our licensors. These Terms do not transfer ownership of PinGuru intellectual property to you.</p>
          <p>You may not copy, modify, resell, sublicense, or create derivative works from PinGuru except as expressly allowed by us in writing.</p>
        </section>

        <section className="legal-section">
          <h2>9. Availability and changes</h2>
          <p>We aim to operate PinGuru reliably, but the service is provided on an "as is" and "as available" basis. Features may depend on Meta, Instagram, Razorpay, hosting providers, and other third-party services.</p>
          <p>We may add, change, suspend, or discontinue features, plans, limits, or integrations. Where changes materially affect paid subscriptions, we will provide reasonable notice when practical.</p>
        </section>

        <section className="legal-section">
          <h2>10. Suspension and termination</h2>
          <p>You may stop using PinGuru at any time. We may suspend or terminate access if you breach these Terms, create risk for users or platforms, fail to pay, violate law or Meta policy, or misuse the service.</p>
          <p>After termination, we may retain or delete data according to our <Link to="/privacy">Privacy Policy</Link>, legal obligations, security needs, and backup practices.</p>
        </section>

        <section className="legal-section">
          <h2>11. Disclaimers</h2>
          <p>To the maximum extent permitted by law, PinGuru disclaims warranties of merchantability, fitness for a particular purpose, non-infringement, uninterrupted availability, error-free operation, and guaranteed delivery of automated messages.</p>
          <p>We do not control Meta, Instagram, Razorpay, your internet provider, recipient devices, or user behavior, and we are not responsible for their acts, omissions, outages, policies, or enforcement decisions.</p>
        </section>

        <section className="legal-section">
          <h2>12. Limitation of liability</h2>
          <p>To the maximum extent permitted by law, PinGuru will not be liable for indirect, incidental, special, consequential, exemplary, punitive, or lost-profit damages.</p>
          <p>Our aggregate liability for claims relating to the service will not exceed the amount you paid to PinGuru in the three months before the event giving rise to the claim, or INR 1,000 if you used only the Free plan.</p>
        </section>

        <section className="legal-section">
          <h2>13. Indemnity</h2>
          <p>You agree to indemnify and hold PinGuru harmless from claims, losses, liabilities, damages, penalties, and expenses arising from your content, automations, business practices, connected Instagram accounts, breach of these Terms, or violation of law or third-party rights.</p>
        </section>

        <section className="legal-section">
          <h2>14. Governing law and courts</h2>
          <p>These Terms are governed by the laws of India. Subject to applicable law, courts located in Bengaluru, Karnataka, India will have exclusive jurisdiction over disputes arising from or relating to these Terms or PinGuru.</p>
        </section>

        <section className="legal-section">
          <h2>15. Changes to these Terms</h2>
          <p>We may update these Terms from time to time. If changes are material, we will provide notice by updating this page and, where appropriate, by email or in-product notice. Continued use after an update means you accept the updated Terms.</p>
        </section>

        <section className="legal-section">
          <h2>16. Contact</h2>
          <p>For legal questions, email <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>. For billing, refunds, or account support, email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
        </section>
      </div>

      <div className="legal-footer-links">
        <Link to="/privacy" className="text-sm text-primary hover:underline">Privacy Policy</Link>
        <Link to="/cookies" className="text-sm text-primary hover:underline">Cookie Policy</Link>
        <Link to="/refund-policy" className="text-sm text-primary hover:underline">Refund Policy</Link>
      </div>
    </main>

    <footer className="landing-footer">
      <div className="footer-inner">
        <div className="footer-bottom">
          <p className="footer-copyright">© {new Date().getFullYear()} PinGuru. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy" className="footer-bottom-link">Privacy</Link>
            <Link to="/terms" className="footer-bottom-link">Terms</Link>
            <Link to="/cookies" className="footer-bottom-link">Cookies</Link>
            <Link to="/refund-policy" className="footer-bottom-link">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  </div>
);

export default TermsPage;
