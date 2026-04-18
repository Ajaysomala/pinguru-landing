import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, Check, Plus, Sparkles, X } from 'lucide-react';
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

const COMMENT_TARGET_OPTIONS = [
	{ value: 'specific', label: 'Specific Post', desc: 'Select from existing posts and reels' },
	{ value: 'any', label: 'Any Post', desc: 'Works on all posts and reels' },
] as const;

const COMMENT_MEDIA_FILTERS = [
	{ value: 'all', label: 'All' },
	{ value: 'post', label: 'Posts' },
	{ value: 'reel', label: 'Reels' },
] as const;

const COMMENT_MEDIA_PREVIEW = [
	{ id: 'm1', type: 'post', label: 'Post' },
	{ id: 'm2', type: 'reel', label: 'Reel' },
	{ id: 'm3', type: 'post', label: 'Post' },
	{ id: 'm4', type: 'reel', label: 'Reel' },
	{ id: 'm5', type: 'post', label: 'Post' },
	{ id: 'm6', type: 'reel', label: 'Reel' },
] as const;

const TRIGGER_BADGE = 'quick';

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
	const [step, setStep] = useState<'choose' | 'details'>('choose');
	const [name, setName] = useState('');
	const [triggerType, setTriggerType] = useState<TriggerType | null>(null);
	const [commentTarget, setCommentTarget] = useState<(typeof COMMENT_TARGET_OPTIONS)[number]['value']>('specific');
	const [commentFilter, setCommentFilter] = useState<(typeof COMMENT_MEDIA_FILTERS)[number]['value']>('all');
	const [selectedMediaId, setSelectedMediaId] = useState<string>('m1');
	const [keywords, setKeywords] = useState<string[]>([]);
	const [kwInput, setKwInput] = useState('');
	const [template, setTemplate] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const kwInputRef = useRef<HTMLInputElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (open) {
			setStep('choose');
		}
	}, [open]);

	const reset = () => {
		setStep('choose');
		setName('');
		setTriggerType(null);
		setCommentTarget('specific');
		setCommentFilter('all');
		setSelectedMediaId('m1');
		setKeywords([]);
		setKwInput('');
		setTemplate('');
		setError('');
	};

	const handleClose = () => {
		reset();
		onClose();
	};

	const handleSelectTrigger = (trigger: TriggerType) => {
		setTriggerType(trigger);
		setError('');
		setStep('details');
	};

	const handleBack = () => {
		setStep('choose');
		setError('');
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
		if (!triggerType) {
			setError('Choose an automation type first');
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
			title={step === 'choose' ? 'Choose a Template' : triggerType === 'comment' ? 'Setup Comment to DM Flow' : 'Name your Automation'}
			maxWidth="max-w-3xl"
			footer={
				step === 'details' ? (
					<>
						<button
							onClick={handleBack}
							disabled={loading}
							className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
						>
							<span className="inline-flex items-center gap-1.5">
								<ArrowLeft size={14} />
								Back
							</span>
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
				) : (
					<button
						onClick={handleClose}
						className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
					>
						Cancel
					</button>
				)
			}
		>
			<div className="flex flex-col gap-5">
				{error && (
					<div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-3 py-2.5 text-sm">
						<AlertCircle size={14} className="flex-shrink-0" />
						{error}
					</div>
				)}

				{step === 'choose' ? (
					<div className="template-picker-shell">
						<div className="template-picker-copy">
							<p className="template-picker-eyebrow">
								<Sparkles size={14} /> Quick setup
							</p>
							<p className="template-picker-subtitle">Pick the type of automation you want to build.</p>
						</div>
						<div className="template-grid">
							{TRIGGER_OPTIONS.map((opt) => (
								<button key={opt.value} type="button" onClick={() => handleSelectTrigger(opt.value)} className="template-card">
									<div className="template-card-head">
										<p className="template-card-title">{opt.label}</p>
										<span className="template-card-badge">{TRIGGER_BADGE}</span>
									</div>
									<p className="template-card-desc">{opt.desc}</p>
								</button>
							))}
						</div>
					</div>
				) : (
					<div className="flex flex-col gap-5">
						<div className="selected-template-card">
							<div className="selected-template-icon">
								<Check size={16} />
							</div>
							<div>
								<p className="selected-template-title">{TRIGGER_OPTIONS.find((opt) => opt.value === triggerType)?.label}</p>
								<p className="selected-template-desc">{TRIGGER_OPTIONS.find((opt) => opt.value === triggerType)?.desc}</p>
							</div>
						</div>

						{triggerType === 'comment' && (
							<div className="wizard-section">
								<div className="wizard-section-header">
									<span className="wizard-step-dot">1</span>
									<div>
										<p className="wizard-section-title">Select a Post</p>
										<p className="wizard-section-subtitle">Choose whether the comment flow should target a specific post, the next one, or any post.</p>
									</div>
								</div>
								<div className="wizard-option-list">
									{COMMENT_TARGET_OPTIONS.map((option) => (
										<button
											key={option.value}
											type="button"
											onClick={() => setCommentTarget(option.value)}
											className={`wizard-option ${commentTarget === option.value ? 'active' : ''}`}
										>
											<span className="wizard-option-radio" aria-hidden="true">
												<span />
											</span>
											<div>
												<p className="wizard-option-title">{option.label}</p>
												<p className="wizard-option-desc">{option.desc}</p>
											</div>
										</button>
									))}
								</div>

								<div className="wizard-media-shell">
									<div className="wizard-media-header">
										<p className="wizard-section-title">Choose a Post</p>
										<div className="wizard-filter-row">
											{COMMENT_MEDIA_FILTERS.map((filter) => (
												<button
													key={filter.value}
													type="button"
													onClick={() => setCommentFilter(filter.value)}
													className={`wizard-filter-pill ${commentFilter === filter.value ? 'active' : ''}`}
												>
													{filter.label}
												</button>
											))}
										</div>
									</div>
									<div className="wizard-media-grid">
										{COMMENT_MEDIA_PREVIEW.filter((item) => commentFilter === 'all' || item.type === commentFilter).map((item) => (
											<button
												key={item.id}
												type="button"
												onClick={() => setSelectedMediaId(item.id)}
												className={`wizard-media-card ${selectedMediaId === item.id ? 'active' : ''}`}
											>
												<span className={`wizard-media-thumb ${item.type}`}>
													{item.type === 'post' ? '▣' : '▶'}
												</span>
												<span className="wizard-media-label">{item.label}</span>
											</button>
										))}
									</div>
									<button type="button" className="wizard-show-more">Show More</button>
								</div>
							</div>
						)}

						<div className="form-group" style={{ marginBottom: 0 }}>
							<label className="form-label">Automation Name</label>
							<input
								type="text"
								className="form-input"
								placeholder="e.g. Reply to pricing inquiries"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
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
				)}
			</div>
		</Modal>
	);
};

