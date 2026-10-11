import React from 'react';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LegalShell } from '../components/legal/LegalShell';
import { LEGAL_EMAIL, SUPPORT_EMAIL } from '../lib/links';

const LAST_UPDATED = 'October 11, 2026';

const PROCESSORS = [
  { name: 'Meta Platforms (Instagram Graph API)', purpose: 'Receives and sends Instagram messages, comments and story mentions for the account you connect.' },
  { name: 'Razorpay', purpose: 'Processes subscription payments, invoices and refunds in INR.' },
  { name: 'Resend', purpose: 'Delivers transactional email such as verification codes, password reset links and billing notices.' },
  { name: 'MongoDB Atlas', purpose: 'Stores account, automation, contact and log data in our application database.' },
  { name: 'Hosting providers', purpose: 'Serve this website (GitHub Pages, moving to Cloudflare Pages) and run the PinGuru API servers.' },
];

const RETENTION = [
  { data: 'DM logs (message delivery records)', period: '90 days, then deleted automatically' },
  { data: 'Instagram webhook events', period: '48 hours, then deleted automatically' },
  { data: 'Accounts that never verify their email', period: '24 hours, then deleted automatically' },
  { data: 'Account, rules, settings and captured contacts', period: 'While your account is active, or until you delete them' },
  { data: 'Billing records (invoices, payment references)', period: 'As long as Indian tax and accounting law requires' },
];

const PrivacyPage: React.FC = () => (
  <LegalShell
    icon={<Shield size={24} className="text-primary" />}
    title="Privacy Policy"
    lastUpdated={LAST_UPDATED}
    intro="This Privacy Policy explains what PinGuru collects, why, who processes it for us, how long we keep it, and the rights you have over it."
  >
    <section className="legal-section">
      <h2>1. Who operates PinGuru</h2>
      <p>PinGuru is an Instagram DM automation service operated from Bengaluru, Karnataka, India. In this policy, "PinGuru", "we", "us" and "our" refer to the operator of the service at pinguru.me.</p>
      <p>For privacy questions, contact <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>. For account or product support, contact <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
    </section>

    <section className="legal-section">
      <h2>2. What we collect</h2>
      <ul>
        <li><strong>Your account:</strong> email address, name, business category, password hash or Google sign-in identifier, and your settings.</li>
        <li><strong>Your Instagram account:</strong> Instagram username, account ID, profile picture, account type, follower count, connection and token status, and the permissions you granted.</li>
        <li><strong>Your contacts:</strong> the Instagram handles of people who interact with your automations, and any email addresses or phone numbers that your own rules ask them to share.</li>
        <li><strong>DM logs:</strong> which rule fired, for which contact, when, and whether the message was delivered.</li>
        <li><strong>Billing identifiers:</strong> your plan, Razorpay customer, subscription and payment references, and refund status. We never see or store full card numbers, UPI PINs or bank credentials.</li>
        <li><strong>Technical data:</strong> IP address, browser and device details, and security logs used to protect your account.</li>
      </ul>
    </section>

    <section className="legal-section">
      <h2>3. Why we use it</h2>
      <ul>
        <li>To create and secure your account and sign you in.</li>
        <li>To connect your Instagram account and run the automations you configure.</li>
        <li>To show you dashboards, contacts and analytics for your own account.</li>
        <li>To bill subscriptions, issue invoices and process refunds.</li>
        <li>To prevent spam, abuse and fraud, and to comply with law and Meta Platform Terms.</li>
      </ul>
      <p>We do not sell personal data, and we do not use Meta Platform Data for advertising profiles or any purpose unrelated to running your automations.</p>
    </section>

    <section className="legal-section">
      <h2>4. Processors we share data with</h2>
      <p>We share only what each provider needs to do its job for us:</p>
      <ul>
        {PROCESSORS.map((p) => (
          <li key={p.name}><strong>{p.name}:</strong> {p.purpose}</li>
        ))}
      </ul>
      <p>We may also disclose data when the law requires it, to respond to valid legal process, or to protect users and the service.</p>
    </section>

    <section className="legal-section">
      <h2>5. How long we keep it</h2>
      <ul>
        {RETENTION.map((r) => (
          <li key={r.data}><strong>{r.data}:</strong> {r.period}.</li>
        ))}
      </ul>
      <p>Encrypted backups roll over on a fixed schedule, so deleted data can remain in a backup for a short time before it is overwritten.</p>
    </section>

    <section className="legal-section">
      <h2>6. Cookies</h2>
      <p>We use essential cookies to keep you signed in and protect forms against cross-site request forgery. See the <Link to="/cookies">Cookie Policy</Link> for details and controls.</p>
    </section>

    <section className="legal-section">
      <h2>7. Your rights</h2>
      <p>Under India's Digital Personal Data Protection Act, 2023 and other applicable law, you can:</p>
      <ul>
        <li><strong>Access</strong> a summary of the personal data we hold about you and how we use it.</li>
        <li><strong>Correct</strong> inaccurate or incomplete data. Most profile fields can be edited in Settings.</li>
        <li><strong>Erase</strong> your data. See <Link to="/data-deletion">Data Deletion</Link> for the steps.</li>
        <li><strong>Withdraw consent</strong> at any time, for example by disconnecting Instagram or deleting your account. Withdrawal does not affect processing that already happened.</li>
        <li><strong>Raise a grievance</strong> with our grievance officer (section 9) and, if unresolved, with the Data Protection Board of India.</li>
      </ul>
      <p>Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> from your account email address to make a request. We may ask you to confirm your identity first.</p>
    </section>

    <section className="legal-section">
      <h2>8. Data deletion</h2>
      <p>You can delete your account and data, and remove PinGuru's access to Instagram, at any time. The <Link to="/data-deletion">Data Deletion</Link> page explains each step and what happens when Instagram tells us you removed the app.</p>
    </section>

    <section className="legal-section">
      <h2>9. Grievance officer</h2>
      <p>If you have a complaint about how we handle your personal data, write to our Grievance Officer at <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a> with the subject "Grievance". Include your account email and a description of the issue.</p>
    </section>

    <section className="legal-section">
      <h2>10. Security</h2>
      <p>We use access controls, encryption in transit, httpOnly session cookies, CSRF protection and provider security controls. No online service is perfectly secure, so please keep your password private and tell us promptly about any suspected unauthorised access.</p>
    </section>

    <section className="legal-section">
      <h2>11. Children</h2>
      <p>PinGuru is for business users aged 18 or older. We do not knowingly collect personal data from children.</p>
    </section>

    <section className="legal-section">
      <h2>12. International transfers</h2>
      <p>Some processors listed above may store or process data outside India. We use providers that apply appropriate safeguards to that data.</p>
    </section>

    <section className="legal-section">
      <h2>13. Changes</h2>
      <p>If we change this policy materially, we will update the date above and tell you by email or in the product.</p>
    </section>
  </LegalShell>
);

export default PrivacyPage;
