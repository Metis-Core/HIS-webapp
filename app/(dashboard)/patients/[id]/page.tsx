// Server wrapper for the dynamic patient route. It only exists to satisfy
// Next.js static export (required by the Tauri desktop build); all data
// fetching and rendering happen client-side in `detail.client.tsx`.
import PatientDetailPage from './detail.client';

// Tauri static export requires a param, so we emit a placeholder and let
// Tauri's index.html fallback + client-side `useParams` resolve real ids at
// runtime. The web build returns no params and stays fully dynamic.
const isTauriBuild = process.env.TAURI_BUILD === '1';

export function generateStaticParams() {
  return isTauriBuild ? [{ id: 'index' }] : [];
}

export default function Page() {
  return <PatientDetailPage />;
}
