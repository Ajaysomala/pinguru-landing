import React from 'react';
import { ArrowLeft, Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/landing.css';
import '../styles/legal.css';

const LAST_UPDATED = 'August 10, 2026';
const SUPPORT_EMAIL = 'support@pinguru.me';

const CookiePolicyPage: React.FC = () => (
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
          <Cookie size={24} className="text-primary" />
        </div>
        <div>
          <h1 className="legal-title">Cookie Policy</h1>
          <p className="legal-meta">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="legal-intro">
        This Cookie Policy explains how PinGuru uses cookies and similar browser storage to keep the service secure, remember your choices, and improve the product.
      </div>

      <div className="legal-body">
        <section className="legal-section">
          <h2>1. What cookies are</h2>
          <p>Cookies are small files stored by your browser. Similar technologies, such as local storage, can remember preferences or store limited application state. We use these technologies for PinGuru at pinguru.me.</p>
        </section>

        <section className="legal-section">
          <h2>2. Essential cookies</h2>
          <p>Essential cookies are required for PinGuru to work and cannot be disabled through our cookie banner because they support core security and account features.</p>
          <ul>
            <li>Authentication session cookies that keep you signed in. Where supported, these are configured as HttpOnly so client-side scripts cannot read them.</li>
            <li>CSRF protection cookies or tokens that help verify state-changing requests come from your browser session.</li>
            <li>Security, load balancing, error recovery, and preference records needed to operate the website and remember your cookie choice.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Optional analytics</h2>
          <p>If you accept optional cookies, we may use analytics cookies or similar storage to understand aggregate usage, improve onboarding, identify product issues, and measure feature performance.</p>
          <p>Analytics information is used to improve PinGuru. We do not use optional analytics cookies to sell personal data or build unrelated advertising profiles.</p>
        </section>

        <section className="legal-section">
          <h2>4. Managing cookies</h2>
          <p>You can choose "Essential only" or "Accept all" in the PinGuru cookie banner. If you previously made a choice, you can clear site data in your browser to show the banner again.</p>
          <p>You can also block or delete cookies through your browser settings. Blocking essential cookies may prevent login, billing, settings, automations, or other account features from working correctly.</p>
        </section>

        <section className="legal-section">
          <h2>5. Changes to this policy</h2>
          <p>We may update this Cookie Policy when our cookie use changes. The updated version will be posted here with a new last updated date.</p>
        </section>

        <section className="legal-section">
          <h2>6. Contact</h2>
          <p>For questions about cookies or privacy, contact <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> or review our <Link to="/privacy">Privacy Policy</Link>.</p>
        </section>
      </div>

      <div className="legal-footer-links">
        <Link to="/privacy" className="text-sm text-primary hover:underline">Privacy Policy</Link>
        <Link to="/terms" className="text-sm text-primary hover:underline">Terms of Service</Link>
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

export default CookiePolicyPage;
