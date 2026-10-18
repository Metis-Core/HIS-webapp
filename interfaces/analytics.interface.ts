import type { IDoctorSummary } from './availability.interface';

export interface ICountRow {
  label: string;
  count: number;
}

export interface IWaitRow {
  department: string;
  served: number;
  averageWaitSeconds: number;
}

export interface IAnalyticsOverview {
  window: { from: string; to: string };
  patients: { registered: number; total: number };
  visits: { total: number; byType: ICountRow[]; byDay: ICountRow[] };
  waits: IWaitRow[];
  revenue: {
    total: number;
    byMethod: ICountRow[];
    byDay: ICountRow[];
    outstanding: number;
    openInvoices: number;
  };
  clinical: {
    consultations: number;
    labOrders: number;
    imaging: number;
    procedures: number;
    prescriptions: number;
    topDiagnoses: ICountRow[];
  };
  queueNow: Array<{ department: string; status: string; count: number }>;
  doctors: IDoctorSummary[];
}

export interface IAnalyticsRange {
  from?: string;
  to?: string;
}
