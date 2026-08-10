import React from 'react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/landing.css';
import '../styles/legal.css';

const LAST_UPDATED = 'August 10, 2026';
const SUPPORT_EMAIL = 'support@pinguru.me';

const RefundPolicyPage: React.FC = () => (
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
          <CreditCard size={24} className="text-primary" />
        </div>
        <div>
          <h1 className="legal-title">Refund Policy</h1>
          <p className="legal-meta">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="legal-intro">
        This public Refund Policy explains when paid PinGuru subscriptions may be refunded and how to request a review. Refunds are processed through Razorpay where applicable.
      </div>

      <div className="legal-body">
        <section className="legal-section">
          <h2>1. 7-day refund window</h2>
          <p>New paid subscriptions are eligible for refund review within 7 days of the first successful payment if the subscription has not been substantially used.</p>
          <p>Substantial use may include, without limitation, connecting production Instagram accounts, creating or running multiple automations, processing significant DM volume, exporting data, or otherwise receiving meaningful paid-plan value.</p>
        </section>

        <section className="legal-section">
          <h2>2. Non-refundable cases</h2>
          <p>Unless required by law or approved by us, refunds are generally not available for renewal payments, partial billing periods, plan downgrades, expired 7-day windows, accounts suspended for policy violations, or subscriptions that were substantially used.</p>
          <p>Free plans do not involve payment and are not eligible for monetary refunds.</p>
        </section>

        <section className="legal-section">
          <h2>3. How to request a refund</h2>
          <p>If you are logged in, submit your request from the authenticated refund flow at <Link to="/refund">/refund</Link>. This helps us match your account, plan, and payment details securely.</p>
          <p>If you cannot log in, email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with your account email, Razorpay payment reference if available, payment date, plan, and reason for the request.</p>
        </section>

        <section className="legal-section">
          <h2>4. Review and approval</h2>
          <p>We review refund requests against this policy, account usage, payment records, abuse signals, and applicable law. We may ask for additional information before approving or declining a request.</p>
          <p>Approved refunds are issued to the original payment method through Razorpay where supported.</p>
        </section>

        <section className="legal-section">
          <h2>5. Razorpay processing time</h2>
          <p>After we approve and initiate a refund, Razorpay refunds usually take 5-7 business days to appear in the original payment method, depending on banks, card networks, UPI providers, or other payment intermediaries.</p>
          <p>Processing delays outside PinGuru or Razorpay may occur and are not considered a separate refund entitlement.</p>
        </section>

        <section className="legal-section">
          <h2>6. Cancellations</h2>
          <p>You may cancel future renewals through billing settings where available or by contacting support. Cancellation does not automatically create a refund for the current paid period unless the 7-day refund criteria above are met.</p>
        </section>

        <section className="legal-section">
          <h2>7. Related terms</h2>
          <p>This policy is part of the PinGuru legal terms. Please also review our <Link to="/terms">Terms of Service</Link>, <Link to="/privacy">Privacy Policy</Link>, and <Link to="/cookies">Cookie Policy</Link>.</p>
        </section>

        <section className="legal-section">
          <h2>8. Contact</h2>
          <p>For refund questions, contact <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
        </section>
      </div>

      <div className="legal-footer-links">
        <Link to="/terms" className="text-sm text-primary hover:underline">Terms of Service</Link>
        <Link to="/privacy" className="text-sm text-primary hover:underline">Privacy Policy</Link>
        <Link to="/cookies" className="text-sm text-primary hover:underline">Cookie Policy</Link>
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

export default RefundPolicyPage;
