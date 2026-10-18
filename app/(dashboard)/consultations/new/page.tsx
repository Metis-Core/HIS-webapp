'use client';

import { Suspense } from 'react';
import NewConsultationForm from './new-consultation-form';

function NewConsultationFallback() {
  return (
    <div className="flex flex-col gap-5">
      <div className="h-4 w-40 animate-pulse rounded bg-line" />
      <div className="h-8 w-56 animate-pulse rounded bg-line" />
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="h-96 animate-pulse rounded-lg border border-line bg-surface-raised lg:col-span-7" />
        <div className="h-64 animate-pulse rounded-lg border border-line bg-surface-raised lg:col-span-5" />
      </div>
    </div>
  );
}

export default function NewConsultationPage() {
  return (
    <Suspense fallback={<NewConsultationFallback />}>
      <NewConsultationForm />
    </Suspense>
  );
}
