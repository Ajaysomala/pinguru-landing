import React from 'react';
import { classNames } from '../../lib/utils';

type Variant = 'primary' | 'ghost' | 'danger' | 'outline' | 'success';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-indigo-700 shadow-sm active:scale-[0.98]',
  ghost:   'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger:  'bg-danger text-white hover:bg-rose-600 shadow-sm active:scale-[0.98]',
  outline: 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50',
  success: 'bg-success text-white hover:bg-emerald-600 shadow-sm active:scale-[0.98]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-lg',
  md: 'px-4 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary', size = 'md', loading = false,
  icon, fullWidth = false, children, className, disabled, ...props
}) => (
  <button
    className={classNames(
      'inline-flex items-center justify-center font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
      variantClasses[variant], sizeClasses[size],
      fullWidth ? 'w-full' : '', className,
    )}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? (
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    ) : icon}
    {children}
  </button>
);
