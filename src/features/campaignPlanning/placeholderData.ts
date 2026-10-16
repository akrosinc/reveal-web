// Design placeholders: values from the Command Deck mockup, shown until the backend APIs exist
export const POPULATION = { moh: '5,890', user: '4,000' };

export const ZONES = 0;
export const SCHOOLS = 0;

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
