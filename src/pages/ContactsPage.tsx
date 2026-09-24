import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Sparkles, Download, RefreshCw, Mail } from 'lucide-react';
import { getContacts, getContactStats, getDashboardStats, exportContactsCsv } from '../lib/api';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../App';
import '../styles/dashboard.css';
import '../styles/contacts.css';
import type { DashboardStats } from '../lib/types';

interface Contact {
  id: string;
  ig_user_id: string;
  ig_username?: string;
  display_name?: string;
  trigger_type?: string;
  dm_count: number;
  first_seen_at: string;
  last_seen_at: string;
  captured_email?: string | null;
  email?: string | null;
}

interface ContactStats {
  total: number;
  limit: number | null;
}

const ContactsPage: React.FC = () => {
  const { user: authUser } = useAuth();
  const [contacts, setContacts]   = useState<Contact[]>([]);
  const [stats, setStats]         = useState<ContactStats | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch] = useState('');
  const [triggerFilter, setTriggerFilter] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  const LIMIT = 20;

  const load = useCallback(async (p: number) => {
    setLoading(true);
    const [data, s, ds] = await Promise.all([getContacts(p), getContactStats(), getDashboardStats()]);
    setContacts(data.contacts);
    setTotal(data.total);
    setStats(s);
    setDashboardStats(ds);
    setLoading(false);
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const blob = await exportContactsCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pinguru_contacts.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to export contacts CSV');
    } finally {
      setIsExporting(false);
    }
  };

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

  const plan = authUser?.plan ?? 'free';
  const dmsSentThisMonth = dashboardStats?.dms_sent_this_month ?? 0;
  const recentCutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const newThisWeek = contacts.filter(c => new Date(c.first_seen_at).getTime() >= recentCutoff).length;
  const totalDmsToContacts = contacts.reduce((sum, c) => sum + (c.dm_count ?? 0), 0);

  const filteredContacts = contacts.filter((contact) => {
    const searchText = `${contact.ig_username ?? ''} ${contact.ig_user_id ?? ''} ${contact.display_name ?? ''} ${contact.captured_email ?? ''} ${contact.email ?? ''}`.toLowerCase();
    const matchesSearch = !search || searchText.includes(search.toLowerCase());
    const matchesTrigger = triggerFilter === 'all' || (contact.trigger_type ?? '') === triggerFilter;
    return matchesSearch && matchesTrigger;
  });

  const initialsFrom = (c: Contact) => {
    const seed = c.ig_username || c.display_name || c.ig_user_id || 'C';
    return seed.slice(0, 2).toUpperCase();
  };

  return (
    <div className="page-wrapper contacts-v6-page">
      <section className="pg-surface-hero contacts-v6-hero">
        <div>
          <p className="pg-surface-kicker"><Sparkles size={12} /> Audience Intelligence</p>
          <h1 className="pg-surface-title">Contacts</h1>
          <p className="pg-surface-subtitle">Track every Instagram conversation your automations create and understand where your best leads enter.</p>
        </div>
        <span className="contacts-v6-chip">{stats?.total ?? 0} total · {stats?.limit ?? '∞'} limit ({plan})</span>
      </section>

      <section className="contacts-v6-stats">
        <article className="contacts-v6-stat-card">
          <p className="value">{stats?.total ?? 0}</p>
          <p className="label">Total contacts</p>
        </article>
        <article className="contacts-v6-stat-card">
          <p className="value">{newThisWeek}</p>
          <p className="label">New this week</p>
          <p className="trend up">Last 7 days</p>
        </article>
        <article className="contacts-v6-stat-card">
          <p className="value">{Math.max(totalDmsToContacts, dmsSentThisMonth)}</p>
          <p className="label">Total DMs to contacts</p>
        </article>
      </section>

      <section className="contacts-v6-filters">
        <div className="contacts-v6-search">
          <Search size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by username, ID, or email..." />
        </div>
        <select value={triggerFilter} onChange={(e) => setTriggerFilter(e.target.value)}>
          <option value="all">All triggers</option>
          <option value="keyword">Keyword</option>
          <option value="comment">Comment</option>
          <option value="story_mention">Story reply</option>
          <option value="new_dm">New DM</option>
        </select>
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={isExporting}
          className="contacts-v6-export-btn"
          title="Export Contacts to CSV"
        >
          {isExporting ? <RefreshCw size={15} className="animate-spin" /> : <Download size={15} />}
          <span>{isExporting ? 'Exporting...' : 'Export to CSV'}</span>
        </button>
      </section>

      <section className="contacts-v6-table-wrap">
        <table className="contacts-v6-table">
          <thead>
            <tr>
              <th>Contact</th>
              <th>Captured Email</th>
              <th>Trigger Type</th>
              <th>DMs Received</th>
              <th>Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="contacts-v6-empty">Loading contacts...</td>
              </tr>
            ) : filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={5} className="contacts-v6-empty">No contacts found.</td>
              </tr>
            ) : (
              filteredContacts.map((contact) => (
                <tr key={contact.id}>
                  <td>
                    <div className="contacts-v6-contact-cell">
                      <div className="contacts-v6-avatar">{initialsFrom(contact)}</div>
                      <div>
                        <p className="name">@{contact.ig_username || contact.ig_user_id}</p>
                        <p className="id">{contact.ig_user_id}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    {contact.captured_email || contact.email ? (
                      <Badge variant="indigo">
                        <Mail size={11} className="mr-1 inline-block shrink-0" />
                        {contact.captured_email || contact.email}
                      </Badge>
                    ) : (
                      <span style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>—</span>
                    )}
                  </td>
                  <td><Badge variant="gray">{triggerLabel(contact.trigger_type)}</Badge></td>
                  <td className="num">{contact.dm_count}</td>
                  <td>{formatDate(contact.last_seen_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {totalPages > 1 && (
        <div className="contacts-v6-pagination">
          <p>Showing {(page - 1) * LIMIT + 1}-{Math.min(page * LIMIT, total)} of {total}</p>
          <div>
            <button onClick={() => handlePage(page - 1)} disabled={page === 1}><ChevronLeft size={16} /></button>
            <button onClick={() => handlePage(page + 1)} disabled={page === totalPages}><ChevronRight size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;
