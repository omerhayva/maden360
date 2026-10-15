import { parseDecimal } from '@/calculators/core/number';
import { PROVINCES, REGION_WILDCARDS } from '@/lib/listings/options';
import { foldTurkish } from '@/lib/text';

/** Form değerleri: çoklu seçimler dizi, diğerleri metin olarak tutulur. */
export type FormValues = Record<string, string | string[]>;

export function textValue(values: FormValues, id: string): string {
  const value = values[id];
  return typeof value === 'string' ? value.trim() : '';
}

export function arrayValue(values: FormValues, id: string): string[] {
  const value = values[id];
  return Array.isArray(value) ? value : [];
}

/** Liste alanı: her satır bir madde (boş satırlar ve madde işaretleri atılır). */
export function listValue(values: FormValues, id: string): string[] {
  return textValue(values, id)
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-•*]|\d+[.)])\s*/, '').trim())
    .filter(Boolean);
}

/**
 * Formdaki sayıları Türkçe yazıma göre okur. Hesaplayıcılardan farklı olarak tek
 * noktadan sonra tam üç rakam geliyorsa nokta binlik ayırıcı sayılır:
 * "45.000" → 45000, "2.450,50" → 2450,5, "2,5" → 2,5, "1.250.000" → 1250000.
 */
export function parseFormNumber(raw: string): number | null | 'invalid' {
  const trimmed = raw.trim().replace(/\s/g, '');
  if (trimmed === '') return null;
  const normalized = /^-?\d{1,3}\.\d{3}$/.test(trimmed) ? trimmed.replace('.', '') : trimmed;
  const parsed = parseDecimal(normalized);
  if (parsed.kind === 'empty') return null;
  if (parsed.kind === 'invalid') return 'invalid';
  return parsed.value;
}

export function numberValue(values: FormValues, id: string): number | undefined {
  const parsed = parseFormNumber(textValue(values, id));
  return typeof parsed === 'number' ? parsed : undefined;
}

const provinceIndex = new Map<string, string>(
  [...PROVINCES, ...REGION_WILDCARDS].map((name) => [foldTurkish(name), name]),
);

/** "izmir" → "İzmir", "turkiye geneli" → "Türkiye geneli"; tanınmazsa null. */
export function canonicalProvince(input: string): string | null {
  return provinceIndex.get(foldTurkish(input.trim())) ?? null;
}
