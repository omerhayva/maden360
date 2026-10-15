'use client';

import { Check, CircleAlert, Link2, Printer, TriangleAlert } from 'lucide-react';
import type { RefObject } from 'react';
import type { CalcOutcome, ChartData, ResultItem } from '@/calculators/core/types';
import { formatNumber } from '@/lib/format';
import { fieldDomId } from './FieldControls';

export function formatResult(item: ResultItem): string {
  return formatNumber(item.value, item.digits);
}

function Chart({ chart }: { chart: ChartData }) {
  const max = Math.max(...chart.items.map((item) => item.value), chart.reference?.value ?? 0) || 1;
  const refPct = chart.reference ? (chart.reference.value / max) * 100 : undefined;
  return (
    <figure className="mt-5">
      <figcaption className="text-xs font-semibold uppercase tracking-wide text-graphite-400">
        {chart.title}
      </figcaption>
      <ul className="mt-2 space-y-2">
        {chart.items.map((item) => (
          <li key={item.label} className="grid grid-cols-[5.5rem_1fr] items-center gap-2 text-xs">
            <span className="text-graphite-300">{item.label}</span>
            <span className="relative block h-6 rounded bg-graphite-800">
              <span
                className="absolute inset-y-0 left-0 rounded bg-copper-500"
                style={{ width: `${Math.max(0, (item.value / max) * 100)}%` }}
              />
              {refPct !== undefined && (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-[-3px] w-0 border-l-2 border-dashed border-white/80"
                  style={{ left: `${refPct}%` }}
                />
              )}
              <span className="absolute inset-y-0 right-2 flex items-center font-semibold tabular-nums text-white">
                {formatNumber(item.value)} {chart.unit}
              </span>
            </span>
          </li>
        ))}
      </ul>
      {chart.reference && (
        <p className="mt-2 text-xs text-graphite-400">
          Kesikli çizgi: {chart.reference.label} ({formatNumber(chart.reference.value)} {chart.unit}
          )
        </p>
      )}
    </figure>
  );
}

interface ResultPanelProps {
  headingId: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  outcome: CalcOutcome;
  showErrors: boolean;
  hasInput: boolean;
  fieldLabels: Record<string, string>;
  copied: boolean;
  onCopy: () => void;
  onPrint: () => void;
  onExample: () => void;
}

