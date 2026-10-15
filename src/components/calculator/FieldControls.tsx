'use client';

import { CircleAlert } from 'lucide-react';
import { parseDecimal } from '@/calculators/core/number';
import { isOptional, unitKey, unitLabel } from '@/calculators/core/read';
import type { ChoiceField, FormValues, NumberField } from '@/calculators/core/types';
import { formatNumber } from '@/lib/format';

export const fieldDomId = (fieldId: string) => `alan-${fieldId}`;

interface NumberInputProps {
  field: NumberField;
  values: FormValues;
  error?: string;
  onChange: (key: string, value: string) => void;
  onBlur: (fieldId: string) => void;
}

/** Okunan değeri gösterir: "2.700" yazıldığında 2,7 olarak okunduğunu fark ettirir. */
function readBack(raw: string): string | null {
  const parsed = parseDecimal(raw);
  if (parsed.kind !== 'value') return null;
  const formatted = formatNumber(parsed.value, 10);
  const trimmed = raw.trim();
  if (formatted === trimmed) return null;
  if (/[.,\s]/.test(trimmed) || Math.abs(parsed.value) >= 10_000) return formatted;
  return null;
}

export function NumberInput({ field, values, error, onChange, onBlur }: NumberInputProps) {
  const id = fieldDomId(field.id);
  const raw = values[field.id] ?? '';
  const helpId = field.help ? `${id}-yardim` : undefined;
  const errorId = error ? `${id}-hata` : undefined;
  const optional = isOptional(field, values);
  const label = unitLabel(field, values);
  const hasAddon = Boolean(field.units?.length) || Boolean(label);
  const shown = !error && raw ? readBack(raw) : null;

  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-baseline justify-between gap-2 text-sm font-medium text-graphite-900"
      >
        <span>{field.label}</span>
        {optional && (
          <span className="shrink-0 text-xs font-normal text-graphite-500">İsteğe bağlı</span>
        )}
      </label>
      <div className="mt-1.5 flex">
        <input
          id={id}
          name={field.id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={raw}
          placeholder={field.placeholder}
          aria-invalid={error ? true : undefined}
          aria-required={optional ? undefined : true}
          aria-describedby={[helpId, errorId].filter(Boolean).join(' ') || undefined}
          onChange={(event) => onChange(field.id, event.target.value)}
          onBlur={() => onBlur(field.id)}
          className={`min-h-12 w-full min-w-0 flex-1 border bg-white px-3 text-base tabular-nums text-graphite-950 placeholder:text-graphite-400 focus:border-copper-600 focus:outline-none focus-visible:outline-3 focus-visible:outline-offset-0 focus-visible:outline-copper-500 ${
            error ? 'border-red-600' : 'border-graphite-300'
          } ${hasAddon ? 'rounded-l-md' : 'rounded-md'}`}
        />
        {field.units && field.units.length > 0 ? (
          <select
            aria-label={`${field.label} birimi`}
            value={values[unitKey(field.id)] ?? field.defaultUnit ?? field.units[0]!.id}
            onChange={(event) => onChange(unitKey(field.id), event.target.value)}
            className="min-h-12 rounded-r-md border border-l-0 border-graphite-300 bg-stone-50 px-2 text-sm font-medium text-graphite-800 focus:outline-none focus-visible:outline-3 focus-visible:outline-copper-500"
          >
            {field.units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.label}
              </option>
            ))}
          </select>
        ) : label ? (
          <span className="inline-flex min-w-12 items-center justify-center rounded-r-md border border-l-0 border-graphite-300 bg-stone-50 px-3 text-sm font-medium text-graphite-700">
            {label}
          </span>
        ) : null}
      </div>
      {field.help && (
        <p id={helpId} className="mt-1.5 text-sm leading-5 text-graphite-600">
          {field.help}
        </p>
      )}
      {shown && (
        <p className="mt-1 text-xs text-graphite-600">
          Okunan değer:{' '}
          <span className="font-semibold tabular-nums text-graphite-900">{shown}</span>
        </p>
      )}
      {error && (
        <p
          id={errorId}
          className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-red-700"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

interface ChoiceInputProps {
  field: ChoiceField;
  value: string;
  onChange: (key: string, value: string) => void;
}

export function ChoiceInput({ field, value, onChange }: ChoiceInputProps) {
  const name = fieldDomId(field.id);
  const cards = field.layout === 'cards';
  return (
    <fieldset>
      <legend className="text-sm font-medium text-graphite-900">{field.label}</legend>
      <div className={cards ? 'mt-2 grid gap-2 sm:grid-cols-2' : 'mt-2 flex flex-wrap gap-2'}>
        {field.options.map((option) => {
          const id = `${name}-${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={id}
              className={`relative flex cursor-pointer rounded-md border border-graphite-300 bg-white px-3 py-2 text-sm transition-colors hover:border-copper-400 has-checked:border-copper-600 has-checked:bg-copper-50 has-checked:ring-1 has-checked:ring-copper-600 has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-copper-500 ${
                cards
                  ? 'min-h-14 flex-col justify-center'
                  : 'min-h-11 min-w-11 flex-col items-center justify-center text-center'
              }`}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(field.id, option.value)}
                className="sr-only"
              />
              <span className="font-medium text-graphite-900">{option.label}</span>
              {option.hint && (
                <span className="mt-0.5 text-xs leading-4 text-graphite-600">{option.hint}</span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
