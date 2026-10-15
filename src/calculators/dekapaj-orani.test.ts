import { describe, expect, it } from 'vitest';
import type { CalcOutcome, CalcSuccess } from './core/types';
import { dekapajOrani, strippingRatio, toBases } from './dekapaj-orani';

function expectOk(outcome: CalcOutcome): CalcSuccess {
  if (!outcome.ok) throw new Error(`Başarılı sonuç bekleniyordu: ${JSON.stringify(outcome)}`);
  return outcome;
}
const result = (outcome: CalcSuccess, id: string) =>
  outcome.results.find((item) => item.id === id)?.value;

describe('dekapaj-orani: saf fonksiyonlar', () => {
  it('pasa / cevher', () => {
    expect(strippingRatio(4_500_000, 900_000)).toBe(5);
    expect(strippingRatio(0, 10)).toBe(0);
  });
  it('cevher sıfırsa sıfıra bölme hatası fırlatır', () => {
    expect(() => strippingRatio(100, 0)).toThrow(RangeError);
  });
  it('negatif pasa reddedilir', () => {
    expect(() => strippingRatio(-1, 10)).toThrow(RangeError);
  });
  it('baz dönüşümü yoğunlukla yapılır', () => {
    expect(toBases({ value: 100, basis: 'm3', density: 2.5 })).toEqual({
      cubicMetres: 100,
      tonnes: 250,
    });
    expect(toBases({ value: 300, basis: 't', density: 3 })).toEqual({
      tonnes: 300,
      cubicMetres: 100,
    });
    expect(toBases({ value: 300, basis: 't' })).toEqual({ tonnes: 300, cubicMetres: undefined });
  });
});

describe('dekapaj-orani: hesaplayıcı', () => {
  it('örnek: 1.800.000 m³ × 2,5 = 4.500.000 t pasa; 900.000 t cevher → 5,0 t/t ve 6,0 m³/m³', () => {
    const outcome = expectOk(dekapajOrani.compute(dekapajOrani.example.values));
    expect(result(outcome, 'oranAgirlik')).toBeCloseTo(5, 10);
    expect(result(outcome, 'oranHacim')).toBeCloseTo(6, 10);
    expect(result(outcome, 'toplamAgirlik')).toBeCloseTo(5_400_000, 4);
    expect(result(outcome, 'toplamHacim')).toBeCloseTo(2_100_000, 4);
    expect(outcome.interpretation.join(' ')).toContain('bazını');
  });

  it('aynı bazda (t/t) yoğunluk gerekmeden hesaplar ve yalnızca o bazı gösterir', () => {
    const outcome = expectOk(dekapajOrani.compute({ pasa: '450', cevher: '100' }));
    expect(result(outcome, 'oranAgirlik')).toBeCloseTo(4.5, 10);
    expect(result(outcome, 'oranHacim')).toBeUndefined();
    expect(outcome.results.find((item) => item.emphasis)?.id).toBe('oranAgirlik');
  });

  it('m³/m³ bazında hesaplar', () => {
    const outcome = expectOk(
      dekapajOrani.compute({ pasa: '300', pasa_birim: 'm3', cevher: '100', cevher_birim: 'm3' }),
    );
    expect(result(outcome, 'oranHacim')).toBeCloseTo(3, 10);
    expect(outcome.results.find((item) => item.emphasis)?.id).toBe('oranHacim');
  });

  it('farklı bazlar yoğunluksuz karıştırılmaz: form hatası döner', () => {
    const outcome = dekapajOrani.compute({
      pasa: '300',
      pasa_birim: 'm3',
      cevher: '100',
      cevher_birim: 't',
    });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.formErrors[0]).toContain('Farklı bazlar karıştırılmaz');
  });

  it('farklı bazlarda tek yoğunluk yeterlidir (ilgili baz hesaplanır)', () => {
    const outcome = expectOk(
      dekapajOrani.compute({
        pasa: '300',
        pasa_birim: 'm3',
        cevher: '100',
        cevher_birim: 't',
        pasaYogunluk: '2',
      }),
    );
    expect(result(outcome, 'oranAgirlik')).toBeCloseTo(6, 10);
    expect(result(outcome, 'oranHacim')).toBeUndefined();
  });

  it('cevher sıfır: sıfıra bölme alan hatası', () => {
    const outcome = dekapajOrani.compute({ pasa: '300', cevher: '0' });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.fieldErrors.cevher).toContain('sıfıra bölme');
  });

  it('pasa sıfır: oran 0 ve uyarı', () => {
    const outcome = expectOk(dekapajOrani.compute({ pasa: '0', cevher: '10' }));
    expect(result(outcome, 'oranAgirlik')).toBe(0);
    expect(outcome.warnings.length).toBe(1);
  });

  it('eksik alanlar raporlanır', () => {
    const outcome = dekapajOrani.compute({ pasa: '10' });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.missing).toEqual(['cevher']);
  });

  it('fiziksel olmayan yoğunluk reddedilir', () => {
    const outcome = dekapajOrani.compute({
      pasa: '300',
      pasa_birim: 'm3',
      cevher: '100',
      pasaYogunluk: '2400',
    });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.fieldErrors.pasaYogunluk).toContain('kg/m³');
  });
});