export function ResultPanel({
  headingId,
  headingRef,
  outcome,
  showErrors,
  hasInput,
  fieldLabels,
  copied,
  onCopy,
  onPrint,
  onExample,
}: ResultPanelProps) {
  return (
    <section
      aria-labelledby={headingId}
      className="rounded-xl border border-graphite-800 bg-graphite-950 p-5 text-white shadow-lg sm:p-6 lg:sticky lg:top-20"
    >
      <h2
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className="text-sm font-semibold uppercase tracking-wide text-copper-400 focus:outline-none"
      >
        Sonuç
      </h2>

      {outcome.ok ? (
        <OkResult outcome={outcome} copied={copied} onCopy={onCopy} onPrint={onPrint} />
      ) : showErrors ? (
        <div className="mt-3">
          <p className="flex items-start gap-2 font-semibold text-red-300">
            <CircleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
            Hesaplama yapılamadı
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {outcome.formErrors.map((message) => (
              <li key={message} className="rounded-md bg-red-950/60 p-3 leading-6 text-red-100">
                {message}
              </li>
            ))}
            {Object.entries(outcome.fieldErrors).map(([id, message]) => (
              <li key={id}>
                <a
                  href={`#${fieldDomId(id)}`}
                  className="text-red-100 underline decoration-red-300/60 underline-offset-2 hover:text-white"
                >
                  <strong>{fieldLabels[id] ?? id}:</strong> {message}
                </a>
              </li>
            ))}
            {outcome.missing.map((id) => (
              <li key={id}>
                <a
                  href={`#${fieldDomId(id)}`}
                  className="text-red-100 underline decoration-red-300/60 underline-offset-2 hover:text-white"
                >
                  <strong>{fieldLabels[id] ?? id}:</strong> bu alan zorunlu.
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-3 text-sm leading-6 text-graphite-300">
          <p>
            {hasInput
              ? 'Sonucu görmek için zorunlu alanları doldurun.'
              : 'Değerleri girin; sonuç siz yazdıkça burada güncellenir.'}
          </p>
          <button
            type="button"
            onClick={onExample}
            className="mt-4 inline-flex min-h-11 items-center rounded-md border border-graphite-600 px-4 text-sm font-semibold text-white hover:border-copper-400 hover:text-copper-300"
          >
            Örnek değerlerle dene
          </button>
        </div>
      )}
    </section>
  );
}

function OkResult({
  outcome,
  copied,
  onCopy,
  onPrint,
}: {
  outcome: Extract<CalcOutcome, { ok: true }>;
  copied: boolean;
  onCopy: () => void;
  onPrint: () => void;
}) {
  const main = outcome.results.find((item) => item.emphasis) ?? outcome.results[0]!;
  const others = outcome.results.filter((item) => item !== main);
  return (
    <div>
      <p className="mt-3 text-sm text-graphite-300">{main.label}</p>
      <p className="mt-1 break-words text-4xl font-bold tabular-nums tracking-tight">
        {formatResult(main)}
        {main.unit && (
          <span className="ml-2 text-xl font-semibold text-graphite-300">{main.unit}</span>
        )}
      </p>

      {others.length > 0 && (
        <dl className="mt-5 grid gap-px overflow-hidden rounded-lg bg-graphite-800 sm:grid-cols-2">
          {others.map((item) => (
            <div
              key={item.id}
              className="bg-graphite-900 p-3 sm:[&:last-child:nth-child(odd)]:col-span-2"
            >
              <dt className="text-xs leading-4 text-graphite-400">{item.label}</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums">
                {formatResult(item)}
                {item.unit && (
                  <span className="ml-1 text-sm font-normal text-graphite-400">{item.unit}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {outcome.chart && <Chart chart={outcome.chart} />}

      {outcome.warnings.length > 0 && (
        <div className="mt-5 rounded-lg bg-amber-100 p-3 text-sm text-amber-950">
          <p className="flex items-center gap-1.5 font-semibold">
            <TriangleAlert aria-hidden="true" className="h-4 w-4" />
            Dikkat
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5 leading-6">
            {outcome.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-graphite-400">Yorum</h3>
        <ul className="mt-2 space-y-2 text-sm leading-6 text-graphite-100">
          {outcome.interpretation.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <details className="group mt-5 rounded-lg border border-graphite-800 bg-graphite-900" open>
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-3 text-sm font-semibold text-graphite-100">
          Hesaplama adımları
          <span
            aria-hidden="true"
            className="text-graphite-400 transition-transform group-open:rotate-180"
          >
            ▾
          </span>
        </summary>
        <ol className="space-y-1.5 border-t border-graphite-800 px-3 py-3 font-mono text-[0.8rem] leading-5 text-graphite-200">
          {outcome.steps.map((step) => (
            <li key={step} className="break-words">
              {step}
            </li>
          ))}
        </ol>
      </details>

      <div className="no-print mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-graphite-600 px-3 text-sm font-semibold text-white hover:border-copper-400"
        >
          {copied ? (
            <Check aria-hidden="true" className="h-4 w-4 text-emerald-400" />
          ) : (
            <Link2 aria-hidden="true" className="h-4 w-4" />
          )}
          {copied ? 'Bağlantı kopyalandı' : 'Bağlantıyı kopyala'}
        </button>
        <button
          type="button"
          onClick={onPrint}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-graphite-600 px-3 text-sm font-semibold text-white hover:border-copper-400"
        >
          <Printer aria-hidden="true" className="h-4 w-4" />
          Yazdır
        </button>
      </div>
    </div>
  );
}
