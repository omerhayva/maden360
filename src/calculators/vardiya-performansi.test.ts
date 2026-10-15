import { describe, expect, it } from 'vitest';
import type { CalcOutcome, CalcSuccess } from './core/types';
import {
  achievementPercent,
  hourlyRate,
  requiredPerShift,
  vardiyaPerformansi as calc,
} from './vardiya-performansi';

function expectOk(outcome: CalcOutcome): CalcSuccess {
  if (!outcome.ok) throw new Error(`Başarılı sonuç bekleniyordu: ${JSON.stringify(outcome)}`);
  return outcome;
}
const result = (outcome: CalcSuccess, id: string) =>
  outcome.results.find((item) => item.id === id)?.value;

describe('vardiya performansı: saf fonksiyonlar', () => {
  it('hedef gerçekleşme: 4.000 / 4.500 = %88,89', () => {
    expect(achievementPercent(4000, 4500)).toBeCloseTo(88.8888889, 6);
  });
  it('gereken vardiya üretimi: (120.000 − 78.400) / 30 = 1.386,67', () => {
    expect(requiredPerShift(120_000, 78_400, 30)).toBeCloseTo(1386.6666667, 6);
  });
  it('hedefe ulaşıldıysa gereken üretim 0', () => {
    expect(requiredPerShift(1000, 1200, 5)).toBe(0);
  });
  it('sıfıra bölme durumları hata fırlatır', () => {
    expect(() => achievementPercent(10, 0)).toThrow(RangeError);
    expect(() => requiredPerShift(10, 0, 0)).toThrow(RangeError);
    expect(() => hourlyRate(10, 0)).toThrow(RangeError);
  });
});

describe('vardiya performansı: hesaplayıcı', () => {
  it('örnek: 3 × 8 saat, 4.000 t, hedef 4.500 t, 150 dk duruş, dönem takibi', () => {
    const outcome = expectOk(calc.compute(calc.example.values));
    expect(result(outcome, 'toplam')).toBe(4000);
    expect(result(outcome, 'ortalama')).toBeCloseTo(1333.3333333, 6);
    expect(result(outcome, 'gerceklesme')).toBeCloseTo(88.8888889, 6);
    expect(result(outcome, 'fark')).toBe(-500);
    expect(result(outcome, 'planliSure')).toBe(24);
    expect(result(outcome, 'saatlikBrut')).toBeCloseTo(166.6666667, 6);
    expect(result(outcome, 'durusOrani')).toBeCloseTo(10.4166667, 6);
    expect(result(outcome, 'netSure')).toBeCloseTo(21.5, 10);
    expect(result(outcome, 'saatlikNet')).toBeCloseTo(186.0465116, 6);
    expect(result(outcome, 'kalanHedef')).toBe(41_600);
    expect(result(outcome, 'gerekliOrtalama')).toBeCloseTo(1386.6666667, 6);
    expect(outcome.chart?.items).toHaveLength(3);
    expect(outcome.chart?.reference?.value).toBe(1500);
  });

  it('günlük toplam girişi', () => {
    const outcome = expectOk(
      calc.compute({
        vardiyaSayisi: '2',
        vardiyaSuresi: '12',
        giris: 'toplam',
        gunlukToplam: '3600',
      }),
    );
    expect(result(outcome, 'ortalama')).toBe(1800);
    expect(result(outcome, 'planliSure')).toBe(24);
    expect(result(outcome, 'saatlikBrut')).toBe(150);
    expect(outcome.chart).toBeUndefined();
  });

  it('vardiya sayısı × süresi 24 saati aşamaz', () => {
    const outcome = calc.compute({ ...calc.example.values, vardiyaSuresi: '9' });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.fieldErrors.vardiyaSuresi).toContain('24 saati');
  });

  it('duruş planlı süreden uzun olamaz', () => {
    const outcome = calc.compute({ ...calc.example.values, durus: '25', durus_birim: 'sa' });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.fieldErrors.durus).toBeDefined();
  });

  it('dönem alanları birlikte girilmelidir', () => {
    const outcome = calc.compute({
      ...calc.example.values,
      donemGerceklesen: '',
      kalanVardiya: '',
    });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(Object.keys(outcome.fieldErrors).sort()).toEqual(['donemGerceklesen', 'kalanVardiya']);
  });

  it('kalan vardiya tam sayı olmalı', () => {
    const outcome = calc.compute({ ...calc.example.values, kalanVardiya: '2,5' });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.fieldErrors.kalanVardiya).toContain('Tam sayı');
  });

  it('dönem hedefi aşıldıysa kalan hedef 0', () => {
    const outcome = expectOk(
      calc.compute({
        ...calc.example.values,
        donemHedefi: '1000',
        donemGerceklesen: '1200',
        kalanVardiya: '5',
      }),
    );
    expect(result(outcome, 'kalanHedef')).toBe(0);
    expect(result(outcome, 'gerekliOrtalama')).toBeUndefined();
  });

  it('vardiya süresi sıfır olamaz (sıfıra bölme)', () => {
    const outcome = calc.compute({ ...calc.example.values, vardiyaSuresi: '0' });
    expect(outcome.ok).toBe(false);
  });

  it('sıfır üretimli vardiya için uyarı verir', () => {
    const outcome = expectOk(calc.compute({ ...calc.example.values, v2: '0' }));
    expect(outcome.warnings.join(' ')).toContain('2. vardiyada');
  });

  it('görünmeyen 4. vardiya alanı zorunlu değildir', () => {
    const outcome = calc.compute({
      vardiyaSayisi: '3',
      vardiyaSuresi: '8',
      v1: '1',
      v2: '2',
      v3: '3',
    });
    expect(outcome.ok).toBe(true);
  });
});
