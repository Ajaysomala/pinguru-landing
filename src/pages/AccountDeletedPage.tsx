import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LegalFooter } from '../components/legal/LegalShell';
import { SUPPORT_EMAIL } from '../lib/links';
import '../styles/landing.css';
import '../styles/legal.css';

/** Shown after a user deletes their data from Settings. */
const AccountDeletedPage: React.FC = () => (
  <div className="landing-page">
    <nav className="landing-nav">
      <div className="landing-nav-inner">
        <Link to="/" className="landing-nav-logo" aria-label="PinGuru home">
          <div className="landing-nav-logo-mark">PG</div>
          <span className="landing-nav-logo-text">PinGuru</span>
        </Link>
      </div>
    </nav>

    <main className="legal-page">
      <div className="legal-header">
        <div className="legal-header-icon">
          <CheckCircle size={24} className="text-primary" />
        </div>
        <div>
          <h1 className="legal-title">Your data has been deleted</h1>
          <p className="legal-meta">You have been signed out.</p>
        </div>
      </div>

      <div className="legal-body">
        <section className="legal-section">
          <p>We deleted your PinGuru account data, Instagram connection, contacts, automation rules and DM logs. Billing records may be kept for as long as the law requires.</p>
          <p>To be sure PinGuru has no remaining access, you can also remove it from Instagram's own settings, as described on the <Link to="/data-deletion">Data Deletion</Link> page.</p>
          <p>Questions? Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
          <p><Link to="/">Back to the PinGuru home page</Link></p>
        </section>
      </div>
    </main>

    <LegalFooter />
  </div>
);

export default AccountDeletedPage;
