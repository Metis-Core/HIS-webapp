import { PageHeader } from '@/components';
import TriageWorkspace from '@/components/queue/triage-workspace';

export default function TriagePage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Triage" description="Take vitals, set acuity, and send patients to the doctor." />
      <TriageWorkspace />
    </div>
  );
}
