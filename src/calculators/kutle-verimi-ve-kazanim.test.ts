import { describe, expect, it } from 'vitest';
import type { CalcOutcome, CalcSuccess } from './core/types';
import {
  kutleVerimiVeKazanim as calc,
  massYield,
  metalContent,
  recoveryFromMasses,
  tailingsGrade,
  twoProductRecovery,
  twoProductYield,
} from './kutle-verimi-ve-kazanim';

function expectOk(outcome: CalcOutcome): CalcSuccess {
  if (!outcome.ok) throw new Error(`Başarılı sonuç bekleniyordu: ${JSON.stringify(outcome)}`);
  return outcome;
}
const result = (outcome: CalcSuccess, id: string) =>
  outcome.results.find((item) => item.id === id)?.value;

describe('kütle verimi ve kazanım: saf fonksiyonlar', () => {
  it('kütle verimi: 280 / 10.000 = %2,8', () => {
    expect(massYield(10_000, 280)).toBeCloseTo(2.8, 10);
  });
  it('kazanım: (280 × 24,5) / (10.000 × 0,8) = %85,75', () => {
    expect(recoveryFromMasses(10_000, 0.8, 280, 24.5)).toBeCloseTo(85.75, 10);
  });
  it('artık tenörü: (8.000 − 6.860) / 9.720 = %0,117284', () => {
    expect(tailingsGrade(10_000, 0.8, 280, 24.5)).toBeCloseTo(0.1172839506, 9);
  });
  it('iki ürün formülü: f = 0,8; c = 25; t = 0,15 → C/F = 0,026157; R = %81,74', () => {
    expect(twoProductYield(0.8, 25, 0.15)).toBeCloseTo(0.0261569416, 9);
    expect(twoProductRecovery(0.8, 25, 0.15)).toBeCloseTo(81.7404426559, 8);
  });
  it('iki ürün formülü c > f > t koşulunu zorunlu kılar', () => {
    expect(() => twoProductYield(0.8, 0.5, 0.1)).toThrow(RangeError);
    expect(() => twoProductYield(0.8, 25, 0.8)).toThrow(RangeError);
  });
  it('metal miktarı: % ve g/t', () => {
    expect(metalContent(10_000, 0.8, '%')).toBeCloseTo(80, 10);
    expect(metalContent(1000, 5, 'g/t')).toBe(5000);
  });
  it('sıfır besleme reddedilir', () => {
    expect(() => massYield(0, 1)).toThrow(RangeError);
    expect(() => recoveryFromMasses(10, 0, 1, 1)).toThrow(RangeError);
  });
});

describe('kütle verimi ve kazanım: hesaplayıcı (kütle yöntemi)', () => {
  it('örnek bakır flotasyonu', () => {
    const outcome = expectOk(calc.compute(calc.example.values));
    expect(result(outcome, 'kazanim')).toBeCloseTo(85.75, 8);
    expect(result(outcome, 'verim')).toBeCloseTo(2.8, 8);
    expect(result(outcome, 'zenginlestirmeOrani')).toBeCloseTo(30.625, 8);
    expect(result(outcome, 'konsantrasyonOrani')).toBeCloseTo(35.7142857, 6);
    expect(result(outcome, 'artik')).toBeCloseTo(9720, 8);
    expect(result(outcome, 'artikTenoru')).toBeCloseTo(0.1172839506, 9);
    expect(result(outcome, 'metalBesleme')).toBeCloseTo(80, 8);
    expect(result(outcome, 'metalKonsantre')).toBeCloseTo(68.6, 8);
    expect(outcome.warnings).toEqual([]);
  });

  it('g/t tenörde altın örneği: kazanım %80, metal kg cinsinden', () => {
    const outcome = expectOk(
      calc.compute({ yontem: 'kutle', tenorBirimi: 'g-t', F: '1000', C: '20', f: '5', c: '200' }),
    );
    expect(result(outcome, 'kazanim')).toBeCloseTo(80, 10);
    const feedMetal = outcome.results.find((item) => item.id === 'metalBesleme');
    expect(feedMetal?.value).toBeCloseTo(5, 10);
    expect(feedMetal?.unit).toBe('kg');
  });

  it('konsantre beslemeden büyükse alan hatası', () => {
    const outcome = calc.compute({ ...calc.example.values, C: '20000' });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.fieldErrors.C).toContain('büyük olamaz');
  });

  it('kazanım %100’ü aşarsa form hatası', () => {
    const outcome = calc.compute({ yontem: 'kutle', F: '100', C: '10', f: '1', c: '20' });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.formErrors[0]).toContain('%100');
  });

  it('besleme tenörü sıfır: alan hatası (sıfıra bölme)', () => {
    const outcome = calc.compute({ ...calc.example.values, f: '0' });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.fieldErrors.f).toBeDefined();
  });

  it('%100’den büyük tenör reddedilir', () => {
    const outcome = calc.compute({ ...calc.example.values, c: '120' });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.fieldErrors.c).toContain('%100');
  });

  it('girilen artık tenörü kütle dengesiyle uyuşmazsa uyarı verir', () => {
    const outcome = expectOk(calc.compute({ ...calc.example.values, t: '0,30' }));
    expect(outcome.warnings.join(' ')).toContain('kütle dengesinden');
  });

  it('kütle yönteminde artık tenörü isteğe bağlıdır', () => {
    const { t: _ignored, ...values } = calc.example.values;
    void _ignored;
    expect(calc.compute(values).ok).toBe(true);
  });
});

describe('kütle verimi ve kazanım: hesaplayıcı (iki ürün formülü)', () => {
  it('f = 0,8; c = 25; t = 0,15 → Y = %2,6157; R = %81,74', () => {
    const outcome = expectOk(calc.compute({ yontem: 'tenor', f: '0,8', c: '25', t: '0,15' }));
    expect(result(outcome, 'verim')).toBeCloseTo(2.6156941649899, 9);
    expect(result(outcome, 'kazanim')).toBeCloseTo(81.7404426559, 8);
    expect(result(outcome, 'artik')).toBeUndefined();
  });

  it('besleme miktarı girilirse konsantre ve artık miktarı hesaplanır', () => {
    const outcome = expectOk(
      calc.compute({ yontem: 'tenor', f: '0,8', c: '25', t: '0,15', F: '1000' }),
    );
    expect(result(outcome, 'konsantre')).toBeCloseTo(26.156941649899, 8);
    expect(result(outcome, 'artik')).toBeCloseTo(973.843058350101, 8);
  });

  it('tenör sıralaması c > f > t değilse form hatası', () => {
    const outcome = calc.compute({ yontem: 'tenor', f: '0,8', c: '0,5', t: '0,1' });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.formErrors[0]).toContain('c > f > t');
  });

  it('artık tenörü bu yöntemde zorunludur', () => {
    const outcome = calc.compute({ yontem: 'tenor', f: '0,8', c: '25' });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.missing).toContain('t');
  });

  it('birbirine çok yakın tenörlerde duyarlılık uyarısı verir', () => {
    const outcome = expectOk(calc.compute({ yontem: 'tenor', f: '1', c: '25', t: '0,97' }));
    expect(outcome.warnings.join(' ')).toContain('duyarlı');
  });
});
