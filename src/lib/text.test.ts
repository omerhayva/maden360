import { describe, expect, it } from 'vitest';
import { daysBetween, formatDate, formatNumber } from './format';
import { foldTurkish, slugify, truncate, turkishCollator } from './text';

describe('Türkçe metin yardımcıları', () => {
  it('foldTurkish: İ/ı ve aksanlar doğru katlanır', () => {
    expect(foldTurkish('İŞLETME İZNİ')).toBe('isletme izni');
    expect(foldTurkish('KAZANIM')).toBe('kazanim');
    expect(foldTurkish('Kömür Öğütme Çağı')).toBe('komur ogutme cagi');
  });

  it('slugify: ASCII ve tireli slug üretir', () => {
    expect(slugify('Satılık Mobil Kırıcı?')).toBe('satilik-mobil-kirici');
    expect(slugify('  Açık Ocak & Yeraltı  ')).toBe('acik-ocak-yeralti');
    expect(slugify('Ş-Ğ-Ü')).toBe('s-g-u');
  });

  it('turkishCollator: Türkçe alfabetik sıralama', () => {
    const sorted = ['şev', 'su', 'çatlak', 'cevher', 'ızgara', 'iğne', 'ocak', 'ölçek'].sort(
      turkishCollator.compare,
    );
    expect(sorted).toEqual(['cevher', 'çatlak', 'ızgara', 'iğne', 'ocak', 'ölçek', 'su', 'şev']);
  });

  it('truncate: kelime sınırında kısaltır', () => {
    expect(truncate('kısa', 10)).toBe('kısa');
    expect(truncate('dekapaj oranı ağırlık bazında hesaplanır', 20)).toBe('dekapaj oranı…');
  });
});

describe('Türkçe biçimlendirme', () => {
  it('sayılar: binlik nokta, ondalık virgül', () => {
    expect(formatNumber(1234567.891, 2)).toBe('1.234.567,89');
    expect(formatNumber(0.117284, 4)).toBe('0,1173');
    expect(formatNumber(127200)).toBe('127.200');
    expect(formatNumber(-0.0001, 2)).toBe('0');
    expect(formatNumber(Number.NaN)).toBe('—');
  });

  it('tarihler', () => {
    expect(formatDate('2026-10-15')).toBe('15 Ekim 2026');
    expect(formatDate('gecersiz')).toBe('gecersiz');
    expect(daysBetween('2026-10-16', '2026-12-15')).toBe(60);
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2);
  });
});
