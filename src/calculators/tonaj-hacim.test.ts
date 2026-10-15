import { describe, expect, it } from 'vitest';
import type { CalcOutcome, CalcSuccess } from './core/types';
import {
  bankFromLoose,
  dryTonnage,
  looseFromBank,
  shapeVolume,
  tonajHacim,
  tonnageFromVolume,
} from './tonaj-hacim';

function expectOk(outcome: CalcOutcome): CalcSuccess {
  if (!outcome.ok) throw new Error(`Başarılı sonuç bekleniyordu: ${JSON.stringify(outcome)}`);
  return outcome;
}
const result = (outcome: CalcSuccess, id: string) =>
  outcome.results.find((item) => item.id === id)?.value;

describe('tonaj-hacim: saf fonksiyonlar', () => {
  it('dikdörtgen prizma: 120 × 40 × 10 = 48.000 m³', () => {
    expect(shapeVolume('prizma', { uzunluk: 120, genislik: 40, yukseklik: 10 })).toBe(48_000);
  });
  it('konik yığın: D = 20 m, H = 8 m → π·400·8/12 = 837,758 m³', () => {
    expect(shapeVolume('koni', { cap: 20, yukseklik: 8 })).toBeCloseTo(837.758041, 5);
  });
  it('üçgen kesitli uzun yığın: ½ · 12 · 5 · 50 = 1.500 m³', () => {
    expect(shapeVolume('ucgen-prizma', { taban: 12, yukseklik: 5, uzunluk: 50 })).toBe(1500);
  });
  it('silindir: D = 6 m, H = 10 m → 90π = 282,743 m³', () => {
    expect(shapeVolume('silindir', { cap: 6, yukseklik: 10 })).toBeCloseTo(282.743339, 5);
  });
  it('eksik boyutta hata fırlatır', () => {
    expect(() => shapeVolume('prizma', { uzunluk: 1, genislik: 2 })).toThrow();
  });
  it('T = V × ρ', () => {
    expect(tonnageFromVolume(48_000, 2.65)).toBeCloseTo(127_200, 6);
  });
  it('kuru tonaj: 1.000 t, %8 nem → 920 t', () => {
    expect(dryTonnage(1000, 8)).toBeCloseTo(920, 10);
  });
  it('kabarma dönüşümleri birbirinin tersidir', () => {
    expect(looseFromBank(48_000, 40)).toBeCloseTo(67_200, 6);
    expect(bankFromLoose(67_200, 40)).toBeCloseTo(48_000, 6);
  });
});

describe('tonaj-hacim: hesaplayıcı', () => {
  it('örnek değerler: 48.000 m³ × 2,65 t/m³ = 127.200 t; %40 kabarma → 67.200 m³ gevşek', () => {
    const outcome = expectOk(tonajHacim.compute(tonajHacim.example.values));
    expect(result(outcome, 'hacim')).toBeCloseTo(48_000, 6);
    expect(result(outcome, 'tonaj')).toBeCloseTo(127_200, 6);
    expect(result(outcome, 'digerHacim')).toBeCloseTo(67_200, 6);
    expect(result(outcome, 'kabarmaFaktoru')).toBeCloseTo(1.4, 10);
    expect(outcome.results.find((item) => item.emphasis)?.id).toBe('tonaj');
    expect(outcome.steps.length).toBeGreaterThan(1);
    expect(outcome.warnings).toEqual([]);
  });

  it('kg/m³ birimi t/m³’e çevrilir: 100 m³ × 2.650 kg/m³ = 265 t', () => {
    const outcome = expectOk(
      tonajHacim.compute({
        sekil: 'dogrudan',
        hacim: '100',
        yogunluk: '2650',
        yogunluk_birim: 'kg-m3',
      }),
    );
    expect(result(outcome, 'tonaj')).toBeCloseTo(265, 10);
    expect(outcome.steps[0]).toContain('kg/m³');
  });

  it('cm birimi metreye çevrilir: 1.200 cm × 400 cm × 100 cm = 48 m³', () => {
    const outcome = expectOk(
      tonajHacim.compute({
        sekil: 'prizma',
        uzunluk: '1200',
        uzunluk_birim: 'cm',
        genislik: '400',
        genislik_birim: 'cm',
        yukseklik: '100',
        yukseklik_birim: 'cm',
        yogunluk: '2',
      }),
    );
    expect(result(outcome, 'hacim')).toBeCloseTo(48, 10);
    expect(result(outcome, 'tonaj')).toBeCloseTo(96, 10);
  });

  it('nem girilirse kuru tonaj hesaplanır', () => {
    const outcome = expectOk(
      tonajHacim.compute({ sekil: 'dogrudan', hacim: '500', yogunluk: '2', nem: '8' }),
    );
    expect(result(outcome, 'tonaj')).toBeCloseTo(1000, 10);
    expect(result(outcome, 'kuruTonaj')).toBeCloseTo(920, 10);
  });

  it('gevşek bazda kabarma girilirse yerinde hacim hesaplanır', () => {
    const outcome = expectOk(
      tonajHacim.compute({
        sekil: 'dogrudan',
        hacim: '140',
        baz: 'gevsek',
        yogunluk: '1,8',
        kabarma: '40',
      }),
    );
    expect(result(outcome, 'digerHacim')).toBeCloseTo(100, 10);
    expect(result(outcome, 'tonaj')).toBeCloseTo(252, 10);
  });

  it('boş form: görünür zorunlu alanlar eksik olarak raporlanır', () => {
    const outcome = tonajHacim.compute({});
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.missing.sort()).toEqual(['genislik', 'uzunluk', 'yogunluk', 'yukseklik']);
  });

  it('gizli alanlardaki değerler yok sayılır', () => {
    const outcome = tonajHacim.compute({
      sekil: 'dogrudan',
      hacim: '10',
      yogunluk: '2',
      uzunluk: 'abc',
    });
    expect(outcome.ok).toBe(true);
  });

  it.each([
    ['yukseklik', '0', 'Sıfırdan büyük'],
    ['genislik', '-5', 'Sıfırdan büyük'],
    ['uzunluk', 'on iki', 'Geçerli bir sayı'],
  ])('geçersiz boyut (%s = "%s") alan hatası verir', (field, raw, message) => {
    const values = { ...tonajHacim.example.values, [field]: raw };
    const outcome = tonajHacim.compute(values);
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.fieldErrors[field]).toContain(message);
  });

  it('nem %100 olamaz (sıfıra bölme / fiziksel olmayan değer)', () => {
    const outcome = tonajHacim.compute({ ...tonajHacim.example.values, nem: '100' });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.fieldErrors.nem).toBeDefined();
  });

  it('t/m³ seçiliyken 2.650 girilirse fiziksel olmayan yoğunluk hatası verir ve kg/m³ önerir', () => {
    const outcome = tonajHacim.compute({ sekil: 'dogrudan', hacim: '100', yogunluk: '2650' });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.fieldErrors.yogunluk).toContain('kg/m³');
  });

  it('olağan dışı düşük yoğunlukta uyarı verir ama hesaplar', () => {
    const outcome = expectOk(
      tonajHacim.compute({
        sekil: 'dogrudan',
        hacim: '100',
        yogunluk: '2.700',
        yogunluk_birim: 'kg-m3',
      }),
    );
    expect(outcome.warnings.join(' ')).toContain('düşük');
  });
});
