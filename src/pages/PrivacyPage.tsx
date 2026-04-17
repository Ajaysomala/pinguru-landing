import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import '../styles/landing.css';
import '../styles/legal.css';

const LAST_UPDATED = 'April 17, 2026';
const SUPPORT_EMAIL = 'support@pinguru.me';

const PrivacyPage: React.FC = () => (
  <div className="landing-page">
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
      <div className="legal-header">
        <div className="legal-header-icon">
          <Shield size={24} className="text-primary"/>
        </div>
        <div>
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-meta">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="legal-intro">
        This Privacy Policy explains what we collect, why we collect it, how we use it, and how you can request deletion of your data.
      </div>

      <div className="legal-body">
        <section className="legal-section">
          <h2>1. Information We Collect</h2>
          <p>When you use PinGuru, we may collect the following information:</p>
          <ul>
            <li>Account information such as your email address, first name, last name, and business category.</li>
            <li>Authentication and session information used to keep you logged in.</li>
            <li>Instagram connection data such as Instagram user ID, Instagram username, and access token details.</li>
            <li>Automation data including rules, triggers, DM counts, and message logs.</li>
            <li>Billing and subscription information such as plan selection and Stripe checkout or portal references.</li>
            <li>Support and compliance requests you send to us.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>2. How We Use Information</h2>
          <p>We use this information to:</p>
          <ul>
            <li>Provide and operate the PinGuru service.</li>
            <li>Authenticate you and maintain your account.</li>
            <li>Connect your Instagram professional account and process reactive DM automation.</li>
            <li>Show dashboard, billing, contacts, and settings data.</li>
            <li>Handle data deletion, support, and compliance requests.</li>
            <li>Detect abuse, prevent fraud, and maintain security.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Instagram and Meta Data</h2>
          <p>PinGuru only processes Instagram data needed to provide the service you requested. This may include your Instagram professional account details, message events, and related contact records. We use this data only for the automation and support functions described in this policy and our Terms of Service.</p>
          <p>We do not sell Platform Data, and we do not use Meta data for advertising profiles or unrelated purposes.</p>
        </section>

        <section className="legal-section">
          <h2>4. Legal Basis and Consent</h2>
          <p>Where required by law, we process your data based on your consent, our contract with you, compliance obligations, legitimate interests, or other applicable legal grounds.</p>
          <p>By connecting your Instagram account, you authorize us to access and process the data necessary to provide DM automation and related support features.</p>
        </section>

        <section className="legal-section">
          <h2>5. Sharing and Service Providers</h2>
          <p>We may share limited data with trusted service providers that help us operate the service, such as hosting, database, email, analytics, and payment providers. These providers are required to protect your data and use it only on our behalf.</p>
          <p>We may also disclose data if required by law, to protect our rights, or to respond to a valid legal request.</p>
        </section>

        <section className="legal-section">
          <h2>6. Retention</h2>
          <p>We retain account, automation, and messaging data for as long as needed to provide the service, comply with legal obligations, resolve disputes, and enforce our agreements. When data is no longer needed, we delete or anonymize it where appropriate.</p>
        </section>

        <section className="legal-section">
          <h2>7. Data Deletion</h2>
          <p>You can request deletion of your data at any time from Settings → Data &amp; Privacy → Delete My Data, or by contacting us at {SUPPORT_EMAIL}.</p>
          <p>When you submit a deletion request, we remove your automation rules, DM logs, and Instagram connection data from our active systems, subject to legal retention requirements.</p>
        </section>

        <section className="legal-section">
          <h2>8. Security</h2>
          <p>We use administrative, technical, and physical safeguards designed to protect your data. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.</p>
        </section>

        <section className="legal-section">
          <h2>9. Your Choices</h2>
          <ul>
            <li>You may update your profile in Settings.</li>
            <li>You may disconnect Instagram by revoking access from Meta where available or by contacting support.</li>
            <li>You may delete your account and associated data using the data deletion flow.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>10. Children’s Privacy</h2>
          <p>PinGuru is not intended for children under 18, and we do not knowingly collect personal information from children.</p>
        </section>

        <section className="legal-section">
          <h2>11. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. If changes are material, we will provide notice by updating the page and, where appropriate, by email or in-product notice.</p>
        </section>

        <section className="legal-section">
          <h2>12. Contact</h2>
          <p>If you have questions about this Privacy Policy or our data practices, contact us at <a href="mailto:support@pinguru.me">{SUPPORT_EMAIL}</a>.</p>
        </section>
      </div>

      <div className="legal-footer-links">
        <Link to="/terms" className="text-sm text-primary hover:underline">Terms of Service</Link>
        <Link to="/" className="text-sm text-slate-500 hover:underline">Back to PinGuru</Link>
      </div>
    </div>

    <footer className="landing-footer">
      <p className="landing-footer-text">© {new Date().getFullYear()} PinGuru. All rights reserved.</p>
      <div className="landing-footer-links">
        <Link to="/privacy" className="landing-footer-link">Privacy Policy</Link>
        <Link to="/terms" className="landing-footer-link">Terms of Service</Link>
      </div>
    </footer>
  </div>
);

export default PrivacyPage;
