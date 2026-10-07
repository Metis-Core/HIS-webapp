'use client';

import type { ReactNode } from 'react';

interface PageHeaderProps {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
      <div>
        {title && <h2 className="text-2xl font-semibold tracking-tight text-ink">{title}</h2>}
        {description && <p className={`max-w-2xl text-sm text-ink-muted ${title ? 'mt-1' : ''}`}>{description}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
