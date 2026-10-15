import type { CalculatorDefinition } from './core/types';
import { dekapajOrani } from './dekapaj-orani';
import { kutleVerimiVeKazanim } from './kutle-verimi-ve-kazanim';
import { tonajHacim } from './tonaj-hacim';
import { vardiyaPerformansi } from './vardiya-performansi';

/**
 * Kayıtlı hesap motorları. Yeni bir hesaplayıcı eklerken:
 *  1. src/calculators/<slug>.ts dosyasında tanımı yazın,
 *  2. src/calculators/<slug>.test.ts dosyasında bilinen örneklerle test edin,
 *  3. buraya ekleyin,
 *  4. content/hesaplamalar/<slug>.md açıklama dosyasını oluşturun.
 * Ayrıntılar: docs/hesaplayici-gelistirme.md
 */
export const calculatorRegistry: Readonly<Record<string, CalculatorDefinition>> = {
  [tonajHacim.slug]: tonajHacim,
  [dekapajOrani.slug]: dekapajOrani,
  [kutleVerimiVeKazanim.slug]: kutleVerimiVeKazanim,
  [vardiyaPerformansi.slug]: vardiyaPerformansi,
};

export function getCalculatorDefinition(slug: string): CalculatorDefinition | undefined {
  return calculatorRegistry[slug];
}

export const calculatorSlugs = Object.keys(calculatorRegistry);
