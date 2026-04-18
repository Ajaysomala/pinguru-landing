import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ReceiptRefundIcon, CheckCircle, AlertTriangle } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || 'https://api.pinguru.me').replace(/\/$/, '');

const RefundPage: React.FC = () => {
  const [reason, setReason]       = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState('');
  const [error, setError]         = useState('');

  const handleSubmit = async () => {
    if (!reason.trim()) { setError('Please describe your reason for refund.'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`${API}/billing/refund`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim(), payment_id: paymentId.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to submit refund request');
      setSuccess(data.message);
      setReason(''); setPaymentId('');
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">

        <Link to="/billing" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Billing
        </Link>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-primary flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-900">Refund Request</h1>
              <p className="text-xs text-slate-500 mt-0.5">We review all refund requests within 5 business days</p>
            </div>
          </div>

          <div className="px-6 py-6 space-y-5">

            {/* Policy summary */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 space-y-1">
              <p className="font-semibold flex items-center gap-1.5"><AlertTriangle size={14}/> Refund Policy</p>
              <ul className="text-xs space-y-0.5 text-amber-700 list-disc list-inside">
                <li>Refunds eligible within <strong>7 days</strong> of payment if service was not used.</li>
                <li>No refunds for partial months or after automation rules have been triggered.</li>
                <li>Refunds processed back to original payment method within 5–7 business days after approval.</li>
              </ul>
            </div>

            {success && (
              <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">
                <CheckCircle size={15} className="flex-shrink-0 mt-0.5"/>
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm">
                <AlertTriangle size={15} className="flex-shrink-0 mt-0.5"/>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Razorpay Payment ID <span className="text-slate-400 font-normal">(optional)</span></label>
              <input
                type="text"
                value={paymentId}
                onChange={e => setPaymentId(e.target.value)}
                placeholder="pay_xxxxx (find in your email receipt)"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Reason for refund <span className="text-rose-500">*</span></label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Please describe why you are requesting a refund..."
                rows={4}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              />
              <p className="text-xs text-slate-400">{reason.length}/500</p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !reason.trim()}
              className="w-full py-2.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Submitting…' : 'Submit Refund Request'}
            </button>

            <p className="text-xs text-slate-400 text-center">
              Questions? Email <a href="mailto:support@pinguru.me" className="text-primary hover:underline">support@pinguru.me</a>
            </p>
          </div>
        </div>

        {/* Policy detail */}
        <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-slate-800">Full Refund Policy</h2>
          <div className="text-xs text-slate-600 space-y-2">
            <p><strong>Eligibility:</strong> You may request a refund within 7 calendar days of your subscription payment if you have not used any DM automation features (no rules triggered, no DMs sent).</p>
            <p><strong>Non-refundable cases:</strong> Refunds will not be issued if automation rules have been active and DMs have been sent during the billing period, or if the request is made after 7 days from payment.</p>
            <p><strong>Process:</strong> Submit this form with your payment ID. Our team reviews within 5 business days. Approved refunds are returned to your original Razorpay/UPI/card within 5–7 additional business days.</p>
            <p><strong>Cancellation:</strong> You can cancel your subscription anytime from Billing settings. Cancellation stops future charges but does not automatically trigger a refund for the current period.</p>
            <p><strong>Contact:</strong> For urgent billing issues email <a href="mailto:support@pinguru.me" className="text-primary hover:underline">support@pinguru.me</a> with subject "Refund Request".</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RefundPage;
