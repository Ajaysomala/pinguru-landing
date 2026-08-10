import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/landing.css';
import '../styles/legal.css';

const LAST_UPDATED = 'August 10, 2026';
const SUPPORT_EMAIL = 'support@pinguru.me';
const LEGAL_EMAIL = 'legal@pinguru.me';

const PrivacyPage: React.FC = () => (
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
          <Shield size={24} className="text-primary" />
        </div>
        <div>
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-meta">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="legal-intro">
        This Privacy Policy explains how PinGuru collects, uses, stores, shares, and deletes personal data for our Instagram DM automation SaaS available at pinguru.me.
      </div>

      <div className="legal-body">
        <section className="legal-section">
          <h2>1. Who operates PinGuru</h2>
          <p>PinGuru is operated from Bengaluru, Karnataka, India. In this policy, "PinGuru", "we", "us", and "our" refer to the operator of the PinGuru service.</p>
          <p>For privacy questions, contact <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>. For account or product support, contact <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
        </section>

        <section className="legal-section">
          <h2>2. Information we collect</h2>
          <p>We collect information needed to create your account, operate your automations, secure the service, and respond to requests.</p>
          <ul>
            <li>Account details such as name, email address, password authentication records, business category, profile settings, and communication preferences.</li>
            <li>Workspace and automation data such as rules, triggers, templates, message status, usage counts, contacts, logs, and dashboard activity.</li>
            <li>Technical data such as IP address, device and browser details, pages visited, diagnostic logs, security events, and approximate location inferred from network information.</li>
            <li>Support and compliance data you send to us, including messages, attachments, deletion requests, refund requests, and related correspondence.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Meta and Instagram platform data</h2>
          <p>When you connect an Instagram professional account, we process Meta Platform Data only as needed to provide the automation features you request.</p>
          <ul>
            <li>Instagram account identifiers, usernames, profile metadata, page or business connection details, access token metadata, permissions, and connection status.</li>
            <li>Incoming messaging events, sender or contact identifiers, message text or metadata, comment or story mention triggers where enabled, and automation delivery status.</li>
            <li>Operational records required to honor Meta rate limits, policy requirements, deauthorization events, and data deletion requests.</li>
          </ul>
          <p>We do not sell Meta Platform Data, use it to build unrelated advertising profiles, or share it except as needed to provide PinGuru, comply with law, or comply with Meta requirements.</p>
        </section>

        <section className="legal-section">
          <h2>4. How we use information</h2>
          <p>We use the information described above to:</p>
          <ul>
            <li>Create, authenticate, secure, and support your account.</li>
            <li>Connect your Instagram account and run the DM automations you configure.</li>
            <li>Display dashboards, contacts, billing status, settings, audit logs, and product notices.</li>
            <li>Process subscriptions, invoices, refunds, abuse prevention, and service communications.</li>
            <li>Detect fraud, spam, policy violations, security incidents, and technical problems.</li>
            <li>Comply with applicable law, enforce our <Link to="/terms">Terms of Service</Link>, and meet Meta Platform obligations.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>5. Cookies and similar technologies</h2>
          <p>We use essential cookies and local storage to keep you signed in, protect forms from CSRF, remember cookie choices, and operate core product features. If you consent, we may also use optional analytics cookies to understand aggregate product usage.</p>
          <p>For details and controls, see our <Link to="/cookies">Cookie Policy</Link>.</p>
        </section>

        <section className="legal-section">
          <h2>6. Billing and Razorpay payments</h2>
          <p>Paid subscriptions are processed through Razorpay in Indian Rupees (INR). We may store plan, invoice, subscription status, transaction reference, refund status, tax, and billing contact details.</p>
          <p>Razorpay processes payment credentials and related payment data under its own terms and privacy practices. PinGuru does not store full card numbers, UPI credentials, or banking authentication secrets.</p>
          <p>Refund eligibility is described in our <Link to="/refund-policy">Refund Policy</Link>.</p>
        </section>

        <section className="legal-section">
          <h2>7. Sharing and service providers</h2>
          <p>We share limited data with service providers who help us host, secure, monitor, email, analyze, bill, and support PinGuru. These providers may include cloud infrastructure, database, email, logging, analytics, customer support, Razorpay, and Meta integrations.</p>
          <p>We may also disclose information if required by law, to protect users or the service, to respond to valid legal process, or in connection with a business transfer such as merger, acquisition, financing, or asset sale.</p>
        </section>

        <section className="legal-section">
          <h2>8. Retention</h2>
          <p>We keep personal data only for as long as needed to provide PinGuru, maintain security, comply with law, resolve disputes, enforce agreements, and satisfy tax or accounting obligations.</p>
          <p>Account, automation, contact, and message log data are generally retained while your account is active. Billing records may be retained for statutory accounting periods. Security logs and backups may remain for a limited period before deletion or rotation.</p>
        </section>

        <section className="legal-section">
          <h2>9. Deletion, deauthorization, and Meta User Data Deletion</h2>
          <p>You can request deletion from product settings where available, including Settings &gt; Data &amp; Privacy &gt; Delete My Data, or by emailing <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
          <p>You can disconnect or deauthorize Meta/Instagram access through PinGuru product settings where available, through Meta controls, or by contacting support. We handle Meta User Data Deletion and deauthorization requests through these product settings and support channels.</p>
          <p>After a verified deletion request, we delete or anonymize account, automation, contact, DM log, and Instagram connection data from active systems, subject to legal, billing, fraud prevention, security, backup, and dispute-resolution retention requirements.</p>
        </section>

        <section className="legal-section">
          <h2>10. Security</h2>
          <p>We use administrative, technical, and organizational safeguards designed to protect personal data, including access controls, encryption in transit where applicable, secure authentication practices, monitoring, and provider controls.</p>
          <p>No internet service can be guaranteed fully secure. You are responsible for keeping your login credentials safe and promptly telling us about suspected unauthorized access.</p>
        </section>

        <section className="legal-section">
          <h2>11. Children under 18</h2>
          <p>PinGuru is intended for business and professional users who are at least 18 years old. We do not knowingly collect personal data from children under 18. If you believe a child has provided personal data to us, contact us so we can take appropriate action.</p>
        </section>

        <section className="legal-section">
          <h2>12. International transfers</h2>
          <p>PinGuru is operated from India, and our service providers may process data in India and other countries where they operate. These countries may have privacy laws different from your location. Where required, we use appropriate safeguards for international transfers.</p>
        </section>

        <section className="legal-section">
          <h2>13. Your choices and rights</h2>
          <ul>
            <li>Update profile and account information in product settings.</li>
            <li>Manage cookie choices through our cookie banner or your browser settings.</li>
            <li>Disconnect Instagram access or request data deletion as described above.</li>
            <li>Contact us to request access, correction, deletion, or other rights available under applicable law.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>14. Changes to this policy</h2>
          <p>We may update this Privacy Policy from time to time. If changes are material, we will provide notice by updating this page and, where appropriate, by email or in-product notice.</p>
        </section>

        <section className="legal-section">
          <h2>15. Contact</h2>
          <p>Email privacy and legal questions to <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>. Email account, deletion, or support requests to <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
        </section>
      </div>

      <div className="legal-footer-links">
        <Link to="/terms" className="text-sm text-primary hover:underline">Terms of Service</Link>
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

export default PrivacyPage;
