import React from 'react';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LegalShell } from '../components/legal/LegalShell';
import { LEGAL_EMAIL, SUPPORT_EMAIL } from '../lib/links';

const LAST_UPDATED = 'October 11, 2026';

const ContactPage: React.FC = () => (
  <LegalShell
    icon={<Mail size={24} className="text-primary" />}
    title="Contact"
    lastUpdated={LAST_UPDATED}
    intro="How to reach PinGuru for support, billing, privacy and grievances."
  >
    <section className="legal-section">
      <h2>Support</h2>
      <p>Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> for help with your account, Instagram connection, automations or billing.</p>
      <p>Include your account email, your Instagram handle and a short description of the problem. Screenshots help.</p>
    </section>

    <section className="legal-section">
      <h2>Response time</h2>
      <p>We usually reply within 24 hours on weekdays. Sign-in and billing problems are handled first.</p>
      <p>Common questions are answered in the <Link to="/support">Support Center</Link>.</p>
    </section>

    <section className="legal-section">
      <h2>Privacy and data deletion</h2>
      <p>To delete your data, follow the steps on the <Link to="/data-deletion">Data Deletion</Link> page. For other privacy questions, email <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>.</p>
    </section>

    <section className="legal-section">
      <h2>Grievance officer</h2>
      <p>If you have a complaint about the service or how we handle your personal data, write to our Grievance Officer at <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a> with the subject "Grievance". Include your account email and a description of the issue.</p>
    </section>
  </LegalShell>
);

export default ContactPage;
