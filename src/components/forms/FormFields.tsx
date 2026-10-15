'use client';

import Link from 'next/link';
import { CircleAlert } from 'lucide-react';
import { formatNumber } from '@/lib/format';
import type { ConsentPart, FormField } from '@/lib/submissions/forms';
import { parseFormNumber } from '@/lib/submissions/values';

export const fieldId = (id: string) => `alan-${id}`;

interface FieldProps {
  field: FormField;
  value: string | string[];
  error?: string;
  onChange: (id: string, value: string | string[]) => void;
  onBlur: (id: string) => void;
}

function Label({ field, htmlFor }: { field: FormField; htmlFor: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-baseline justify-between gap-2 text-sm font-medium text-graphite-900"
    >
      <span>{field.label}</span>
      {!field.required && (
        <span className="shrink-0 text-xs font-normal text-graphite-500">İsteğe bağlı</span>
      )}
    </label>
  );
}

function Help({ id, text }: { id: string; text?: string }) {
  if (!text) return null;
  return (
    <p id={id} className="mt-1.5 text-sm leading-5 text-graphite-600">
      {text}
    </p>
  );
}

function ErrorText({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-red-700">
      <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      {error}
    </p>
  );
}

const inputClass = (error?: string) =>
  `mt-1.5 w-full rounded-md border bg-white px-3 text-base text-graphite-950 placeholder:text-graphite-400 focus:border-copper-600 focus:outline-none focus-visible:outline-3 focus-visible:outline-offset-0 focus-visible:outline-copper-500 ${
    error ? 'border-red-600' : 'border-graphite-300'
  }`;

function describedBy(field: FormField, error?: string) {
  const id = fieldId(field.id);
  return (
    [field.help ? `${id}-yardim` : '', error ? `${id}-hata` : ''].filter(Boolean).join(' ') ||
    undefined
  );
}

export function TextField({ field, value, error, onChange, onBlur }: FieldProps) {
  const id = fieldId(field.id);
  const raw = typeof value === 'string' ? value : '';
  const type =
    field.type === 'email'
      ? 'email'
      : field.type === 'url'
        ? 'url'
        : field.type === 'tel'
          ? 'tel'
          : 'text';
  const inputMode =
    field.type === 'number'
      ? 'decimal'
      : field.type === 'tel'
        ? 'tel'
        : field.type === 'email'
          ? 'email'
          : field.type === 'url'
            ? 'url'
            : undefined;
  let readBack: string | null = null;
  if (field.type === 'number' && !error && /[.,]/.test(raw)) {
    const parsed = parseFormNumber(raw);
    if (typeof parsed === 'number') readBack = formatNumber(parsed, 6);
  }
  return (
    <div>
      <Label field={field} htmlFor={id} />
      <input
        id={id}
        name={field.id}
        type={type}
        inputMode={inputMode}
        value={raw}
        placeholder={field.placeholder}
        maxLength={field.maxLength ? field.maxLength + 50 : undefined}
        autoComplete={field.autoComplete ?? 'off'}
        spellCheck={field.type === 'text'}
        aria-invalid={error ? true : undefined}
        aria-required={field.required ? true : undefined}
        aria-describedby={describedBy(field, error)}
        onChange={(event) => onChange(field.id, event.target.value)}
        onBlur={() => onBlur(field.id)}
        className={`${inputClass(error)} min-h-12`}
      />
      <Help id={`${id}-yardim`} text={field.help} />
      {readBack && (
        <p className="mt-1 text-xs text-graphite-600">
          Okunan değer:{' '}
          <span className="font-semibold tabular-nums text-graphite-900">{readBack}</span>
        </p>
      )}
      <ErrorText id={`${id}-hata`} error={error} />
    </div>
  );
}

