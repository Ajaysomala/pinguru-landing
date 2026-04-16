import React from 'react';
import { Check, CreditCard, Zap } from 'lucide-react';

export interface BillingPlan {
	id: 'free' | 'starter' | 'pro';
	name: string;
	priceInr: number;
	description: string;
	dmLimit: string;
	ruleLimit: string;
	features: string[];
	popular?: boolean;
}

interface PlanCardProps {
	plan: BillingPlan;
	isCurrent: boolean;
	isUpgrade: boolean;
	upgrading?: boolean;
	onUpgrade: () => void;
	onManage: () => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({
	plan,
	isCurrent,
	isUpgrade,
	upgrading = false,
	onUpgrade,
	onManage,
}) => {
	return (
		<div className={`plan-card ${plan.popular && !isCurrent ? 'popular' : ''} ${isCurrent ? 'current' : ''}`}>
			{isCurrent && <div className="plan-badge current-badge">Current Plan</div>}
			{plan.popular && !isCurrent && <div className="plan-badge">Most Popular</div>}

			<div className="plan-name">{plan.name}</div>
			<div className="plan-description">{plan.description}</div>

			<div className="plan-price">
				{plan.priceInr === 0 ? (
					<>
						<span className="plan-price-amount">Rs0</span>
						<span className="plan-price-period">forever</span>
					</>
				) : (
					<>
						<span className="plan-price-currency">Rs</span>
						<span className="plan-price-amount">{plan.priceInr}</span>
						<span className="plan-price-period">/mo</span>
					</>
				)}
			</div>

			<div className="flex flex-col gap-1.5 mb-4">
				<div className="flex items-center gap-2 text-sm">
					<Zap size={13} className="text-primary flex-shrink-0" />
					<span className="font-medium text-slate-700">{plan.ruleLimit}</span>
				</div>
				<div className="flex items-center gap-2 text-sm">
					<CreditCard size={13} className="text-slate-400 flex-shrink-0" />
					<span className="text-slate-600">{plan.dmLimit}</span>
				</div>
			</div>

			<div className="plan-divider" />

			<ul className="plan-features">
				{plan.features.map((feature) => (
					<li key={feature} className="plan-feature">
						<div className="plan-feature-check">
							<Check size={10} />
						</div>
						{feature}
					</li>
				))}
			</ul>

			{isCurrent ? (
				<button disabled className="w-full py-2.5 text-sm font-semibold text-slate-400 bg-slate-100 rounded-xl cursor-not-allowed">
					Current Plan
				</button>
			) : isUpgrade ? (
				<button
					onClick={onUpgrade}
					disabled={upgrading}
					className="w-full py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
				>
					{upgrading ? (
						<>
							<svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
							</svg>
							Redirecting...
						</>
					) : (
						`Upgrade to ${plan.name}`
					)}
				</button>
			) : (
				<button
					onClick={onManage}
					className="w-full py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
				>
					Downgrade
				</button>
			)}
		</div>
	);
};

