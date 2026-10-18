export default function ManagementLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="h-6 w-64 rounded bg-line" />
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg border border-line bg-surface-raised" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 rounded-lg border border-line bg-surface-raised" />
        ))}
      </div>
    </div>
  );
}
