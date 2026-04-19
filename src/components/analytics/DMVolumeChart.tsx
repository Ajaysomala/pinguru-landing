import React from 'react';
import { Link } from 'react-router-dom';
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { ChevronRight, Lock, MessageSquare } from 'lucide-react';
import type { AnalyticsData } from '../../lib/types';

interface DMVolumeChartProps {
	isLocked: boolean;
	loading: boolean;
	data: AnalyticsData[];
	days: 7 | 30;
	onDaysChange: (days: 7 | 30) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
	if (!active || !payload?.length) return null;

	return (
		<div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2.5 text-xs">
			<p className="font-semibold text-slate-700 mb-1">{label}</p>
			<p className="text-indigo-600 font-bold">{payload[0]?.value ?? 0} DMs sent</p>
			{payload[1] && <p className="text-emerald-600">{payload[1]?.value ?? 0} successful</p>}
		</div>
	);
};

export const DMVolumeChart: React.FC<DMVolumeChartProps> = ({
	isLocked,
	loading,
	data,
	days,
	onDaysChange,
}) => {
	return (
		<div className="chart-card">
			<div className="chart-header">
				<h3 className="chart-title">DM Volume</h3>
				{!isLocked && (
					<div className="chart-toggle">
						{([7, 30] as const).map((range) => (
							<button
								key={range}
								className={`chart-toggle-btn ${days === range ? 'active' : ''}`}
								onClick={() => onDaysChange(range)}
							>
								{range === 7 ? '7 days' : '30 days'}
							</button>
						))}
					</div>
				)}
			</div>

			{isLocked ? (
				<div className="gated-overlay">
					<div className="gated-blur h-56 flex items-end gap-1 px-4 pb-4">
						{[40, 65, 35, 80, 50, 90, 45, 70, 55, 85, 30, 75, 60, 95].map((height, i) => (
							<div key={i} className="flex-1 bg-indigo-200 rounded-t-sm" style={{ height: `${height}%` }} />
						))}
					</div>
					<div className="gated-message">
						<div className="gated-icon">
							<Lock size={20} />
						</div>
						<p className="gated-title">Premium analytics is locked</p>
						<p className="gated-desc">Upgrade to Starter or Pro to see your DM volume charts and success rate.</p>
						<Link
							to="/billing"
							className="inline-flex items-center gap-1 mt-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
						>
							Upgrade now <ChevronRight size={13} />
						</Link>
					</div>
				</div>
			) : loading ? (
				<div className="flex justify-center items-center h-56">
					<svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none">
						<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
						<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
					</svg>
				</div>
			) : data.length === 0 ? (
				<div className="flex flex-col items-center justify-center h-56 text-slate-400">
					<MessageSquare size={32} className="mb-2 opacity-30" />
					<p className="text-sm">No data for this period yet</p>
				</div>
			) : (
				<ResponsiveContainer width="100%" height={240}>
					<AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
						<defs>
							<linearGradient id="dmGradient" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15} />
								<stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
							</linearGradient>
							<linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.15} />
								<stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
						<XAxis
							dataKey="date"
							tick={{ fontSize: 11, fill: '#94A3B8' }}
							tickLine={false}
							axisLine={false}
							tickFormatter={(value) =>
								new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
							}
						/>
						<YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
						<Tooltip content={<CustomTooltip />} />
						<Area
							type="monotone"
							dataKey="dms_sent"
							name="DMs Sent"
							stroke="var(--color-primary)"
							strokeWidth={2.5}
							fill="url(#dmGradient)"
							dot={false}
							activeDot={{ r: 4, strokeWidth: 0 }}
						/>
						<Area
							type="monotone"
							dataKey="success_count"
							name="Successful"
							stroke="var(--color-success)"
							strokeWidth={2}
							fill="url(#successGradient)"
							dot={false}
							activeDot={{ r: 4, strokeWidth: 0 }}
						/>
					</AreaChart>
				</ResponsiveContainer>
			)}

			{!isLocked && !loading && data.length > 0 && (
				<div className="flex items-center gap-5 mt-3 pt-3 border-t border-slate-100">
					<div className="flex items-center gap-1.5 text-xs text-slate-500">
						<span className="w-3 h-0.5 bg-primary rounded-full inline-block" />DMs Sent
					</div>
					<div className="flex items-center gap-1.5 text-xs text-slate-500">
						<span className="w-3 h-0.5 bg-success rounded-full inline-block" />Successful
					</div>
				</div>
			)}
		</div>
	);
};

