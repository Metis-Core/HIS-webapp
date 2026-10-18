import { buildQuery } from './crud.service';
import { IcdEndpointEnum } from '@/enum';
import { PICKER_PAGE_SIZE } from './pagination';

/** Search URL for the diagnosis code catalogue (GET /icd), one small page at a time. */
export const buildDiagnosisSearchUrl = (search: string): string =>
  `${IcdEndpointEnum.BASE}${buildQuery({ search: search || undefined, limit: PICKER_PAGE_SIZE })}`;
