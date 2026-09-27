'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { IDrawerProps } from '@/interfaces';
import { FaTimes } from 'react-icons/fa';

export default function Drawer({ open, onClose, title, children, width = 'w-225' }: IDrawerProps) {
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
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button type="button" aria-label="Close drawer" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={`relative z-10 flex h-full max-w-full flex-col bg-surface-raised shadow-2xl ${width}`}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-line bg-brand px-5 py-4">
          <h2 id="drawer-title" className="text-lg font-semibold text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">{children}</div>
      </section>
    </div>,
    document.body,
  );
}
