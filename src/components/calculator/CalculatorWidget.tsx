'use client';

import { RotateCcw, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { allFields, isFieldVisible, unitKey, withDefaults } from '@/calculators/core/read';
import type { CalcOutcome, CalculatorDefinition, FormValues } from '@/calculators/core/types';
import { getCalculatorDefinition } from '@/calculators/registry';
import { formatNumber } from '@/lib/format';
import { ChoiceInput, NumberInput, fieldDomId } from './FieldControls';
import { ResultPanel } from './ResultPanel';

const MAX_PARAM_LENGTH = 40;

/**
 * Etkileşimli hesaplama formu.
 * - Sonuç siz yazdıkça güncellenir; hatalar alan terk edilince veya "Hesapla" ile gösterilir.
 * - Değerler URL'ye yazılır; bağlantı paylaşılınca aynı hesap açılır.
 * - Tüm hesap, arayüzden bağımsız `compute` fonksiyonunda yapılır (src/calculators).
 */
export function CalculatorWidget({ slug }: { slug: string }) {
  const definition = getCalculatorDefinition(slug);
  if (!definition) throw new Error(`Hesaplayıcı tanımı bulunamadı: ${slug}`);
  return <CalculatorForm definition={definition} />;
}

function CalculatorForm({ definition }: { definition: CalculatorDefinition }) {
  const [values, setValues] = useState<FormValues>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [copied, setCopied] = useState(false);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const baseId = useId();
  const headingId = `${baseId}-sonuc`;

  const fields = useMemo(() => allFields(definition), [definition]);
  const knownKeys = useMemo(
    () => new Set(fields.flatMap((field) => [field.id, unitKey(field.id)])),
    [fields],
  );
  const fieldLabels = useMemo(
    () => Object.fromEntries(fields.map((field) => [field.id, field.label])),
    [fields],
  );

  // Paylaşılan bağlantıdaki değerleri yükle (yalnızca ilk açılışta, dış kaynaktan eşitleme)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl: FormValues = {};
    params.forEach((value, key) => {
      if (knownKeys.has(key)) fromUrl[key] = value.slice(0, MAX_PARAM_LENGTH);
    });
    if (Object.keys(fromUrl).length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- URL (harici kaynak) ile tek seferlik eşitleme
      setValues(fromUrl);
      setSubmitted(true);
    }
  }, [knownKeys]);

  const resolved = useMemo(() => withDefaults(definition, values), [definition, values]);
  const outcome: CalcOutcome = useMemo(() => definition.compute(values), [definition, values]);
  const hasInput = fields.some(
    (field) => field.kind === 'number' && (values[field.id] ?? '').trim() !== '',
  );

  // Başarılı hesapta değerleri URL'ye yaz (paylaşılabilir bağlantı)
  useEffect(() => {
    if (!outcome.ok) return;
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams();
      for (const section of definition.sections) {
        for (const field of section.fields) {
          if (!isFieldVisible(field, section, resolved)) continue;
          const value = resolved[field.id];
          if (value && value.trim() !== '') params.set(field.id, value.trim());
          if (field.kind === 'number' && field.units?.length)
            params.set(unitKey(field.id), resolved[unitKey(field.id)]!);
        }
      }
      window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}?${params.toString()}`,
      );
    }, 300);
    return () => window.clearTimeout(timer);
  }, [outcome, resolved, definition]);

  const handleChange = useCallback((key: string, value: string) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setCopied(false);
  }, []);

  const handleBlur = useCallback((fieldId: string) => {
    setTouched((previous) => (previous[fieldId] ? previous : { ...previous, [fieldId]: true }));
  }, []);

  const errorFor = (fieldId: string): string | undefined => {
    if (outcome.ok) return undefined;
    const message = outcome.fieldErrors[fieldId];
    if (message && (touched[fieldId] || submitted)) return message;
    if (submitted && outcome.missing.includes(fieldId)) return 'Bu alan zorunlu.';
    return undefined;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (outcome.ok) {
      const main = outcome.results.find((item) => item.emphasis) ?? outcome.results[0];
      setAnnouncement(
        main
          ? `Hesaplama tamamlandı. ${main.label}: ${formatNumber(main.value, main.digits)} ${main.unit ?? ''}`
          : 'Hesaplama tamamlandı.',
      );
      resultsHeadingRef.current?.focus();
      resultsHeadingRef.current?.scrollIntoView({ block: 'start' });
    } else {
      const firstInvalid = [...Object.keys(outcome.fieldErrors), ...outcome.missing][0];
      const count = Object.keys(outcome.fieldErrors).length + outcome.missing.length;
      setAnnouncement(
        count > 0
          ? `Hesaplama yapılamadı. ${count} alanı kontrol edin.`
          : `Hesaplama yapılamadı. ${outcome.formErrors[0] ?? ''}`,
      );
      if (firstInvalid) document.getElementById(fieldDomId(firstInvalid))?.focus();
      else resultsHeadingRef.current?.focus();
    }
  };

  const fillExample = () => {
    setValues({ ...definition.example.values });
    setTouched({});
    setSubmitted(true);
    setAnnouncement('Örnek değerler dolduruldu.');
  };

  const reset = () => {
    setValues({});
    setTouched({});
    setSubmitted(false);
    setCopied(false);
    setAnnouncement('Form temizlendi.');
    window.history.replaceState(window.history.state, '', window.location.pathname);
  };

  const copyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setAnnouncement('Bağlantı panoya kopyalandı.');
    } catch {
      window.prompt('Bağlantıyı kopyalayın:', url);
    }
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      <form
        noValidate
        onSubmit={handleSubmit}
        aria-labelledby={`${baseId}-girdiler`}
        className="min-w-0 space-y-4"
      >
        <h2 id={`${baseId}-girdiler`} className="sr-only">
          Girdiler
        </h2>
        <p className="rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-graphite-700">
          <span className="font-semibold">Örnek:</span> {definition.example.title}
        </p>

        {definition.sections.map((section) => {
          const visibleFields = section.fields.filter((field) =>
            isFieldVisible(field, section, resolved),
          );
          if (visibleFields.length === 0) return null;
          return (
            <fieldset
              key={section.id}
              className="min-w-0 rounded-xl border border-stone-200 bg-white p-4 sm:p-5"
            >
              <legend className="float-left w-full text-base font-semibold text-graphite-950">
                {section.title}
              </legend>
              {section.description && (
                <p className="clear-both pt-1 text-sm leading-6 text-graphite-600">
                  {section.description}
                </p>
              )}
              <div className="clear-both mt-4 grid gap-5 sm:grid-cols-2">
                {visibleFields.map((field) =>
                  field.kind === 'choice' ? (
                    <div key={field.id} className="sm:col-span-2">
                      <ChoiceInput
                        field={field}
                        value={resolved[field.id] ?? field.defaultValue}
                        onChange={handleChange}
                      />
                    </div>
                  ) : (
                    <NumberInput
                      key={field.id}
                      field={field}
                      values={resolved}
                      error={errorFor(field.id)}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  ),
                )}
              </div>
            </fieldset>
          );
        })}

        <div className="no-print flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-copper-600 px-6 text-base font-semibold text-white shadow-sm hover:bg-copper-700"
          >
            Hesapla
          </button>
          <button
            type="button"
            onClick={fillExample}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-graphite-300 bg-white px-5 text-base font-semibold text-graphite-800 hover:border-copper-400 hover:text-copper-800"
          >
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            Örnek değerleri doldur
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-4 text-base font-medium text-graphite-600 hover:bg-stone-200 hover:text-graphite-900"
          >
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Temizle
          </button>
        </div>
        <p role="status" aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </form>

      <ResultPanel
        headingId={headingId}
        headingRef={resultsHeadingRef}
        outcome={outcome}
        showErrors={submitted}
        hasInput={hasInput}
        fieldLabels={fieldLabels}
        copied={copied}
        onCopy={copyLink}
        onPrint={() => window.print()}
        onExample={fillExample}
      />
    </div>
  );
}
