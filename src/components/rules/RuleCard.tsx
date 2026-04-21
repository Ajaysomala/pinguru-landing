import React from 'react';
import { PencilLine, Trash2, Zap } from 'lucide-react';
import type { Rule } from '../../lib/types';
import { TRIGGER_LABELS } from '../../lib/types';
import { Badge } from '../ui/Badge';
import { Toggle } from '../ui/Toggle';

interface RuleCardProps {
	rule: Rule;
	isToggling?: boolean;
	isDeleting?: boolean;
	confirmingDelete?: boolean;
	onToggle: (rule: Rule) => void;
	onEdit: (rule: Rule) => void;
	onRequestDelete: (ruleId: string) => void;
	onCancelDelete: () => void;
	onDelete: (ruleId: string) => void;
	style?: React.CSSProperties;
}

export const RuleCard: React.FC<RuleCardProps> = ({
	rule,
	isToggling = false,
	isDeleting = false,
	confirmingDelete = false,
	onToggle,
	onEdit,
	onRequestDelete,
	onCancelDelete,
	onDelete,
	style,
}) => {
	return (
		<div className={`rule-card ${rule.is_active ? '' : 'inactive'}`} style={style}>
			<div className="rule-icon">
				<Zap size={16} />
			</div>

			<div className="rule-info">
				<p className="rule-name">{rule.name}</p>
				<div className="flex items-center gap-2 mt-1 flex-wrap">
					<Badge variant="indigo">{TRIGGER_LABELS[rule.trigger_type]}</Badge>
					{rule.keywords?.length > 0 && (
						<span className="text-xs text-slate-400">
							{rule.keywords.slice(0, 3).join(', ')}
							{rule.keywords.length > 3 && ` +${rule.keywords.length - 3} more`}
						</span>
					)}
					{rule.dm_count !== undefined && (
						<span className="text-xs text-slate-400">{rule.dm_count} DMs sent</span>
					)}
				</div>
			</div>

			<div className="rule-actions">
				<button
					onClick={() => onEdit(rule)}
					className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
					title="Edit rule"
				>
					<PencilLine size={14} />
				</button>

				<Toggle
					checked={rule.is_active}
					onChange={() => onToggle(rule)}
					disabled={isToggling}
				/>

				{confirmingDelete ? (
					<div className="flex items-center gap-1.5">
						<button
							onClick={() => onDelete(rule.id)}
							disabled={isDeleting}
							className="text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
						>
							{isDeleting ? '...' : 'Delete'}
						</button>
						<button
							onClick={onCancelDelete}
							className="text-xs font-medium text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
						>
							Cancel
						</button>
					</div>
				) : (
					<button
						onClick={() => onRequestDelete(rule.id)}
						className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
						title="Delete rule"
					>
						<Trash2 size={14} />
					</button>
				)}
			</div>
		</div>
	);
};

