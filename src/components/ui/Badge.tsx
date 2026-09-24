import React from 'react';
import { classNames } from '../../lib/utils';

type BadgeVariant = 'green' | 'red' | 'amber' | 'indigo' | 'gray';

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  green:  'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  red:    'bg-rose-50 text-rose-700 border border-rose-200/60',
  amber:  'bg-amber-50 text-amber-700 border border-amber-200/60',
  indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
  gray:   'bg-slate-100 text-slate-600 border border-slate-200/60',
};

const dotColors: Record<BadgeVariant, string> = {
  green:  'bg-emerald-500',
  red:    'bg-rose-500',
  amber:  'bg-amber-500',
  indigo: 'bg-primary',
  gray:   'bg-slate-400',
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'gray', dot = false, children, className }) => (
  <span className={classNames(
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold',
    variantClasses[variant], className,
  )}>
    {dot && <span className={classNames('w-1.5 h-1.5 rounded-full animate-pulse', dotColors[variant])} />}
    {children}
  </span>
);
