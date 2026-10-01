import React, { useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  id?: string;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-lg',
  id,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const titleId = id ? `${id}-title` : `modal-title-${reactId.replace(/:/g, '')}`;

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useFocusTrap(modalRef, open, onClose);

  if (!open) return null;

  const content = (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Excluded from accessibility tree & tab order backdrop */}
      <div
        className="pg-modal-overlay fixed inset-0"
        style={{ background: 'rgba(9, 9, 11, 0.80)', backdropFilter: 'blur(10px)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Accessible Dialog container */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`pg-modal-sheet relative z-10 bg-white dark:bg-[#121218]/95 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white backdrop-blur-xl shadow-2xl w-full ${maxWidth} max-h-[92dvh] sm:max-h-[90vh] flex flex-col animate-[scaleIn_0.2s_ease-out] rounded-t-3xl sm:rounded-2xl outline-none`}
      >
        <div className="mx-auto mt-2 mb-1 h-1 w-10 rounded-full bg-slate-300 dark:bg-white/20 sm:hidden" aria-hidden="true" />
        <div className="flex items-center justify-between px-5 sm:px-6 pt-3 sm:pt-5 pb-0 flex-shrink-0">
          <h2 id={titleId} className="font-display font-bold text-lg text-slate-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 sm:px-6 py-4 sm:py-5 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="px-5 sm:px-6 py-4 border-t border-slate-200 dark:border-white/10 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 flex-shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
