import { describe, expect, it } from 'vitest';
import { parseDecimal } from './number';

const value = (raw: string) => {
  const parsed = parseDecimal(raw);
  return parsed.kind === 'value' ? parsed.value : parsed.kind;
};

describe('parseDecimal — Türkçe ve uluslararası sayı yazımları', () => {
  it.each([
    ['2,65', 2.65],
    ['2.65', 2.65],
    ['0,8', 0.8],
    [',5', 0.5],
    ['5,', 5],
    ['1.250.000', 1_250_000],
    ['1,250,000', 1_250_000],
    ['1.234,5', 1234.5],
    ['1,234.5', 1234.5],
    ['12.345,678', 12345.678],
    ['1 250', 1250],
    ['1\u00A0250,5', 1250.5],
    ['  12  ', 12],
    ['-3,5', -3.5],
    ['\u22123,5', -3.5],
    ['+4', 4],
    ['0', 0],
  ])('"%s" → %d', (raw, expected) => {
    expect(value(raw)).toBeCloseTo(expected, 10);
  });

  it('boş girdileri "empty" olarak döndürür', () => {
    expect(value('')).toBe('empty');
    expect(value('   ')).toBe('empty');
    expect(parseDecimal(undefined).kind).toBe('empty');
    expect(parseDecimal(null).kind).toBe('empty');
  });

  it.each([
    'abc',
    '1.23.4',
    '1,2,3',
    '1.2345,6',
    '12a',
    '1e5',
    'Infinity',
    'NaN',
    '--2',
    '1,2.3,4',
    '.',
    ',',
  ])('geçersiz yazım "%s" reddedilir', (raw) => {
    expect(value(raw)).toBe('invalid');
  });

  it('belirsiz "2.700" ondalık olarak okunur (arayüz okunan değeri gösterir)', () => {
    expect(value('2.700')).toBe(2.7);
  });
});
