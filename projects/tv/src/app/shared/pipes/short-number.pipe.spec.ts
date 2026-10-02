import { ShortNumberPipe } from './short-number.pipe';

// TEST-01: first FE spec — pure pipe, no TestBed needed. Proves the Karma
// harness runs; expand per-feature as legacy components are strangled.
describe('ShortNumberPipe', () => {
  const pipe = new ShortNumberPipe();

  it('creates', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns 0 for null/undefined/NaN', () => {
    expect(pipe.transform(null)).toBe('0');
    expect(pipe.transform(undefined)).toBe('0');
    expect(pipe.transform(NaN)).toBe('0');
  });

  it('passes through values under 1000', () => {
    expect(pipe.transform(0)).toBe('0');
    expect(pipe.transform(999)).toBe('999');
  });

  it('shortens thousands/millions/billions', () => {
    expect(pipe.transform(1200)).toBe('1.2K');
    expect(pipe.transform(1_200_000)).toBe('1.2M');
    expect(pipe.transform(2_000_000_000)).toBe('2.0B');
  });
});
