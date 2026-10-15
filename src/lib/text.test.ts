import { describe, expect, it } from 'vitest';
import { formatDate, formatNumber, formatPartialDate } from './format';
import {
  foldTurkish,
  initialLetter,
  letterAnchor,
  slugify,
  truncate,
  turkishCollator,
} from './text';

describe('Türkçe metin yardımcıları', () => {
  it('foldTurkish: İ/ı ve aksanlar doğru katlanır', () => {
    expect(foldTurkish('İŞLETME İZNİ')).toBe('isletme izni');
    expect(foldTurkish('KAZANIM')).toBe('kazanim');
    expect(foldTurkish('Kömür Öğütme Çağı')).toBe('komur ogutme cagi');
  });

  it('slugify: ASCII ve tireli slug üretir', () => {
    expect(slugify('Dekapaj Oranı Nedir?')).toBe('dekapaj-orani-nedir');
    expect(slugify('  Açık Ocak & Yeraltı  ')).toBe('acik-ocak-yeralti');
    expect(slugify('Ş-Ğ-Ü')).toBe('s-g-u');
  });

  it('initialLetter: Türk alfabesine göre harf başlığı', () => {
    expect(initialLetter('ıslak kırma')).toBe('I');
    expect(initialLetter('istif')).toBe('İ');
    expect(initialLetter('şev')).toBe('Ş');
    expect(initialLetter('3D model')).toBe('#');
    expect(letterAnchor('Ş')).toBe('harf-s-cedilla');
    expect(letterAnchor('A')).toBe('harf-a');
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
    expect(formatPartialDate('2016')).toBe('2016');
    expect(formatPartialDate('2025-07')).toBe('Temmuz 2025');
  });
});
