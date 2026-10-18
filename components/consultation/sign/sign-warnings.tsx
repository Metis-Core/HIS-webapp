import { FaExclamationTriangle } from 'react-icons/fa';

export interface SignEncounterWarning {
  message: string;
  severity?: 'warning' | 'critical';
}

const tone = {
  critical: 'border-critical/40 bg-critical-soft text-critical',
  warning: 'border-watch/40 bg-watch-soft text-watch',
};

export default function SignWarnings({ warnings }: { warnings: SignEncounterWarning[] }) {
  if (warnings.length === 0) return null;
  const ordered = [...warnings].sort((a, b) => Number(b.severity === 'critical') - Number(a.severity === 'critical'));
  return (
    <section className="flex flex-col gap-2">
      {ordered.map((w, i) => (
        <div
          key={i}
          className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${tone[w.severity === 'critical' ? 'critical' : 'warning']}`}
        >
          <FaExclamationTriangle className="mt-0.5 shrink-0" />
          <span>{w.message}</span>
        </div>
      ))}
    </section>
  );
}