export function TextAreaField({ field, value, error, onChange, onBlur }: FieldProps) {
  const id = fieldId(field.id);
  const raw = typeof value === 'string' ? value : '';
  const isList = field.type === 'list';
  const lines = isList ? raw.split(/\r?\n/).filter((line) => line.trim()).length : 0;
  return (
    <div>
      <Label field={field} htmlFor={id} />
      <textarea
        id={id}
        name={field.id}
        value={raw}
        rows={isList ? 4 : field.maxLength && field.maxLength <= 300 ? 3 : 7}
        placeholder={field.placeholder}
        aria-invalid={error ? true : undefined}
        aria-required={field.required ? true : undefined}
        aria-describedby={describedBy(field, error)}
        onChange={(event) => onChange(field.id, event.target.value)}
        onBlur={() => onBlur(field.id)}
        className={`${inputClass(error)} py-2.5 leading-6`}
      />
      <div className="flex items-start justify-between gap-3">
        <Help id={`${id}-yardim`} text={field.help} />
        <p className="mt-1.5 shrink-0 text-xs tabular-nums text-graphite-500" aria-hidden="true">
          {isList
            ? `${lines}${field.maxItems ? `/${field.maxItems}` : ''} satır`
            : field.maxLength
              ? `${raw.trim().length}/${field.maxLength}`
              : null}
        </p>
      </div>
      <ErrorText id={`${id}-hata`} error={error} />
    </div>
  );
}

export function SelectField({ field, value, error, onChange, onBlur }: FieldProps) {
  const id = fieldId(field.id);
  const raw = typeof value === 'string' ? value : '';
  return (
    <div>
      <Label field={field} htmlFor={id} />
      <select
        id={id}
        name={field.id}
        value={raw}
        aria-invalid={error ? true : undefined}
        aria-required={field.required ? true : undefined}
        aria-describedby={describedBy(field, error)}
        onChange={(event) => onChange(field.id, event.target.value)}
        onBlur={() => onBlur(field.id)}
        className={`${inputClass(error)} min-h-12`}
      >
        {!field.defaultValue && <option value="">Seçin</option>}
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Help id={`${id}-yardim`} text={field.help} />
      <ErrorText id={`${id}-hata`} error={error} />
    </div>
  );
}

export function CheckboxGroupField({ field, value, error, onChange }: FieldProps) {
  const id = fieldId(field.id);
  const selected = Array.isArray(value) ? value : [];
  return (
    <fieldset
      id={id}
      tabIndex={-1}
      aria-describedby={describedBy(field, error)}
      aria-invalid={error ? true : undefined}
    >
      <legend className="flex w-full items-baseline justify-between gap-2 text-sm font-medium text-graphite-900">
        <span>{field.label}</span>
        {!field.required && (
          <span className="text-xs font-normal text-graphite-500">İsteğe bağlı</span>
        )}
      </legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {field.options?.map((option) => {
          const optionId = `${id}-${option.value}`;
          const checked = selected.includes(option.value);
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-graphite-300 bg-white px-3 py-2 text-sm hover:border-copper-400 has-checked:border-copper-600 has-checked:bg-copper-50 has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-copper-500"
            >
              <input
                id={optionId}
                type="checkbox"
                checked={checked}
                onChange={() =>
                  onChange(
                    field.id,
                    checked
                      ? selected.filter((item) => item !== option.value)
                      : [...selected, option.value],
                  )
                }
                className="h-5 w-5 shrink-0 accent-copper-600"
              />
              <span className="font-medium text-graphite-900">{option.label}</span>
            </label>
          );
        })}
      </div>
      <Help id={`${id}-yardim`} text={field.help} />
      <ErrorText id={`${id}-hata`} error={error} />
    </fieldset>
  );
}

export function FieldControl(props: FieldProps) {
  switch (props.field.type) {
    case 'textarea':
    case 'list':
      return <TextAreaField {...props} />;
    case 'select':
      return <SelectField {...props} />;
    case 'checkboxes':
      return <CheckboxGroupField {...props} />;
    default:
      return <TextField {...props} />;
  }
}

export function ConsentCheckbox({
  id,
  parts,
  checked,
  error,
  onChange,
}: {
  id: string;
  parts: ConsentPart[];
  checked: boolean;
  error?: string;
  onChange: (id: string, checked: boolean) => void;
}) {
  const domId = `onay-${id}`;
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={domId}
          type="checkbox"
          checked={checked}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${domId}-hata` : undefined}
          onChange={(event) => onChange(id, event.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-copper-600"
        />
        <label htmlFor={domId} className="text-sm leading-6 text-graphite-800">
          {parts.map((part, index) =>
            typeof part === 'string' ? (
              <span key={index}>{part}</span>
            ) : (
              <Link
                key={index}
                href={part.href}
                target="_blank"
                className="font-semibold text-copper-700 underline"
              >
                {part.text}
                <span className="sr-only"> (yeni sekmede açılır)</span>
              </Link>
            ),
          )}
        </label>
      </div>
      <ErrorText id={`${domId}-hata`} error={error} />
    </div>
  );
}
