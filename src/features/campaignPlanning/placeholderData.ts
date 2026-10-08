// Design placeholders: values from the Command Deck mockup, shown until the backend APIs exist

export interface SiteGroup {
  label: string;
  mapped: number;
  target: number;
  types: { label: string; count: string }[];
  sites: { name: string; type: string; isMapped: boolean }[];
}

export const POPULATION = { moh: '5,890', user: '4,000' };

export const ZONES = 5;
export const SCHOOLS = 4;

export const SITE_GROUPS: SiteGroup[] = [
  {
    label: 'Outreach, static, H2R',
    mapped: 18,
    target: 18,
    types: [
      { label: 'Outreach sites (editable)', count: '—' },
      { label: 'Static sites (editable)', count: '—' },
      { label: 'H2R sites (editable)', count: '—' }
    ],
    sites: []
  },
  {
    label: 'Mobile, school HPV',
    mapped: 19,
    target: 22,
    types: [
      { label: 'Mobile sites (editable)', count: '12' },
      { label: 'School-based HPV sites (editable)', count: '10' }
    ],
    sites: [
      { name: 'Mobile unit 1', type: 'Mobile', isMapped: true },
      { name: 'Mobile unit 2', type: 'Mobile', isMapped: true },
      { name: 'Mobile unit 3', type: 'Mobile', isMapped: false },
      { name: 'Roma Primary', type: 'School HPV', isMapped: true },
      { name: 'Kaya Secondary', type: 'School HPV', isMapped: true },
      { name: 'Bongo Primary', type: 'School HPV', isMapped: false }
    ]
  }
];

export const ACTIVITIES = [
  { label: 'S1 — Planning and management', count: 2 },
  { label: 'S3 — Linking immunisation services', count: 1 },
  { label: 'S4 — Supportive supervision', count: 1 },
  { label: 'S5 — Data monitoring', count: 2 },
  { label: 'S6 — Supplementary outreach', count: 1 }
];

export const TRANSPORT_MODES = ['Vehicle', 'Motorbike', 'Bicycle'];

export const TRANSPORT_COST = {
  mode: 'Vehicle',
  distance: '6.4 km',
  costPerActivity: '$17.60',
  fuelCost: '$25',
  totalActivities: '7',
  totalMonthlyCost: '$148.20'
};

export const AGE_SEX_BANDS = [
  { label: '0–1', count: '165' },
  { label: '1–2', count: '158' },
  { label: '3–5', count: '412' },
  { label: 'Female 9', count: '61' },
  { label: 'Female 15–49', count: '1,340' },
  { label: 'Male 15–49', count: '1,298' }
];
