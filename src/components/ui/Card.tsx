import React from 'react';
import { classNames } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, padding = true }) => (
  <div className={classNames(
    'bg-white border border-slate-200 rounded-xl shadow-sm',
    padding ? 'p-5' : '',
    className,
  )}>
    {children}
  </div>
);

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, action, className }) => (
  <div className={classNames('flex items-start justify-between mb-4', className)}>
    <div>
      <h3 className="font-display font-semibold text-slate-900 text-[0.9375rem]">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0 ml-4">{action}</div>}
  </div>
);
