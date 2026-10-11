import React from 'react';
import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LegalShell } from '../components/legal/LegalShell';
import { SUPPORT_EMAIL } from '../lib/links';

const LAST_UPDATED = 'October 11, 2026';
const DELETION_SUBJECT = encodeURIComponent('Delete my PinGuru account');

const DataDeletionPage: React.FC = () => (
  <LegalShell
    icon={<Trash2 size={24} className="text-primary" />}
    title="Data Deletion"
    lastUpdated={LAST_UPDATED}
    intro="You can remove PinGuru's access to Instagram and have your account and data deleted at any time. This page explains how, and what happens when you do."
  >
    <section className="legal-section">
      <h2>1. Disconnect Instagram from PinGuru</h2>
      <ol>
        <li>Sign in to PinGuru and open <Link to="/connect">Connect Instagram</Link>.</li>
        <li>Choose <strong>Disconnect</strong> and confirm. Your automations are paused immediately and PinGuru stops using the account's access token.</li>
      </ol>
    </section>

    <section className="legal-section">
      <h2>2. Delete your PinGuru account and data</h2>
      <ol>
        <li>Sign in and open <strong>Settings → Data &amp; Privacy</strong>.</li>
        <li>Under <strong>Delete my data</strong>, type your account email to confirm and choose <strong>Permanently delete my data</strong>.</li>
        <li>We immediately delete your account details, Instagram connection, captured contacts, automation rules, DM logs and webhook history, then sign you out.</li>
      </ol>
      <p>If you can no longer sign in, email <a href={`mailto:${SUPPORT_EMAIL}?subject=${DELETION_SUBJECT}`}>{SUPPORT_EMAIL}</a> from the email address on your account, with the subject "Delete my PinGuru account". We confirm the request by replying to that address before deleting.</p>
    </section>

    <section className="legal-section">
      <h2>3. Remove PinGuru from Instagram's own settings</h2>
      <p>You can also revoke PinGuru's access from inside Instagram, without signing in to PinGuru:</p>
      <ol>
        <li>In the Instagram app, open your profile, then <strong>Settings and activity</strong>.</li>
        <li>Open <strong>Business integrations</strong> (on some app versions this sits under <strong>Website permissions → Apps and websites</strong>).</li>
        <li>Find PinGuru in the <strong>Active</strong> list and choose <strong>Remove</strong>.</li>
      </ol>
    </section>

    <section className="legal-section">
      <h2>4. What the Meta deletion callback does</h2>
      <p>When you remove PinGuru in Instagram or ask Meta to delete your data, Meta sends a signed request to PinGuru's data deletion callback. When it arrives we:</p>
      <ul>
        <li>Verify the request's signature, so only genuine requests from Meta are accepted.</li>
        <li>Stop every automation for that Instagram account and delete its access token.</li>
        <li>Delete the Instagram data linked to that account: profile details, contacts, DM logs and webhook events.</li>
        <li>Return a confirmation code to Meta. Quote it to support if you want to check on the request.</li>
      </ul>
    </section>

    <section className="legal-section">
      <h2>5. How long deletion takes</h2>
      <p>Disconnecting stops automations straight away. Deleting from Settings removes your data from our live systems immediately. Requests made by email are completed within 30 days of confirmation. Encrypted backups roll over on a fixed schedule and are overwritten after that.</p>
      <p>We keep billing records (invoices and payment references) for as long as Indian tax and accounting law requires, even after your account is deleted. See the <Link to="/privacy">Privacy Policy</Link> for all retention periods.</p>
    </section>

    <section className="legal-section">
      <h2>6. Contact</h2>
      <p>Questions about deletion: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
    </section>
  </LegalShell>
);

export default DataDeletionPage;
