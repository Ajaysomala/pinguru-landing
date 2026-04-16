import React from 'react';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface Step {
  id: string;
  label: string;
  done: boolean;
  href: string;
}

interface StepChecklistProps {
  steps: Step[];
}

export const StepChecklist: React.FC<StepChecklistProps> = ({ steps }) => (
  <div className="flex flex-col gap-2">
    {steps.map((step, i) => (
      <Link
        key={step.id}
        to={step.done ? '#' : step.href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
          step.done
            ? 'opacity-60 cursor-default'
            : 'hover:bg-indigo-50 cursor-pointer group'
        }`}
      >
        {step.done ? (
          <CheckCircle size={18} className="text-success flex-shrink-0" />
        ) : (
          <Circle size={18} className="text-slate-300 flex-shrink-0" />
        )}
        <span className={`text-sm flex-1 ${step.done ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
          {i + 1}. {step.label}
        </span>
        {!step.done && (
          <ArrowRight size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
        )}
      </Link>
    ))}
  </div>
);
