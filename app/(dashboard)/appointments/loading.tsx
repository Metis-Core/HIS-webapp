export default function AppointmentsLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="h-6 w-40 rounded bg-line" />
      <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
        <div className="h-10 border-b border-line bg-surface" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 border-b border-line last:border-0" />
        ))}
      </div>
    </div>
  );
}
