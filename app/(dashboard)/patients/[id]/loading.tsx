export default function PatientDetailLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-24 rounded-lg border border-line bg-surface-raised" />
      <div className="h-10 rounded bg-line/60" />
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 rounded-lg border border-line bg-surface-raised" />
        ))}
      </div>
    </div>
  );
}
