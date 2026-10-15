import { formatNumber } from '@/lib/format';
import { parseDecimal } from './number';
import type {
  CalcFailure,
  CalcSuccess,
  CalculatorDefinition,
  ChoiceField,
  FieldDef,
  FieldSection,
  FormValues,
  NumberField,
  UnitOption,
} from './types';

export const unitKey = (fieldId: string) => `${fieldId}_birim`;

export function allFields(definition: CalculatorDefinition): FieldDef[] {
  return definition.sections.flatMap((section) => section.fields);
}

/** Seçim alanlarının boş/geçersiz değerlerini varsayılanlarla doldurur. */
export function withDefaults(definition: CalculatorDefinition, values: FormValues): FormValues {
  const resolved: FormValues = { ...values };
  for (const field of allFields(definition)) {
    if (field.kind === 'choice') {
      const current = values[field.id];
      if (!current || !field.options.some((option) => option.value === current)) {
        resolved[field.id] = field.defaultValue;
      }
    } else if (field.units && field.units.length > 0) {
      const key = unitKey(field.id);
      const current = values[key];
      if (!current || !field.units.some((unit) => unit.id === current)) {
        resolved[key] = field.defaultUnit ?? field.units[0]!.id;
      }
    }
  }
  return resolved;
}

export function isSectionVisible(section: FieldSection, values: FormValues): boolean {
  return section.visibleWhen ? section.visibleWhen(values) : true;
}

export function isFieldVisible(
  field: FieldDef,
  section: FieldSection,
  values: FormValues,
): boolean {
  return (
    isSectionVisible(section, values) && (field.visibleWhen ? field.visibleWhen(values) : true)
  );
}

export function isOptional(field: NumberField, values: FormValues): boolean {
  return typeof field.optional === 'function' ? field.optional(values) : Boolean(field.optional);
}

export function selectedUnit(field: NumberField, values: FormValues): UnitOption | undefined {
  if (!field.units || field.units.length === 0) return undefined;
  const id = values[unitKey(field.id)] ?? field.defaultUnit;
  return field.units.find((unit) => unit.id === id) ?? field.units[0];
}

/** Alanın ekranda görünen birim etiketi */
export function unitLabel(field: NumberField, values: FormValues): string | undefined {
  const unit = selectedUnit(field, values);
  if (unit) return unit.label;
  return typeof field.unit === 'function' ? field.unit(values) : field.unit;
}

function rangeMessage(field: NumberField, kind: 'min' | 'max'): string {
  const custom = field.messages?.[kind];
  if (custom) return custom;
  if (kind === 'min') {
    if (field.min === 0)
      return field.minExclusive ? 'Sıfırdan büyük bir değer girin.' : 'Negatif değer girilemez.';
    return field.minExclusive
      ? `${formatNumber(field.min!)} değerinden büyük olmalı.`
      : `En az ${formatNumber(field.min!)} olmalı.`;
  }
  return field.maxExclusive
    ? `${formatNumber(field.max!)} değerinden küçük olmalı.`
    : `En fazla ${formatNumber(field.max!)} olabilir.`;
}

export interface ReadInputs {
  /** Görünür alanlarla birlikte varsayılanları uygulanmış değerler */
  values: FormValues;
  /** Zorunlu sayı alanının temel birimdeki değeri */
  num(id: string): number;
  /** İsteğe bağlı sayı alanının temel birimdeki değeri (boşsa undefined) */
  opt(id: string): number | undefined;
  /** Kullanıcının seçtiği birimdeki değer (adım adım gösterim için) */
  entered(id: string): number | undefined;
  /** Seçilen birim etiketi */
  unit(id: string): string;
  /** Seçilen birim kimliği */
  unitId(id: string): string | undefined;
  choice(id: string): string;
}

export type ReadResult = { ok: true; input: ReadInputs } | { ok: false; failure: CalcFailure };

/**
 * Görünür alanları okur, sayıya çevirir, birimleri temel birime dönüştürür ve
 * alan bazlı kuralları (zorunluluk, aralık, tam sayı) uygular.
 */
export function readInputs(definition: CalculatorDefinition, rawValues: FormValues): ReadResult {
  const values = withDefaults(definition, rawValues);
  const base = new Map<string, number>();
  const entered = new Map<string, number>();
  const fieldErrors: Record<string, string> = {};
  const missing: string[] = [];
  const fieldIndex = new Map<string, FieldDef>();

  for (const section of definition.sections) {
    for (const field of section.fields) {
      fieldIndex.set(field.id, field);
      if (field.kind !== 'number' || !isFieldVisible(field, section, values)) continue;
      const parsed = parseDecimal(values[field.id]);
      if (parsed.kind === 'empty') {
        if (!isOptional(field, values)) missing.push(field.id);
        continue;
      }
      if (parsed.kind === 'invalid') {
        fieldErrors[field.id] = 'Geçerli bir sayı girin (ör. 2,65).';
        continue;
      }
      const unit = selectedUnit(field, values);
      const value = parsed.value * (unit?.factor ?? 1);
      if (field.integer && !Number.isInteger(parsed.value)) {
        fieldErrors[field.id] = field.messages?.integer ?? 'Tam sayı girin.';
        continue;
      }
      if (
        field.min !== undefined &&
        (field.minExclusive ? value <= field.min : value < field.min)
      ) {
        fieldErrors[field.id] = rangeMessage(field, 'min');
        continue;
      }
      if (
        field.max !== undefined &&
        (field.maxExclusive ? value >= field.max : value > field.max)
      ) {
        fieldErrors[field.id] = rangeMessage(field, 'max');
        continue;
      }
      base.set(field.id, value);
      entered.set(field.id, parsed.value);
    }
  }

  if (missing.length > 0 || Object.keys(fieldErrors).length > 0) {
    return { ok: false, failure: { ok: false, fieldErrors, formErrors: [], missing } };
  }

  const field = (id: string) => {
    const found = fieldIndex.get(id);
    if (!found) throw new Error(`Tanımsız alan: ${id}`);
    return found;
  };

  return {
    ok: true,
    input: {
      values,
      num(id) {
        const value = base.get(id);
        if (value === undefined) throw new Error(`Zorunlu alan okunamadı: ${id}`);
        return value;
      },
      opt: (id) => base.get(id),
      entered: (id) => entered.get(id),
      unit(id) {
        const found = field(id);
        return found.kind === 'number' ? (unitLabel(found, values) ?? '') : '';
      },
      unitId(id) {
        const found = field(id);
        return found.kind === 'number' ? selectedUnit(found, values)?.id : undefined;
      },
      choice(id) {
        const found = field(id) as ChoiceField;
        return values[id] ?? found.defaultValue;
      },
    },
  };
}

export function failure(
  fieldErrors: Record<string, string> = {},
  formErrors: string[] = [],
): CalcFailure {
  return { ok: false, fieldErrors, formErrors, missing: [] };
}

export function success(result: Omit<CalcSuccess, 'ok'>): CalcSuccess {
  return { ok: true, ...result };
}

/** Kısa biçimlendirici: hesap adımlarında ve yorumlarda kullanılır. */
export const fmt = (value: number, digits?: number) => formatNumber(value, digits);
