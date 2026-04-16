import React, { useRef, useState } from 'react';
import { AlertCircle, Plus, X } from 'lucide-react';
import { createRule, getInstagramStatus } from '../../lib/api';
import type { Rule, RuleCreatePayload, TriggerType } from '../../lib/types';
import { Modal } from '../ui/Modal';

interface RuleBuilderModalProps {
	open: boolean;
	onClose: () => void;
	onCreated: (rule: Rule) => void;
}

const TRIGGER_OPTIONS: { value: TriggerType; label: string; desc: string }[] = [
	{ value: 'keyword', label: 'Keyword Match', desc: 'Trigger when a DM contains specific keywords' },
	{ value: 'story_mention', label: 'Story Mention', desc: 'Trigger when someone mentions your story' },
	{ value: 'comment', label: 'Comment Reply', desc: 'Trigger when someone comments on your post' },
	{ value: 'new_dm', label: 'New DM Received', desc: 'Trigger on every new incoming DM' },
];

const TEMPLATE_VARS = ['{name}', '{username}', '{keyword}'];

function getErrorText(err: unknown): string {
	if (err instanceof Error && err.message) return err.message;
	if (typeof err === 'string') return err;
	try {
		return JSON.stringify(err);
	} catch {
		return 'Failed to create rule';
	}
}

export const RuleBuilderModal: React.FC<RuleBuilderModalProps> = ({ open, onClose, onCreated }) => {
	const [name, setName] = useState('');
	const [triggerType, setTriggerType] = useState<TriggerType>('keyword');
	const [keywords, setKeywords] = useState<string[]>([]);
	const [kwInput, setKwInput] = useState('');
	const [template, setTemplate] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const kwInputRef = useRef<HTMLInputElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const reset = () => {
		setName('');
		setTriggerType('keyword');
		setKeywords([]);
		setKwInput('');
		setTemplate('');
		setError('');
	};

	const handleClose = () => {
		reset();
		onClose();
	};

	const handleKwKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if ((e.key === 'Enter' || e.key === ',') && kwInput.trim()) {
			e.preventDefault();
			const kw = kwInput.trim().toLowerCase().replace(/,/g, '');
			if (kw && !keywords.includes(kw)) setKeywords((prev) => [...prev, kw]);
			setKwInput('');
		}
		if (e.key === 'Backspace' && !kwInput && keywords.length > 0) {
			setKeywords((prev) => prev.slice(0, -1));
		}
	};

	const removeKeyword = (kw: string) => {
		setKeywords((prev) => prev.filter((k) => k !== kw));
	};

	const insertVar = (v: string) => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const next = template.slice(0, start) + v + template.slice(end);
		setTemplate(next);

		setTimeout(() => {
			textarea.focus();
			textarea.setSelectionRange(start + v.length, start + v.length);
		}, 0);
	};

	const handleSubmit = async () => {
		if (!name.trim()) {
			setError('Rule name is required');
			return;
		}
		if (!template.trim()) {
			setError('Response template is required');
			return;
		}
		if (triggerType === 'keyword' && keywords.length === 0) {
			setError('Add at least one keyword for Keyword Match trigger');
			return;
		}

		setLoading(true);
		setError('');
		try {
			const igStatus = await getInstagramStatus();
			if (!igStatus?.connected) {
				setError('Connect Instagram first before creating automation rules. Go to the Instagram tab and connect your account.');
				return;
			}

			const payload: RuleCreatePayload = {
				name: name.trim(),
				trigger_type: triggerType,
				keywords: triggerType === 'keyword' ? keywords : [],
				response_template: template.trim(),
			};

			const created = await createRule(payload);
			onCreated(created);
			handleClose();
		} catch (err: unknown) {
			setError(getErrorText(err));
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal
			open={open}
			onClose={handleClose}
			title="New Automation Rule"
			maxWidth="max-w-xl"
			footer={
				<>
					<button
						onClick={handleClose}
						className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
					>
						Cancel
					</button>
					<button
						onClick={handleSubmit}
						disabled={loading}
						className="px-5 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
					>
						{loading ? (
							<>
								<svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
								</svg>
								Creating...
							</>
						) : (
							<>
								<Plus size={14} /> Create Rule
							</>
						)}
					</button>
				</>
			}
		>
			<div className="flex flex-col gap-5">
				{error && (
					<div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-3 py-2.5 text-sm">
						<AlertCircle size={14} className="flex-shrink-0" />
						{error}
					</div>
				)}

				<div className="form-group" style={{ marginBottom: 0 }}>
					<label className="form-label">Rule Name</label>
					<input
						type="text"
						className="form-input"
						placeholder="e.g. Reply to pricing inquiries"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
				</div>

				<div>
					<label className="form-label mb-2 block">Trigger Type</label>
					<div className="grid grid-cols-2 gap-2">
						{TRIGGER_OPTIONS.map((opt) => (
							<button
								key={opt.value}
								type="button"
								onClick={() => setTriggerType(opt.value)}
								className={`text-left px-3 py-2.5 rounded-xl border text-sm transition-all ${
									triggerType === opt.value
										? 'border-primary bg-indigo-50 text-primary'
										: 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
								}`}
							>
								<p className="font-semibold text-[0.8125rem]">{opt.label}</p>
								<p className={`text-xs mt-0.5 ${triggerType === opt.value ? 'text-indigo-400' : 'text-slate-400'}`}>
									{opt.desc}
								</p>
							</button>
						))}
					</div>
				</div>

				{triggerType === 'keyword' && (
					<div>
						<label className="form-label block mb-1.5">
							Keywords
							<span className="text-slate-400 font-normal ml-1.5 text-xs">Press Enter or comma to add</span>
						</label>
						<div className="keywords-container" onClick={() => kwInputRef.current?.focus()}>
							{keywords.map((kw) => (
								<span key={kw} className="keyword-tag">
									{kw}
									<button type="button" className="keyword-tag-remove" onClick={() => removeKeyword(kw)}>
										<X size={10} />
									</button>
								</span>
							))}
							<input
								ref={kwInputRef}
								type="text"
								className="keywords-input"
								placeholder={keywords.length === 0 ? 'price, buy, order...' : ''}
								value={kwInput}
								onChange={(e) => setKwInput(e.target.value)}
								onKeyDown={handleKwKeyDown}
							/>
						</div>
					</div>
				)}

				<div>
					<label className="form-label block mb-1.5">Response Template</label>
					<textarea
						ref={textareaRef}
						className="template-textarea"
						placeholder="Hi {name}! Thanks for reaching out. Here's what you need to know..."
						value={template}
						onChange={(e) => setTemplate(e.target.value)}
						rows={4}
					/>
					<div className="template-hint mt-2">
						<span className="text-slate-400 text-xs">Insert variable:</span>
						{TEMPLATE_VARS.map((v) => (
							<button key={v} type="button" className="template-var" onClick={() => insertVar(v)}>
								{v}
							</button>
						))}
					</div>
				</div>

				<p className="text-xs text-slate-400 text-right -mt-3">{template.length} / 1000 characters</p>
			</div>
		</Modal>
	);
};

