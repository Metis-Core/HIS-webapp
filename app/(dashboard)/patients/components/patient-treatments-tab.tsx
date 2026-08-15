import { format } from 'date-fns';
import PatientRecordsPanel, { RecordCard } from './patient-records-panel';

type Consultation = {
  id: string;
  type: string;
  status: string;
  department: string;
  chiefComplaint: string;
  createdAt: string;
};

export default function PatientTreatmentsTab({ patientId }: { patientId: string }) {
  return (
    <PatientRecordsPanel<Consultation>
      url={`/consultations/patient/${patientId}`}
      selectItems={(data) => data ?? []}
      emptyMessage="No treatments recorded."
      renderItem={(item) => (
        <RecordCard
          title={item.chiefComplaint}
          meta={`${item.department} · ${format(new Date(item.createdAt), 'dd MMM yyyy')}`}
          badge={item.status}
          note={item.type}
        />
      )}
    />
  );
}
