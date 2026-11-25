import { AREA_TAGS, getSiteAddedTag, getSiteTargetTag } from '../constants';
import { formatTagValue, mergeTagCounts, toSitesAdded, toSiteTargets, toTagValues } from './tagCounts';

describe('getSiteTargetTag', () => {
  it('uses the backend tag name of the site type', () => {
    expect(getSiteTargetTag('OUTREACH')).toBe('sites_outreach_to_add');
    expect(getSiteTargetTag('H2R')).toBe('sites_h2r_to_add');
  });
});

describe('getSiteAddedTag', () => {
  it('uses the backend tag name of the site type', () => {
    expect(getSiteAddedTag('MOBILE')).toBe('sites_mobile_added');
  });
});

describe('AREA_TAGS', () => {
  it('asks for the populations, zones, schools and one target and added count per site type', () => {
    expect(AREA_TAGS).toEqual([
      'moh_population',
      'user_population',
      'zones_count',
      'schools_count',
      'sites_outreach_to_add',
      'sites_static_to_add',
      'sites_h2r_to_add',
      'sites_mobile_to_add',
      'sites_school_to_add',
      'sites_outreach_added',
      'sites_static_added',
      'sites_h2r_added',
      'sites_mobile_added',
      'sites_school_added'
    ]);
  });
});

describe('toTagValues', () => {
  const tags = [
    { tag: 'zones_count', count: 2, total: 5 },
    { tag: 'schools_count', count: 0, total: 0 },
    { tag: 'moh_population', count: null, total: null }
  ];

  it('reads the own count or the total and skips tags without a value', () => {
    expect(toTagValues(tags, 'count')).toEqual({ zones_count: 2, schools_count: 0 });
    expect(toTagValues(tags, 'total')).toEqual({ zones_count: 5, schools_count: 0 });
  });
});

describe('mergeTagCounts', () => {
  it('replaces the saved counts, adds new ones and keeps the rest', () => {
    expect(
      mergeTagCounts(
        [
          { tag: 'zones_count', count: 2, total: 5 },
          { tag: 'schools_count', count: 1, total: 1 }
        ],
        [
          { tag: 'zones_count', count: 4 },
          { tag: 'sites_h2r_to_add', count: 3 }
        ]
      )
    ).toEqual([
      { tag: 'schools_count', count: 1, total: 1 },
      { tag: 'zones_count', count: 4, total: 5 },
      { tag: 'sites_h2r_to_add', count: 3 }
    ]);
  });
});

describe('toSiteTargets', () => {
  it('gives every site type a target, 0 when the tag has no value', () => {
    expect(toSiteTargets({ sites_outreach_to_add: 7, sites_school_to_add: 2 })).toEqual({
      outreach: 7,
      static: 0,
      h2r: 0,
      mobile: 0,
      school_hpv: 2
    });
  });
});

describe('toSitesAdded', () => {
  it('reads the added tags, not the targets', () => {
    expect(toSitesAdded({ sites_outreach_added: 3, sites_outreach_to_add: 7 })).toEqual({
      outreach: 3,
      static: 0,
      h2r: 0,
      mobile: 0,
      school_hpv: 0
    });
  });
});

describe('formatTagValue', () => {
  it('shows thousands, and a dash when there is no value', () => {
    expect(formatTagValue(5890)).toBe('5,890');
    expect(formatTagValue(0)).toBe('0');
    expect(formatTagValue(undefined)).toBe('—');
  });
});
