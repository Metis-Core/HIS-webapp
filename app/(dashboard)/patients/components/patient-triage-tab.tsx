import { format } from 'date-fns';
import PatientRecordsPanel, { RecordCard } from './patient-records-panel';

type Triage = {
  id: string;
  acuity: string;
  status: string;
  chiefComplaint: string;
  createdAt: string;
};

export default function PatientTriageTab({ patientId }: { patientId: string }) {
  return (
    <PatientRecordsPanel<Triage>
      url={`/triage/patient/${patientId}`}
      selectItems={(data) => data ?? []}
      emptyMessage="No triage records found."
      renderItem={(item) => (
        <RecordCard
          title={item.chiefComplaint}
          meta={format(new Date(item.createdAt), 'dd MMM yyyy')}
          badge={item.acuity}
          note={item.status}
        />
      )}
    />
  );
}
