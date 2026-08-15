import { format } from 'date-fns';
import PatientRecordsPanel, { RecordCard } from './patient-records-panel';

type QueueEntry = {
  id: string;
  department: string;
  status: string;
  visit: { serviceDate: string; visitType: string };
};

export default function PatientAppointmentsTab({ patientId }: { patientId: string }) {
  return (
    <PatientRecordsPanel<QueueEntry>
      url={`/queue?patientId=${patientId}&visitType=APPOINTMENT`}
      selectItems={(data) => data?.data ?? []}
      emptyMessage="No appointments scheduled."
      renderItem={(item) => (
        <RecordCard
          title={item.department}
          meta={format(new Date(item.visit.serviceDate), 'dd MMM yyyy')}
          badge={item.status}
        />
      )}
    />
  );
}
