import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../../styles/landing.css';
import '../../styles/legal.css';

const LEGAL_LINKS = [
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
  { to: '/cookies', label: 'Cookies' },
  { to: '/refund-policy', label: 'Refunds' },
  { to: '/data-deletion', label: 'Data deletion' },
  { to: '/contact', label: 'Contact' },
];

export const LegalFooter: React.FC = () => (
  <footer className="landing-footer">
    <div className="footer-inner">
      <div className="footer-bottom">
        <p className="footer-copyright">© {new Date().getFullYear()} PinGuru. All rights reserved.</p>
        <nav className="footer-bottom-links" aria-label="Legal">
          {LEGAL_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="footer-bottom-link">{link.label}</Link>
          ))}
        </nav>
      </div>
    </div>
  </footer>
);

interface LegalShellProps {
  icon: React.ReactNode;
  title: string;
  lastUpdated: string;
  intro: React.ReactNode;
  children: React.ReactNode;
}

/** Page frame shared by the legal and compliance pages. */
export const LegalShell: React.FC<LegalShellProps> = ({ icon, title, lastUpdated, intro, children }) => (
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
        <div className="legal-header-icon">{icon}</div>
        <div>
          <h1 className="legal-title">{title}</h1>
          <p className="legal-meta">Last updated: {lastUpdated}</p>
        </div>
      </div>
      <div className="legal-intro">{intro}</div>
      <div className="legal-body">{children}</div>
    </main>

    <LegalFooter />
  </div>
);
