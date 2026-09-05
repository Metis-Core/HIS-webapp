/* Skeleton shape matches the actual list layout (AGENTS.md §5). */
export default function PatientsLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-2">
          <div className="h-6 w-32 rounded bg-line" />
          <div className="h-4 w-64 rounded bg-line/70" />
        </div>
        <div className="h-9 w-32 rounded-md bg-line" />
      </div>
      <div className="h-10 rounded-md bg-line/70" />
      <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
        <div className="h-10 border-b border-line bg-surface" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-line px-6 py-4 last:border-0">
            <div className="h-10 w-10 shrink-0 rounded-full bg-line" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3 w-40 rounded bg-line" />
              <div className="h-3 w-24 rounded bg-line/60" />
            </div>
            <div className="h-3 w-32 rounded bg-line/60" />
            <div className="h-3 w-24 rounded bg-line/60" />
            <div className="h-5 w-16 rounded-full bg-line/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
