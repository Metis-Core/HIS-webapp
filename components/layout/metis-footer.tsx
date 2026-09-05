'use client';

interface MetisFooterProps {
  compact?: boolean;
  className?: string;
}

const year = new Date().getFullYear();

export default function MetisFooter({ compact = false, className = '' }: MetisFooterProps) {
  return (
    <div
      className={`flex items-center justify-center gap-2 px-3 ${compact ? 'py-1.5' : 'py-2'} text-[11px] text-ink-muted ${className}`}
    >
      <img src="/logo-dark.png" alt="Metis Analytica" className={compact ? 'h-3 w-auto' : 'h-4 w-auto'} />
      <span>
        © {year} <span className="font-semibold text-ink">Metis Analytica</span> · All rights reserved
      </span>
    </div>
  );
}
