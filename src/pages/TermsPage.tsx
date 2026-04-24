import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';
import '../styles/landing.css';
import '../styles/legal.css';

const LAST_UPDATED = 'January 1, 2025';

const TermsPage: React.FC = () => (
  <div className="landing-page">

    {/* Minimal nav */}
    <nav className="landing-nav">
      <Link to="/" className="landing-nav-logo">
        <div className="landing-nav-logo-mark">PG</div>
        <span className="landing-nav-logo-text">PinGuru</span>
      </Link>
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft size={14}/> Back to home
      </Link>
    </nav>

    <div className="legal-page">
      {/* Header */}
      <div className="legal-header">
        <div className="legal-header-icon">
          <FileText size={24} className="text-primary"/>
        </div>
        <div>
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-meta">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      {/* Intro */}
      <div className="legal-intro">
        By creating an account or using PinGuru ("the Service"), you agree to these Terms of Service. Please read them carefully. If you do not agree, do not use the Service.
      </div>

      <div className="legal-body">

        <section className="legal-section">
          <h2>1. Description of Service</h2>
          <p>PinGuru provides an Instagram DM automation platform that allows users to create rules that automatically respond to incoming direct messages based on triggers such as keywords, story mentions, and comment activity.</p>
          <p>The Service is intended for business and professional use on Instagram Business or Creator accounts. Use with personal accounts may not be supported.</p>
        </section>

        <section className="legal-section">
          <h2>2. Eligibility & Account Registration</h2>
          <ul>
            <li>You must be at least 18 years old to use PinGuru.</li>
            <li>You must have a valid Instagram Business or Creator account.</li>
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>You must provide accurate information when registering. False information may result in account termination.</li>
            <li>You may not create more than one account per Instagram account.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Acceptable Use</h2>
          <p>You agree to use PinGuru only for lawful purposes and in compliance with Meta's Platform Policy and Instagram's Community Guidelines. You must not:</p>
          <ul>
            <li>Use the Service to send spam, unsolicited messages, or bulk promotional DMs</li>
            <li>Automate messages that harass, threaten, or abuse other Instagram users</li>
            <li>Use the Service to violate Meta's 24-hour messaging window rules for promotional content</li>
            <li>Attempt to circumvent Meta's rate limits or API restrictions</li>
            <li>Use the Service to collect personal data from Instagram users without their consent</li>
            <li>Reverse-engineer, scrape, or otherwise misuse the PinGuru API or platform</li>
            <li>Share your account credentials with third parties or use automated scripts to access your account</li>
          </ul>
          <p>Violation of these terms may result in immediate account suspension and reporting to Meta.</p>
        </section>

        <section className="legal-section">
          <h2>4. Meta Platform Policy</h2>
          <p>Your use of PinGuru is subject to Meta's Platform Policy and Instagram's Terms of Use. By connecting your Instagram account, you acknowledge that:</p>
          <ul>
            <li>Meta may revoke your access token at any time, which will pause your automations</li>
            <li>Automated messaging is subject to Meta's 24-hour messaging window rules</li>
            <li>Meta may change API capabilities or access at any time, which may affect Service functionality</li>
            <li>You are solely responsible for ensuring your use of DM automation complies with applicable laws and Meta's policies in your jurisdiction</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>5. Plans, Billing & Refunds</h2>
          <h3>Free Plan</h3>
          <p>The Free plan is provided at no cost and may be modified or discontinued at any time with reasonable notice.</p>
          <h3>Paid Plans</h3>
          <p>Paid subscriptions (Starter at ₹199/mo, Pro at ₹499/mo) are billed via Razorpay. Billing cycles may include monthly, quarterly, or yearly options where enabled. All prices are in Indian Rupees and include applicable taxes.</p>
          <h3>Refunds</h3>
          <p>We offer a 7-day refund for new paid subscriptions if you have not used the Service substantially during that period. Contact support@pinguru.me within 7 days of purchase. Subsequent months are non-refundable.</p>
          <h3>Cancellation</h3>
          <p>You may cancel your subscription at any time via the Billing portal. You will retain access until the end of your current billing period. No partial refunds are issued for unused days.</p>
          <h3>Plan Limits</h3>
          <p>DM sending limits are enforced per calendar month. Unused DMs do not roll over. If you exceed your limit, automations will pause until the next billing cycle or until you upgrade.</p>
        </section>

        <section className="legal-section">
          <h2>6. Intellectual Property</h2>
          <p>PinGuru and its original content, features, and functionality are owned by the Company and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works from any part of the Service without written permission.</p>
          <p>Your automation rules and response templates remain your intellectual property. By creating them, you grant us a limited license to store and execute them as part of providing the Service.</p>
        </section>

        <section className="legal-section">
          <h2>7. Disclaimers & Limitation of Liability</h2>
          <p>THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR THAT AUTOMATION RULES WILL TRIGGER IN ALL CASES.</p>
          <p>In particular, we are not responsible for:</p>
          <ul>
            <li>DMs that fail to send due to Instagram API downtime or policy changes</li>
            <li>Changes to Meta's API that reduce or eliminate functionality</li>
            <li>Account actions taken by Meta against your Instagram account</li>
            <li>Loss of revenue or business opportunities resulting from automation failures</li>
          </ul>
          <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING FROM YOUR USE OF THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE THREE MONTHS PRECEDING THE CLAIM.</p>
        </section>

        <section className="legal-section">
          <h2>8. Indemnification</h2>
          <p>You agree to indemnify and hold harmless PinGuru and its officers, directors, employees, and agents from any claims, liabilities, damages, or expenses (including legal fees) arising from your use of the Service, your violation of these Terms, or your violation of any third-party rights.</p>
        </section>

        <section className="legal-section">
          <h2>9. Termination</h2>
          <p>We may suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or if required by Meta's policies. We will provide reasonable notice except where immediate action is required.</p>
          <p>You may terminate your account at any time via Settings → Data &amp; Privacy → Delete My Data.</p>
        </section>

        <section className="legal-section">
          <h2>10. Governing Law</h2>
          <p>These Terms are governed by the laws of India. Any disputes arising from the use of the Service shall be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka, India.</p>
        </section>

        <section className="legal-section">
          <h2>11. Changes to Terms</h2>
          <p>We may update these Terms from time to time. We will notify you of material changes via email at least 14 days before they take effect. Continued use of the Service after the effective date constitutes acceptance of the updated Terms.</p>
        </section>

        <section className="legal-section">
          <h2>12. Contact</h2>
          <p>For questions about these Terms, contact us at <a href="mailto:legal@pinguru.me">legal@pinguru.me</a> or <a href="mailto:support@pinguru.me">support@pinguru.me</a>.</p>
        </section>
      </div>

      {/* Footer links */}
      <div className="legal-footer-links">
        <Link to="/privacy" className="text-sm text-primary hover:underline">Privacy Policy</Link>
        <Link to="/"        className="text-sm text-slate-500 hover:underline">Back to PinGuru</Link>
      </div>
    </div>

    <footer className="landing-footer">
      <p className="landing-footer-text">© {new Date().getFullYear()} PinGuru. All rights reserved.</p>
      <div className="landing-footer-links">
        <Link to="/privacy" className="landing-footer-link">Privacy Policy</Link>
        <Link to="/terms"   className="landing-footer-link">Terms of Service</Link>
      </div>
    </footer>
  </div>
);

export default TermsPage;
