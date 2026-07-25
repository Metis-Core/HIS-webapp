export const ugandaInsuranceProviders = [
  'AAR Health Services',
  'CASE Med Insurance',
  'Jubilee Health Insurance',
  'UAP Old Mutual Insurance',
  'Britam Insurance Uganda',
  'Sanlam General Insurance',
  'ICEA Lion General Insurance',
  'Liberty General Insurance',
  'NIC General Insurance',
  'CIC General Insurance',
  'APA Insurance Uganda',
  'Mayfair Insurance',
  'MUA Insurance Uganda',
  'Prudential Assurance Uganda',
  'GoldStar Insurance',
  'TransAfrica Assurance',
  'Alliance Africa General Insurance',
  'Pax Insurance',
  'Statewide Insurance',
  'Other',
] as const;

export type UgandaInsuranceProvider = (typeof ugandaInsuranceProviders)[number];
