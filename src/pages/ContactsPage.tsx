import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { requireAuth, getProfile } from '../lib/api';
import { Badge } from '../components/ui/Badge';
import '../styles/dashboard.css';

interface Contact {
  id: string;
  ig_user_id: string;
  ig_username?: string;
  display_name?: string;
  trigger_type?: string;
  dm_count: number;
  first_seen_at: string;
  last_seen_at: string;
}

interface ContactStats {
  total: number;
  limit: number | null;
}

const API = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://api.pinguru.me' : '/api')).replace(/\/$/, '');

async function getContacts(page: number): Promise<{ contacts: Contact[]; total: number }> {
  const res = await fetch(`${API}/contacts?page=${page}&limit=20`, { credentials: 'include' });
  if (!res.ok) return { contacts: [], total: 0 };
  return res.json();
}

async function getContactStats(): Promise<ContactStats> {
  const res = await fetch(`${API}/contacts/stats`, { credentials: 'include' });
  if (!res.ok) return { total: 0, limit: null };
  return res.json();
}

const ContactsPage: React.FC = () => {
  const navigate = useNavigate();
  const [contacts, setContacts]   = useState<Contact[]>([]);
  const [stats, setStats]         = useState<ContactStats | null>(null);
  const [plan, setPlan]           = useState<string>('free');
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const LIMIT = 20;

  const load = useCallback(async (p: number, silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    const [data, s] = await Promise.all([getContacts(p), getContactStats()]);
    setContacts(data.contacts);
    setTotal(data.total);
    setStats(s);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    requireAuth().then(ok => { if (!ok) navigate('/login'); });
    getProfile().then(p => setPlan(p?.plan ?? 'free'));
    load(1);
  }, [navigate, load]);

  const totalPages = Math.ceil(total / LIMIT);

  const handlePage = (p: number) => {
    setPage(p);
    load(p);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const triggerLabel = (t?: string) => {
    if (!t) return '—';
    return t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const isFree = plan === 'free';
  const usagePercent = stats && stats.limit ? Math.min(100, Math.round((stats.total / stats.limit) * 100)) : null;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contacts</h1>
          <p className="page-subtitle">Instagram users who interacted with your automations</p>
        </div>
        <button
          onClick={() => load(page, true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="analytics-stat-card">
          <div className="flex items-center justify-between mb-2">
            <p className="analytics-stat-label">Total Contacts</p>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Users size={14} className="text-primary" />
            </div>
          </div>
          <p className="analytics-stat-value">{stats?.total ?? 0}</p>
          {stats?.limit && (
            <p className="text-xs text-slate-400 mt-1">of {stats.limit} this month</p>
          )}
        </div>

        <div className="analytics-stat-card">
          <p className="analytics-stat-label mb-2">Plan Limit</p>
          <p className="analytics-stat-value">
            {stats?.limit ? stats.limit.toLocaleString() : 'Unlimited'}
          </p>
          <p className="text-xs text-slate-400 mt-1">{plan} plan</p>
        </div>

        {usagePercent !== null && (
          <div className="analytics-stat-card">
            <p className="analytics-stat-label mb-2">Usage</p>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">{usagePercent}% used</p>
          </div>
        )}
      </div>

      {/* Free upgrade prompt */}
      {isFree && stats && stats.limit && stats.total >= stats.limit * 0.8 && (
        <div className="auth-alert error mb-6 text-sm flex items-center justify-between">
          <span>You've used {usagePercent}% of your free contact limit.</span>
          <Link to="/billing" className="font-semibold underline ml-2">Upgrade</Link>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No contacts yet</p>
          <p className="text-sm mt-1">Contacts appear automatically when your automations send DMs</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left font-semibold">Instagram User</th>
                  <th className="px-4 py-3 text-left font-semibold">Trigger</th>
                  <th className="px-4 py-3 text-left font-semibold">DMs Sent</th>
                  <th className="px-4 py-3 text-left font-semibold">First Seen</th>
                  <th className="px-4 py-3 text-left font-semibold">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {contacts.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-primary">
                          {(c.ig_username || c.ig_user_id)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {c.ig_username ? `@${c.ig_username}` : c.ig_user_id}
                          </p>
                          {c.display_name && (
                            <p className="text-xs text-slate-400">{c.display_name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="default">{triggerLabel(c.trigger_type)}</Badge>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{c.dm_count}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(c.first_seen_at)}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(c.last_seen_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
              <p>Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePage(page - 1)}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => handlePage(page + 1)}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ContactsPage;
