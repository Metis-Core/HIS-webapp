'use client';

interface MetisFooterProps {
  compact?: boolean;
  className?: string;
}

const year = new Date().getFullYear();

export default function MetisFooter({ compact = false, className = '' }: MetisFooterProps) {
  if (compact) {
    return (
      <div
        className={`flex items-center justify-center gap-1 px-2 py-2 text-[10px] font-medium text-ink-muted ${className}`}
        title={`© ${year} Metis Analytica · All rights reserved`}
      >
        <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-brand text-[8px] font-bold text-white">
          M
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] text-ink-muted ${className}`}>
      <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-brand text-[9px] font-bold text-white">
        M
      </span>
      <span>
        © {year} <span className="font-semibold text-ink">Metis Analytica</span> · All rights reserved
      </span>
    </div>
  );
}
