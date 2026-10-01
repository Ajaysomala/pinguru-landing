import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  User, 
  ShieldCheck, 
  CreditCard, 
  Check
} from 'lucide-react';
import { useAuth } from '../App';
import { updateProfile, getPlanStatus } from '../lib/api';
import type { PlanStatus } from '../lib/types';
import { useToast } from '../context/ToastContext';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'compliance' | 'billing'>('profile');

  // Profile Form State - sourced from real user
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);

  // Compliance state
  const [enableSafetyBuffer, setEnableSafetyBuffer] = useState(true);
  const [blockedKws, setBlockedKws] = useState<string[]>(['crypto', 'loan', 'gambling']);
  const [newBlockedKw, setNewBlockedKw] = useState('');

  // Plan status
  const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || '');
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
    }
  }, [user]);

  useEffect(() => {
    getPlanStatus().then(setPlanStatus).catch(() => null);
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        display_name: displayName,
        first_name: firstName,
        last_name: lastName,
      });
      await refresh();
      showToast('Profile information updated successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      showToast(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddBlockedKeyword = () => {
    const trimmed = newBlockedKw.trim().toLowerCase();
    if (trimmed && !blockedKws.includes(trimmed)) {
      setBlockedKws([...blockedKws, trimmed]);
      setNewBlockedKw('');
      showToast(`Added "${trimmed}" to blocklist.`);
    }
  };

  const handleRemoveBlockedKeyword = (kw: string) => {
    setBlockedKws(blockedKws.filter((k) => k !== kw));
    showToast(`Removed "${kw}" from blocklist.`);
  };

  const avatarUrl = user?.avatar_url || localStorage.getItem('pinguru_user_avatar') || null;
  const initials = (displayName.slice(0, 2) || 'PG').toUpperCase();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Settings className="w-5 h-5 text-indigo-400" />
          </div>
          <span>Settings & Workspace</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1">
          Manage your account profile, compliance anti-spam protections, and subscription plan.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="bg-white/90 dark:bg-[#121218]/80 border border-slate-200 dark:border-white/10 p-1.5 rounded-2xl flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar backdrop-blur-md shadow-xs dark:shadow-xl">
        {[
          { id: 'profile', label: 'Workspace & Profile', icon: User },
          { id: 'compliance', label: 'Compliance & Safety', icon: ShieldCheck },
          { id: 'billing', label: 'Plan & Billing', icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`min-h-[40px] px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/30 to-violet-600/20 text-indigo-700 dark:text-white border border-indigo-500/40 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-cyan-400' : 'text-slate-400 dark:text-zinc-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profile & Workspace */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white/90 dark:bg-[#121218]/80 border border-slate-200 dark:border-white/10 rounded-2xl p-6 lg:p-8 space-y-6 shadow-xs dark:shadow-xl backdrop-blur-md max-w-2xl">
          <div className="border-b border-slate-200 dark:border-white/5 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Account Information</h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">Update your public profile and workspace identity.</p>
          </div>

          {/* Profile Photo Preview Widget */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#09090B]/60 border border-slate-200 dark:border-white/10 rounded-2xl">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-full border border-indigo-500/40 overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-[#121218] shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 flex items-center justify-center text-white text-base font-bold uppercase tracking-tight">
                    {initials}
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">Profile Photo</h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Customized avatar visible to teammates and funnels.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/settings/profile')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-indigo-600 dark:text-cyan-400 text-xs font-semibold transition-colors cursor-pointer"
            >
              Change Photo
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full bg-slate-50 dark:bg-[#09090B] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#09090B] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 min-h-[42px] transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#09090B] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#09090B] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 min-h-[42px] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#09090B] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#09090B] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 min-h-[42px] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full bg-slate-100 dark:bg-[#09090B]/50 border border-slate-200 dark:border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 dark:text-zinc-500 focus:outline-none min-h-[42px] cursor-not-allowed font-mono"
              />
              <span className="text-[10px] text-slate-500 dark:text-zinc-500 mt-1 block">
                Contact support to modify your account primary email.
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-white/5 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto min-h-[42px] px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs rounded-xl shadow-[0_4px_16px_rgba(99,102,241,0.35)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isSaving ? 'Saving...' : 'Save Profile Details'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Compliance & Safety */}
      {activeTab === 'compliance' && (
        <div className="bg-white/90 dark:bg-[#121218]/80 border border-slate-200 dark:border-white/10 rounded-2xl p-6 lg:p-8 space-y-6 shadow-xs dark:shadow-xl backdrop-blur-md max-w-2xl">
          <div className="border-b border-slate-200 dark:border-white/5 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Instagram Community & Anti-Spam Compliance</h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
              Guarantees your account complies with Meta’s anti-spam rules and message frequency guidelines.
            </p>
          </div>

          <div className="space-y-4">
            {/* Safety Buffer Switch */}
            <div className="p-4 bg-slate-50 dark:bg-[#09090B]/60 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Meta Rate-Limit Safety Buffer
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 leading-normal">
                  Automatically throttles auto-replies if incoming volume approaches Instagram hourly limits.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEnableSafetyBuffer(!enableSafetyBuffer)}
                className="min-h-[44px] min-w-[52px] flex items-center justify-center shrink-0 cursor-pointer"
              >
                <div
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${
                    enableSafetyBuffer 
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 justify-end shadow-[0_0_10px_rgba(99,102,241,0.4)]' 
                      : 'bg-slate-300 dark:bg-white/10 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </div>
              </button>
            </div>

            {/* Blocked Keywords List */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Spam Keyword Blocklist (Never auto-reply if message contains):
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {blockedKws.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20 px-3 py-1 rounded-xl text-xs font-mono font-semibold"
                  >
                    {kw}
                    <button
                      type="button"
                      onClick={() => handleRemoveBlockedKeyword(kw)}
                      className="text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-200 ml-1 text-sm font-bold min-w-[20px] min-h-[20px] flex items-center justify-center cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newBlockedKw}
                  onChange={(e) => setNewBlockedKw(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBlockedKeyword())}
                  placeholder="Add blocked keyword or phrase..."
                  className="flex-1 bg-slate-50 dark:bg-[#09090B] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#09090B] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 min-h-[40px] transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddBlockedKeyword}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl transition-all min-h-[40px] cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Plan & Billing */}
      {activeTab === 'billing' && (
        <div className="bg-white/90 dark:bg-[#121218]/80 border border-slate-200 dark:border-white/10 rounded-2xl p-6 lg:p-8 space-y-6 shadow-xs dark:shadow-xl backdrop-blur-md max-w-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Subscription & Plan Tier</h2>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">View your active quotas and billing invoice status.</p>
            </div>
            <button
              onClick={() => navigate('/billing')}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
            >
              Manage in Billing
            </button>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-[#09090B]/60 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-zinc-400">Active Tier:</span>
              <span className="font-bold text-cyan-600 dark:text-cyan-400 uppercase font-mono">
                {planStatus?.current_plan || user?.plan || 'Free'} Plan
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-zinc-400">DM Quota Limit:</span>
              <span className="font-sans text-slate-900 dark:text-white font-bold">
                {String(planStatus?.current_plan || user?.plan || '').toLowerCase() === 'pro'
                  ? 'Unlimited'
                  : String(planStatus?.current_plan || user?.plan || '').toLowerCase() === 'starter'
                    ? '15,000 / mo'
                    : '500 / mo'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-zinc-400">Billing Cycle:</span>
              <span className="text-slate-900 dark:text-zinc-200 capitalize font-medium">
                {planStatus?.current_billing_cycle || 'Monthly'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
