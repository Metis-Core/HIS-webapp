export default function QueueLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-2">
        <div className="h-6 w-24 rounded bg-line" />
        <div className="h-4 w-72 rounded bg-line/70" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg border border-line bg-surface-raised" />
        ))}
      </div>
      <div className="h-10 rounded-md bg-line/60" />
      <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
        <div className="h-10 border-b border-line bg-surface" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 border-b border-line last:border-0" />
        ))}
      </div>
    </div>
  );
}
