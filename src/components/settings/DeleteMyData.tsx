import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { endSessionQuietly, requestDataDeletion } from '../../lib/api';
import { useAuth } from '../../App';

const DELETED_ITEMS = [
  'Your PinGuru account and profile',
  'Your Instagram connection and access token',
  'Captured contacts (handles, emails, phone numbers)',
  'All automation rules',
  'DM logs and webhook history',
];

// Device preferences, not account data: kept after deletion.
const KEEP_KEYS = new Set(['pg_cookie_consent_v1', 'pinguru_theme']);

/** Removes PinGuru account keys from browser storage. Storage may be unavailable, so failures are ignored. */
function clearLocalAppState() {
  for (const store of [window.localStorage, window.sessionStorage]) {
    try {
      Object.keys(store)
        .filter((key) => (key.startsWith('pg_') || key.startsWith('pinguru_')) && !KEEP_KEYS.has(key))
        .forEach((key) => store.removeItem(key));
    } catch {
      // Private mode or blocked storage: nothing to clear.
    }
  }
}

export const DeleteMyData: React.FC = () => {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const [confirmEmail, setConfirmEmail] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accountEmail = (user?.email ?? '').trim().toLowerCase();
  const matches = accountEmail !== '' && confirmEmail.trim().toLowerCase() === accountEmail;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matches || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await requestDataDeletion();
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const message = err instanceof Error ? err.message : '';
      setError(status === 429
        ? (message || 'Too many requests. Please wait a few minutes and try again.')
        : (message || 'We could not delete your data. Please try again, or email support.'));
      setDeleting(false);
      return;
    }
    await endSessionQuietly();
    clearLocalAppState();
    navigate('/account-deleted', { replace: true });
    void refresh();
  };

  return (
    <section aria-labelledby="delete-data-title" className="bg-white/90 dark:bg-[#121218]/80 border border-rose-500/30 rounded-2xl p-6 lg:p-8 space-y-5 shadow-xs dark:shadow-xl backdrop-blur-md max-w-2xl">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
          <Trash2 className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h2 id="delete-data-title" className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Delete my data</h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">This permanently deletes your data right away. It cannot be undone.</p>
        </div>
      </div>

      <div className="text-xs text-slate-700 dark:text-zinc-300 space-y-2">
        <p className="font-semibold">What gets deleted:</p>
        <ul className="list-disc pl-5 space-y-1">
          {DELETED_ITEMS.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <p className="text-slate-600 dark:text-zinc-400">
          Billing records (invoices and payment references) may be kept for as long as Indian tax and accounting law requires.
          Cancel any paid subscription in Billing first so you are not charged again.
        </p>
      </div>

      <form onSubmit={handleDelete} className="space-y-3">
        <div>
          <label htmlFor="delete-confirm-email" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
            Type your account email <span className="font-mono">{user?.email}</span> to confirm
          </label>
          <input
            id="delete-confirm-email"
            type="email"
            autoComplete="off"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            disabled={deleting}
            aria-describedby={error ? 'delete-data-error' : undefined}
            className="w-full bg-slate-50 dark:bg-[#09090B] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 min-h-[44px]"
          />
        </div>

        {error && (
          <p id="delete-data-error" role="alert" className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}

        <button
          type="submit"
          disabled={!matches || deleting}
          className="min-h-[44px] px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {deleting ? 'Deleting…' : 'Permanently delete my data'}
        </button>
      </form>
    </section>
  );
};

export default DeleteMyData;
