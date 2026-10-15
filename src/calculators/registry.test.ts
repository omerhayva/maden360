import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { allFields, unitKey } from './core/read';
import type { FormValues } from './core/types';
import { calculatorRegistry } from './registry';

const definitions = Object.entries(calculatorRegistry);

/** Basit, tekrarlanabilir sözde rastgele sayı üreteci (testler deterministik kalsın). */
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1_103_515_245 + 12_345) % 2_147_483_648;
    return state / 2_147_483_648;
  };
}

const NASTY_INPUTS = [
  '',
  ' ',
  '0',
  '-1',
  '-0',
  'abc',
  '1e9',
  '2,5',
  '1.000.000',
  '100',
  '0,001',
  '99999999999',
  '∞',
  '1,2,3',
  '24',
  '8',
];

describe.each(definitions)('%s tanımı', (slug, definition) => {
  it('kayıt anahtarı slug ile aynıdır ve sürüm semver biçimindedir', () => {
    expect(definition.slug).toBe(slug);
    expect(definition.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('alan kimlikleri benzersizdir', () => {
    const ids = allFields(definition).map((field) => field.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('seçim alanlarının varsayılanı seçenekler arasındadır, birimlerin varsayılanı tanımlıdır', () => {
    for (const field of allFields(definition)) {
      if (field.kind === 'choice') {
        expect(field.options.map((option) => option.value)).toContain(field.defaultValue);
      } else if (field.defaultUnit) {
        expect(field.units?.map((unit) => unit.id)).toContain(field.defaultUnit);
      }
    }
  });

  it('örnek değerler yalnızca tanımlı alanları kullanır ve başarılı sonuç verir', () => {
    const known = new Set(allFields(definition).flatMap((field) => [field.id, unitKey(field.id)]));
    for (const key of Object.keys(definition.example.values)) expect(known.has(key)).toBe(true);
    const outcome = definition.compute(definition.example.values);
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.results.filter((item) => item.emphasis)).toHaveLength(1);
      expect(outcome.interpretation.length).toBeGreaterThan(0);
    }
  });

  it('tüm formüller KaTeX ile hatasız derlenir', () => {
    for (const formula of definition.formulas) {
      expect(() =>
        katex.renderToString(formula.tex, { throwOnError: true, strict: 'ignore' }),
      ).not.toThrow();
      for (const item of formula.legend ?? []) {
        expect(() =>
          katex.renderToString(item.symbol, { throwOnError: true, strict: 'ignore' }),
        ).not.toThrow();
      }
    }
  });

  it('varsayımlar ve sınırlar tanımlıdır', () => {
    expect(definition.assumptions.length).toBeGreaterThan(0);
    expect(definition.limitations.length).toBeGreaterThan(0);
  });

  it('boş form hata fırlatmaz, eksik alanları raporlar', () => {
    const outcome = definition.compute({});
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.missing.length).toBeGreaterThan(0);
  });

  it('rastgele ve hatalı girdilerde asla hata fırlatmaz; başarılı sonuçlar sonlu sayılardır', () => {
    const random = seededRandom(slug.length * 7919);
    const fields = allFields(definition);
    for (let run = 0; run < 400; run += 1) {
      const values: FormValues = {};
      for (const field of fields) {
        if (field.kind === 'choice') {
          values[field.id] = field.options[Math.floor(random() * field.options.length)]!.value;
        } else {
          values[field.id] = NASTY_INPUTS[Math.floor(random() * NASTY_INPUTS.length)]!;
          if (field.units)
            values[unitKey(field.id)] = field.units[Math.floor(random() * field.units.length)]!.id;
        }
      }
      const outcome = definition.compute(values);
      if (outcome.ok) {
        for (const item of outcome.results) expect(Number.isFinite(item.value)).toBe(true);
      } else {
        expect(
          outcome.missing.length +
            outcome.formErrors.length +
            Object.keys(outcome.fieldErrors).length,
        ).toBeGreaterThan(0);
      }
    }
  });
});
