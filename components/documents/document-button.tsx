'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { DocumentEndpointEnum } from '@/enum';
import { openDocument } from '@/helpers/documents.service';
import { extractErrorMessage } from '@/helpers/errors';

interface DocumentButtonProps {
  endpoint: DocumentEndpointEnum;
  id: string;
  children: React.ReactNode;
  className?: string;
}

const DEFAULT_CLASS =
  'inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink hover:bg-surface-raised disabled:opacity-60';

/** Opens an authenticated printable document (lab order, prescription, discharge, receipt) in a new tab. */
export default function DocumentButton({ endpoint, id, children, className = DEFAULT_CLASS }: DocumentButtonProps) {
  const [opening, setOpening] = useState(false);

  const open = async () => {
    setOpening(true);
    try {
      await openDocument(endpoint, id);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Couldn't open the document — retry"));
    } finally {
      setOpening(false);
    }
  };

  return (
    <button type="button" onClick={open} disabled={opening} aria-busy={opening} className={className}>
      {children}
    </button>
  );
}
