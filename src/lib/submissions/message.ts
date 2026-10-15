import { formatDate } from '@/lib/format';
import { buildDraft, type Draft } from './draft';
import { allFields, isShown, type FormDefinition, type FormField } from './forms';
import { arrayValue, listValue, textValue, type FormValues } from './values';

export interface Submission {
  ref: string;
  subject: string;
  /** Editöre gönderilen okunur metin (taslak dosya dahil) */
  text: string;
  draft?: Draft;
  /** Yanıt adresi (başvuru sahibinin e-postası) */
  replyTo?: string;
}

function displayValue(field: FormField, values: FormValues): string | string[] | undefined {
  if (field.type === 'checkboxes') {
    const selected = arrayValue(values, field.id);
    const labels = selected.map(
      (value) => field.options?.find((o) => o.value === value)?.label ?? value,
    );
    return labels.length > 0 ? labels.join(', ') : undefined;
  }
  if (field.type === 'list') {
    const items = listValue(values, field.id);
    return items.length > 0 ? items : undefined;
  }
  const raw = textValue(values, field.id);
  if (!raw) return undefined;
  if (field.type === 'select')
    return field.options?.find((option) => option.value === raw)?.label ?? raw;
  return raw;
}

function consentText(parts: FormDefinition['consents'][number]['parts']): string {
  return parts.map((part) => (typeof part === 'string' ? part : part.text)).join('');
}

/** Başvuruyu editöre gönderilecek metne ve taslak içerik dosyasına dönüştürür. */
export function buildSubmission(
  definition: FormDefinition,
  values: FormValues,
  context: { ref: string; today: string; pageUrl?: string; marketKind?: string },
): Submission {
  const { ref, today } = context;
  const lines: string[] = [
    `Maden360 — ${definition.title}`,
    `Başvuru no: ${ref}`,
    `Tarih: ${formatDate(today)}`,
  ];
  if (context.pageUrl) lines.push(`Form: ${context.pageUrl}`);

  const fields = allFields(definition);
  for (const section of definition.sections) {
    if (!isShown(section.showIf, values)) continue;
    const sectionLines: string[] = [];
    for (const field of section.fields) {
      const resolved = fields.find((item) => item.id === field.id) ?? field;
      if (!isShown(resolved.showIf, values)) continue;
      const value = displayValue(field, values);
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        sectionLines.push(`${field.label}:`);
        for (const item of value) sectionLines.push(`  • ${item}`);
      } else if (field.type === 'textarea') {
        sectionLines.push(`${field.label}:`, value);
      } else {
        sectionLines.push(`${field.label}: ${value}`);
      }
    }
    if (sectionLines.length > 0) lines.push('', `== ${section.title} ==`, ...sectionLines);
  }

  const consents = definition.consents.filter((consent) => isShown(consent.showIf, values));
  if (consents.length > 0) {
    lines.push('', '== Onaylar ==');
    for (const consent of consents) lines.push(`[x] ${consentText(consent.parts)}`);
  }

  const draft = buildDraft(definition.kind, values, { ref, today, marketKind: context.marketKind });
  if (draft) {
    lines.push(
      '',
      '----- Editör için taslak içerik dosyası -----',
      `Dosya: ${draft.path}`,
      '',
      draft.content.trimEnd(),
    );
  }

  const headline =
    textValue(values, 'title') ||
    textValue(values, 'headline') ||
    textValue(values, 'name') ||
    textValue(values, 'ref');
  return {
    ref,
    subject: `[Maden360] ${definition.title}${headline ? `: ${headline}` : ''} (${ref})`,
    text: lines.join('\n'),
    draft,
    replyTo: textValue(values, 'contactEmail') || undefined,
  };
}
