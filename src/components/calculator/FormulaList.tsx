import 'katex/dist/katex.min.css';
import katex from 'katex';
import type { CalculatorDefinition } from '@/calculators/core/types';
import { allFields, isOptional, unitLabel, withDefaults } from '@/calculators/core/read';
import { formatNumber } from '@/lib/format';

function renderTex(tex: string, displayMode: boolean): string {
  const html = katex.renderToString(tex, {
    displayMode,
    throwOnError: false,
    strict: 'ignore',
    output: 'htmlAndMathml',
  });
  // Dar ekranlarda yatay kayan formüller klavyeyle de kaydırılabilsin
  return html.replace('class="katex-display"', 'class="katex-display" tabindex="0"');
}

/** Formüller ve sembol açıklamaları (derleme sırasında sunucuda işlenir). */
export function FormulaList({ definition }: { definition: CalculatorDefinition }) {
  return (
    <div className="space-y-4">
      {definition.formulas.map((formula) => (
        <figure key={formula.id} className="rounded-xl border border-stone-200 bg-white p-5">
          <figcaption className="text-sm font-semibold uppercase tracking-wide text-graphite-600">
            {formula.label}
          </figcaption>
          <div
            role="group"
            aria-label={`${formula.label} formülü`}
            className="mt-2 text-graphite-950"
            dangerouslySetInnerHTML={{ __html: renderTex(formula.tex, true) }}
          />
          {formula.legend && formula.legend.length > 0 && (
            <dl className="mt-3 grid gap-x-6 gap-y-1.5 border-t border-stone-200 pt-3 text-sm sm:grid-cols-2">
              {formula.legend.map((item) => (
                <div key={item.symbol} className="flex gap-2">
                  <dt
                    className="min-w-12 font-medium"
                    dangerouslySetInnerHTML={{ __html: renderTex(item.symbol, false) }}
                  />
                  <dd className="text-graphite-700">
                    {item.meaning}
                    {item.unit && item.unit !== '—' && (
                      <span className="text-graphite-500"> [{item.unit}]</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </figure>
      ))}
    </div>
  );
}

/** Girdi alanları, birimleri ve doğrulama kuralları tablosu (tanımdan otomatik üretilir). */
export function InputsTable({ definition }: { definition: CalculatorDefinition }) {
  const defaults = withDefaults(definition, {});
  const rows = allFields(definition).filter((field) => field.kind === 'number');
  return (
    <div
      className="table-wrap"
      tabIndex={0}
      role="region"
      aria-label="Girdiler ve birimler tablosu"
    >
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            <th scope="col" className="font-semibold">
              Girdi
            </th>
            <th scope="col" className="font-semibold">
              Birim
            </th>
            <th scope="col" className="font-semibold">
              Kural
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200">
          {rows.map((field) => {
            if (field.kind !== 'number') return null;
            const units = field.units
              ? field.units.map((unit) => unit.label).join(', ')
              : (unitLabel(field, defaults) ?? '—');
            const rules: string[] = [];
            if (field.min !== undefined) {
              rules.push(
                field.minExclusive
                  ? `> ${formatNumber(field.min)}`
                  : `≥ ${formatNumber(field.min)}`,
              );
            }
            if (field.max !== undefined) {
              rules.push(
                field.maxExclusive
                  ? `< ${formatNumber(field.max)}`
                  : `≤ ${formatNumber(field.max)}`,
              );
            }
            if (field.integer) rules.push('tam sayı');
            const optional =
              typeof field.optional === 'function'
                ? 'yönteme göre'
                : isOptional(field, defaults)
                  ? 'isteğe bağlı'
                  : 'zorunlu';
            rules.push(optional);
            return (
              <tr key={field.id}>
                <td className="font-medium text-graphite-900">{field.label}</td>
                <td className="whitespace-nowrap text-graphite-700">{units}</td>
                <td className="text-graphite-700">{rules.join(' · ')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
