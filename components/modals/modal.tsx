'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { IModalProps } from '@/interfaces';

export default function Modal({ open, onClose, title, children }: IModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button type="button" aria-label="Close dialog" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-surface-raised shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="modal-title" className="text-lg font-semibold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-ink-muted transition hover:bg-surface hover:text-ink"
          >
            ✕
          </button>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </div>,
    document.body,
  );
}
