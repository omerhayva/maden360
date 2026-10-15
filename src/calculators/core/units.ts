import type { UnitOption } from './types';

/** Temel birim: t/m³ (sayısal olarak g/cm³ ile aynıdır) */
export const DENSITY_UNITS = [
  { id: 't-m3', label: 't/m³', factor: 1 },
  { id: 'g-cm3', label: 'g/cm³', factor: 1 },
  { id: 'kg-m3', label: 'kg/m³', factor: 0.001 },
] as const satisfies readonly UnitOption[];

/** Temel birim: m */
export const LENGTH_UNITS = [
  { id: 'm', label: 'm', factor: 1 },
  { id: 'cm', label: 'cm', factor: 0.01 },
] as const satisfies readonly UnitOption[];

/** Temel birim: saat */
export const DURATION_UNITS = [
  { id: 'dk', label: 'dakika', factor: 1 / 60 },
  { id: 'sa', label: 'saat', factor: 1 },
] as const satisfies readonly UnitOption[];

/**
 * Ölçü bazı: ağırlık (t) veya yerinde hacim (m³).
 * Çarpan 1'dir; dönüşüm yoğunlukla ayrıca yapılır (farklı bazlar karıştırılmaz).
 */
export const BASIS_UNITS = [
  { id: 't', label: 't', factor: 1 },
  { id: 'm3', label: 'm³', factor: 1 },
] as const satisfies readonly UnitOption[];

/** Yoğunluk girdisinin fiziksel olarak makul olup olmadığını kontrol eder. */
export function densityPlausibility(
  densityTPerM3: number,
  label: string,
  format: (value: number) => string,
): { error?: string; warning?: string } {
  if (densityTPerM3 > 25) {
    return {
      error: `${label} ${format(densityTPerM3)} t/m³ olarak okundu; doğal malzemeler için bu fiziksel olarak mümkün değil. Değeri kg/m³ cinsinden girdiyseniz birim olarak kg/m³ seçin.`,
    };
  }
  if (densityTPerM3 > 8) {
    return {
      warning: `${label} (${format(densityTPerM3)} t/m³) cevher ve kayaçlar için olağan dışı yüksek. Birimi ve değeri kontrol edin.`,
    };
  }
  if (densityTPerM3 < 0.3) {
    return {
      warning: `${label} (${format(densityTPerM3)} t/m³) olağan dışı düşük. Birimi kontrol edin; ayrıca "2.700" gibi yazımlar 2,7 olarak okunur — binlik ayırıcı kullanmayın.`,
    };
  }
  return {};
}
