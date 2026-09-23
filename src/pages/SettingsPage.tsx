import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  User, 
  ShieldCheck, 
  CreditCard, 
  Check, 
  Clock, 
  ExternalLink,
  Zap,
  Sparkles
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

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30">
            <Settings className="w-5 h-5 text-purple-400" />
          </div>
          <span>Settings & Workspace</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your account profile, compliance anti-spam protections, and subscription plan.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="bg-gradient-to-r from-slate-900/90 to-slate-950/90 border border-white/[0.08] rounded-3xl p-1.5 flex items-center gap-1 overflow-x-auto text-xs no-scrollbar shadow-lg">
        {[
          { id: 'profile', label: 'Workspace & Profile', icon: User },
          { id: 'compliance', label: 'Compliance & Safety', icon: ShieldCheck },
          { id: 'billing', label: 'Plan & Billing', icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`min-h-[40px] px-4 py-2 rounded-2xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profile & Workspace */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-white/[0.08] rounded-3xl p-5 sm:p-7 space-y-5 shadow-xl max-w-2xl">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white">Account Information</h2>
            <p className="text-xs text-slate-400">Update your public profile and workspace identity.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full bg-slate-950 border border-white/[0.08] rounded-2xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500 min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/[0.08] rounded-2xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500 min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/[0.08] rounded-2xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500 min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full bg-slate-950/60 border border-white/[0.05] rounded-2xl px-3.5 py-2.5 text-xs text-slate-400 focus:outline-none min-h-[44px] cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Contact support to modify your account primary email.
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-purple-600/25 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isSaving ? 'Saving...' : 'Save Profile Details'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Compliance & Safety */}
      {activeTab === 'compliance' && (
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-white/[0.08] rounded-3xl p-5 sm:p-7 space-y-6 shadow-xl max-w-2xl">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white">Instagram Community & Anti-Spam Compliance</h2>
            <p className="text-xs text-slate-400">
              Guarantees your account complies with Meta’s anti-spam rules and message frequency guidelines.
            </p>
          </div>

          <div className="space-y-4">
            {/* Safety Buffer Switch */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/[0.06] flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  Meta Rate-Limit Safety Buffer
                </span>
                <span className="text-[11px] text-slate-400 leading-normal">
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
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 justify-end shadow-md shadow-purple-600/30' 
                      : 'bg-slate-800 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </div>
              </button>
            </div>

            {/* Blocked Keywords List */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Spam Keyword Blocklist (Never auto-reply if message contains):
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {blockedKws.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1.5 bg-slate-950 text-rose-300 border border-rose-500/25 px-3 py-1 rounded-xl text-xs font-mono"
                  >
                    {kw}
                    <button
                      type="button"
                      onClick={() => handleRemoveBlockedKeyword(kw)}
                      className="text-slate-400 hover:text-rose-400 ml-1 text-sm font-bold min-w-[20px] min-h-[20px] flex items-center justify-center cursor-pointer"
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
                  className="flex-1 bg-slate-950 border border-white/[0.08] rounded-2xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 min-h-[40px]"
                />
                <button
                  type="button"
                  onClick={handleAddBlockedKeyword}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-2xl transition-colors min-h-[40px] cursor-pointer"
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
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-white/[0.08] rounded-3xl p-5 sm:p-7 space-y-6 shadow-xl max-w-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">Subscription & Plan Tier</h2>
              <p className="text-xs text-slate-400">View your active quotas and billing invoice status.</p>
            </div>
            <button
              onClick={() => navigate('/billing')}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-2xl shadow-md cursor-pointer"
            >
              Manage in Billing
            </button>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Active Tier:</span>
              <span className="font-bold text-purple-300 uppercase font-mono">
                {planStatus?.current_plan || user?.plan || 'Free'} Plan
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">DM Quota Limit:</span>
              <span className="font-mono text-white font-bold">
                {(planStatus?.current_plan || user?.plan) === 'pro'
                  ? 'Unlimited'
                  : (planStatus?.current_plan || user?.plan) === 'starter'
                    ? '15,000 / mo'
                    : '500 / mo'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Billing Cycle:</span>
              <span className="font-mono text-slate-300 capitalize">
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
