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
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 cursor-pointer" onClick={onClose} />
      <div className={`relative z-10 flex h-full max-w-full flex-col bg-white shadow-xl ${width}`}>
        <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 bg-green-900 px-4 py-4">
          <h2 className="text-md font-semibold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-red-500 hover:text-white cursor-pointer"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-8">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
