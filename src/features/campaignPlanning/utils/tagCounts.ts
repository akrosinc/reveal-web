import { getSiteAddedTag, getSiteTargetTag, SITE_TYPES } from '../constants';
import { LocationSubtype, SiteCounts, TagCount, TagValues } from '../providers/types';

export const toTagValues = (tags: TagCount[], key: 'count' | 'total'): TagValues =>
  tags.reduce((values: TagValues, tag) => {
    const value = tag[key];
    return typeof value === 'number' ? { ...values, [tag.tag]: value } : values;
  }, {});

export const mergeTagCounts = (tags: TagCount[], saved: TagCount[]): TagCount[] => [
  ...tags.filter(tag => !saved.some(item => item.tag === tag.tag)),
  ...saved.map(item => ({ ...tags.find(tag => tag.tag === item.tag), ...item }))
];

const toSiteCounts = (values: TagValues, getTag: (subtype: LocationSubtype) => string): SiteCounts =>
  SITE_TYPES.reduce((counts: SiteCounts, type) => ({ ...counts, [type.id]: values[getTag(type.subtype)] ?? 0 }), {});

export const toSiteTargets = (values: TagValues) => toSiteCounts(values, getSiteTargetTag);

export const toSitesAdded = (values: TagValues) => toSiteCounts(values, getSiteAddedTag);

export const formatTagValue = (value?: number) => (value === undefined ? '—' : Math.round(value).toLocaleString('en'));
