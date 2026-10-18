export default function BillingLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="h-6 w-48 rounded bg-line" />
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg border border-line bg-surface-raised" />
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
        <div className="h-10 border-b border-line bg-surface" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 border-b border-line last:border-0" />
        ))}
      </div>
    </div>
  );
}
