import { format } from 'date-fns';
import PatientRecordsPanel, { RecordCard } from './patient-records-panel';

type Visit = {
  id: string;
  status: string;
  visitType: string;
  createdAt: string;
};

export default function PatientAppointmentsTab({ patientId }: { patientId: string }) {
  return (
    <PatientRecordsPanel<Visit>
      url={`/visits?patientId=${patientId}&visitType=appointment`}
      emptyMessage="No appointments scheduled."
      renderItem={(item) => (
        <RecordCard
          title="Appointment"
          meta={format(new Date(item.createdAt), 'dd MMM yyyy')}
          badge={item.status.replaceAll('_', ' ')}
        />
      )}
    />
  );
}
