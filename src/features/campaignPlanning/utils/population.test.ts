import { getPopulationTotal } from './population';

describe('getPopulationTotal', () => {
  it('reads the sum from an object or a JSON string and rounds it', () => {
    expect(getPopulationTotal({ sum: 1234.6 })).toBe(1235);
    expect(getPopulationTotal('{"sum": 980}')).toBe(980);
    expect(getPopulationTotal({ sum: 0 })).toBe(0);
  });

  it('returns nothing when there is no usable sum', () => {
    expect(getPopulationTotal(undefined)).toBeUndefined();
    expect(getPopulationTotal({})).toBeUndefined();
    expect(getPopulationTotal('not json')).toBeUndefined();
  });
});
