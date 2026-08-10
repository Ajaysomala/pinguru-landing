import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const CONSENT_KEY = 'pg_cookie_consent_v1';

export const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const accept = (value: 'all' | 'essential') => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="pg-cookie-banner" role="dialog" aria-label="Cookie consent">
      <div className="pg-cookie-banner-inner">
        <div>
          <p className="pg-cookie-title">We use cookies</p>
          <p className="pg-cookie-copy">
            Essential cookies keep you signed in securely. Analytics cookies help us improve PinGuru.
            See our <Link to="/cookies">Cookie Policy</Link> and <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </div>
        <div className="pg-cookie-actions">
          <button type="button" className="pg-cookie-btn ghost" onClick={() => accept('essential')}>
            Essential only
          </button>
          <button type="button" className="pg-cookie-btn primary" onClick={() => accept('all')}>
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
};
