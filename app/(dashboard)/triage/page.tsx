import { redirect } from 'next/navigation';

// Triage moved under Patients (R4); keep the old URL working for bookmarks.
export default function TriagePage() {
  redirect('/patients?tab=triage');
}
