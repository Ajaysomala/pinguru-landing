import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  open, onClose, title, children, footer, maxWidth = 'max-w-lg'
}) => {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const content = (
    <div
      className="pg-modal-overlay fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(15,10,30,0.62)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`pg-modal-sheet bg-white shadow-2xl w-full ${maxWidth} max-h-[92dvh] sm:max-h-[90vh] flex flex-col animate-[scaleIn_0.2s_ease-out] rounded-t-3xl sm:rounded-2xl`}>
        <div className="mx-auto mt-2 mb-1 h-1 w-10 rounded-full bg-slate-200 sm:hidden" aria-hidden="true" />
        <div className="flex items-center justify-between px-5 sm:px-6 pt-3 sm:pt-5 pb-0 flex-shrink-0">
          <h2 className="font-display font-bold text-lg text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 sm:px-6 py-4 sm:py-5 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="px-5 sm:px-6 py-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 flex-shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
