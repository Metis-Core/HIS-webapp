'use client';

import { Dropdown } from '@/components';
import RemoteSearchSelect from '@/components/inputs/remote-search-select';
import { GenderEnum, LabAgeBandEnum } from '@/enum';
import { labTestsService } from '@/helpers/lab.service';
import { PICKER_PAGE_SIZE } from '@/helpers/pagination';
import type { ILabReportFilters, ILabTest, IOption } from '@/interfaces';
import { DateRangeFilter } from './lab-filters';

export const AGE_BAND_LABEL: Record<LabAgeBandEnum, string> = {
  [LabAgeBandEnum.UNDER_5]: 'Under 5',
  [LabAgeBandEnum.AGE_5_12]: '5-12',
  [LabAgeBandEnum.AGE_13_17]: '13-17',
  [LabAgeBandEnum.AGE_18_59]: '18-59',
  [LabAgeBandEnum.AGE_60_PLUS]: '60+',
};

const genderOptions: IOption[] = Object.values(GenderEnum).map((g) => ({ label: g, value: g }));
const bandOptions: IOption[] = Object.values(LabAgeBandEnum).map((b) => ({ label: AGE_BAND_LABEL[b], value: b }));
const testOption = (t: ILabTest): IOption => ({ label: `${t.code} — ${t.name}`, value: t.id });
const testUrl = (search: string) => labTestsService.buildListUrl({ search, limit: PICKER_PAGE_SIZE });

interface ReportFiltersProps {
  value: ILabReportFilters;
  test: ILabTest | null;
  onChange: (next: ILabReportFilters, test: ILabTest | null) => void;
}

/** L11 filters: result days, sex, age band (age on the result date) and one test. */
export default function ReportFilters({ value, test, onChange }: ReportFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <DateRangeFilter value={value} onChange={(r) => onChange({ ...value, ...r }, test)} />
      <div className="w-40">
        <Dropdown
          label="Sex"
          isClearable
          options={genderOptions}
          value={genderOptions.find((o) => o.value === value.gender) ?? null}
          onChange={(o) => {
            const gender = (o as IOption | null)?.value;
            onChange({ ...value, gender: gender === undefined ? undefined : String(gender) }, test);
          }}
        />
      </div>
      <div className="w-40">
        <Dropdown
          label="Age band"
          isClearable
          options={bandOptions}
          value={bandOptions.find((o) => o.value === value.ageBand) ?? null}
          onChange={(o) => onChange({ ...value, ageBand: (o as IOption | null)?.value as LabAgeBandEnum }, test)}
        />
      </div>
      <div className="w-72">
        <RemoteSearchSelect<ILabTest>
          label="Test"
          placeholder="Search code, abbreviation or name"
          value={test}
          onChange={(t) => onChange({ ...value, test: t?.id }, t)}
          buildUrl={testUrl}
          toOption={testOption}
          minSearchLength={1}
          noun="tests"
        />
      </div>
    </div>
  );
}
