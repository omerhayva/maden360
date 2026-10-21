'use client';

import { useSearchParams } from 'next/navigation';
import { Check, ChevronRight, CircleAlert, Copy, Mail, RotateCcw, Send } from 'lucide-react';
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from 'react';
import { Button, ButtonGroup, ButtonLink } from '@/components/ui/Button';
import { createRef } from '@/lib/listings/format';
import { todayInTurkey } from '@/lib/listings/dates';
import { buildMailto, postSubmission, type DeliveryConfig } from '@/lib/submissions/deliver';
import { allFields, isShown, type FormDefinition } from '@/lib/submissions/forms';
import { buildSubmission, type Submission } from '@/lib/submissions/message';
import {
  hasErrors,
  validateField,
  validateSubmission,
  type ValidationResult,
} from '@/lib/submissions/validate';
import type { FormValues } from '@/lib/submissions/values';
import { ConsentCheckbox, FieldControl, fieldId } from './FormFields';

interface SubmissionFormProps {
  definition: FormDefinition;
  delivery: DeliveryConfig;
  /** Market kategorisi slug → tür (taslak dosyada hangi blokların yazılacağı) */
  marketKinds?: Record<string, string>;
  /** URL parametresinden doldurulacak alanlar: { ref: 'ilan' } → ?ilan=ADY-... */
  queryPrefill?: Record<string, string>;
}

type Outcome =
  | { status: 'sent'; submission: Submission }
  | { status: 'mailto'; submission: Submission; mailto: string }
  | { status: 'failed'; submission: Submission; mailto: string };

function initialValues(definition: FormDefinition): FormValues {
  const values: FormValues = {};
  for (const field of allFields(definition)) {
    values[field.id] = field.type === 'checkboxes' ? [] : (field.defaultValue ?? '');
  }
  return values;
}

/** ?ilan=ADY-... gibi parametreleri forma aktarır (Suspense içinde, sayfanın geri kalanı statik kalır). */
function QueryPrefill({
  map,
  onPrefill,
}: {
  map: Record<string, string>;
  onPrefill: (values: FormValues) => void;
}) {
  const params = useSearchParams();
  useEffect(() => {
    const found: FormValues = {};
    for (const [fieldKey, param] of Object.entries(map)) {
      const value = params.get(param);
      if (value) found[fieldKey] = value.slice(0, 40);
    }
    if (Object.keys(found).length > 0) onPrefill(found);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- yalnızca ilk yüklemede
  }, [params]);
  return null;
}

export function SubmissionForm({
  definition,
  delivery,
  marketKinds = {},
  queryPrefill,
}: SubmissionFormProps) {
  const [values, setValues] = useState<FormValues>(() => initialValues(definition));
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<ValidationResult>({ fieldErrors: {}, consentErrors: {} });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [honeypot, setHoneypot] = useState('');
  /** Çift tıklama koruması: durum güncellemesi beklenmeden ikinci gönderimi engeller */
  const busyRef = useRef(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const fields = useMemo(() => allFields(definition), [definition]);

  useEffect(() => {
    if (outcome) resultRef.current?.focus();
  }, [outcome]);

  const revalidateField = (id: string, nextValues: FormValues) => {
    const field = fields.find((item) => item.id === id);
    if (!field) return;
    const message = isShown(field.showIf, nextValues)
      ? validateField(field, nextValues)
      : undefined;
    setErrors((current) => {
      const fieldErrors = { ...current.fieldErrors };
      if (message) fieldErrors[id] = message;
      else delete fieldErrors[id];
      return { ...current, fieldErrors };
    });
  };

  const handleChange = (id: string, value: string | string[]) => {
    const next = { ...values, [id]: value };
    setValues(next);
    if (errors.fieldErrors[id] || (submitted && Array.isArray(value))) revalidateField(id, next);
  };

  const handleBlur = (id: string) => {
    const value = values[id];
    if (submitted || (typeof value === 'string' && value.trim() !== ''))
      revalidateField(id, values);
  };

  const handleConsent = (id: string, checked: boolean) => {
    setConsents((current) => ({ ...current, [id]: checked }));
    if (checked && errors.consentErrors[id]) {
      setErrors((current) => {
        const consentErrors = { ...current.consentErrors };
        delete consentErrors[id];
        return { ...current, consentErrors };
      });
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (busyRef.current) return;
    setSubmitted(true);
    const result = validateSubmission(definition, values, consents);
    setErrors(result);
    if (hasErrors(result)) {
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    const today = todayInTurkey();
    const ref = createRef(definition.refPrefix, today);
    const category = typeof values.category === 'string' ? values.category : '';
    const submission = buildSubmission(definition, values, {
      ref,
      today,
      pageUrl: window.location.origin + window.location.pathname,
      marketKind: marketKinds[category],
    });
    if (honeypot) {
      // Otomatik doldurulan gizli alan: istenmeyen başvuru, sessizce yok sayılır.
      setOutcome({ status: 'sent', submission });
      return;
    }
    const mailto = buildMailto(delivery.email, submission.subject, submission.text);
    if (delivery.endpoint) {
      busyRef.current = true;
      setSending(true);
      try {
        const status = await postSubmission(delivery, submission, definition.kind);
        setOutcome(
          status === 'sent' ? { status, submission } : { status: 'failed', submission, mailto },
        );
      } finally {
        busyRef.current = false;
        setSending(false);
      }
      return;
    }
    setOutcome({ status: 'mailto', submission, mailto });
    window.location.href = mailto;
  };

  if (outcome) {
    return (
      <SubmissionResult
        outcome={outcome}
        email={delivery.email}
        resultRef={resultRef}
        onReset={() => {
          setOutcome(null);
          setValues(initialValues(definition));
          setConsents({});
          setSubmitted(false);
          setErrors({ fieldErrors: {}, consentErrors: {} });
        }}
      />
    );
  }

  const errorEntries = [
    ...Object.entries(errors.fieldErrors).map(([id, message]) => ({
      href: `#${fieldId(id)}`,
      message,
    })),
    ...Object.entries(errors.consentErrors).map(([id, message]) => ({
      href: `#onay-${id}`,
      message,
    })),
  ];

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-8" aria-describedby="form-aciklama">
      {queryPrefill && (
        <Suspense fallback={null}>
          <QueryPrefill
            map={queryPrefill}
            onPrefill={(found) => setValues((current) => ({ ...current, ...found }))}
          />
        </Suspense>
      )}

      <p id="form-aciklama" className="text-sm text-graphite-600">
        Zorunlu olmayan alanlar “İsteğe bağlı” olarak işaretlidir.
      </p>

      {submitted && errorEntries.length > 0 && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="rounded-sm border border-red-300 bg-red-50 p-4 text-red-950 focus:outline-3 focus:outline-red-700"
        >
          <p className="flex items-center gap-2 font-semibold">
            <CircleAlert aria-hidden="true" className="h-5 w-5" />
            Formda {errorEntries.length} sorun var
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-sm">
            {errorEntries.map((entry) => (
              <li key={entry.href}>
                <a
                  href={entry.href}
                  className="underline"
                  onClick={(event) => {
                    event.preventDefault();
                    const target = document.querySelector<HTMLElement>(entry.href);
                    target?.focus();
                    target?.scrollIntoView({ block: 'center' });
                  }}
                >
                  {entry.message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {definition.sections.map((section) =>
        isShown(section.showIf, values) ? (
          <fieldset
            key={section.id}
            aria-labelledby={`bolum-${section.id}`}
            className="rounded-sm border border-stone-300 bg-white p-5 sm:p-6"
          >
            <h2 id={`bolum-${section.id}`} className="text-lg font-semibold text-graphite-950">
              {section.title}
            </h2>
            {section.description && (
              <p className="mt-1 text-sm text-graphite-600">{section.description}</p>
            )}
            <div className="mt-5 space-y-5">
              {section.fields.map((field) => {
                const resolved = fields.find((item) => item.id === field.id) ?? field;
                if (!isShown(resolved.showIf, values)) return null;
                return (
                  <FieldControl
                    key={field.id}
                    field={field}
                    value={values[field.id] ?? ''}
                    error={errors.fieldErrors[field.id]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                );
              })}
            </div>
          </fieldset>
        ) : null,
      )}

      <fieldset
        aria-labelledby="bolum-onaylar"
        className="rounded-sm border border-stone-300 bg-white p-5 sm:p-6"
      >
        <h2 id="bolum-onaylar" className="text-lg font-semibold text-graphite-950">
          Onaylar
        </h2>
        <div className="mt-4 space-y-4">
          {definition.consents.map((consent) =>
            isShown(consent.showIf, values) ? (
              <ConsentCheckbox
                key={consent.id}
                id={consent.id}
                parts={consent.parts}
                checked={Boolean(consents[consent.id])}
                error={errors.consentErrors[consent.id]}
                onChange={handleConsent}
              />
            ) : null,
          )}
        </div>
      </fieldset>

      {/* Bot tuzağı: gerçek kullanıcılar görmez ve doldurmaz */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="web-sitesi-onay">Bu alanı boş bırakın</label>
        <input
          id="web-sitesi-onay"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      <div className="rounded-sm border border-stone-300 bg-white p-5 sm:p-6">
        <p className="text-sm leading-6 text-graphite-700">
          {delivery.endpoint
            ? 'Başvurunuz doğrudan editörlerimize iletilir. Bir başvuru numarası alacaksınız.'
            : `Gönder düğmesi e-posta uygulamanızı başvuru metniyle açar (${delivery.email}). E-postayı göndermeniz yeterli. Bir başvuru numarası alacaksınız.`}
          {definition.durationDays
            ? ` Onaylanan ${definition.kind === 'fuar-standi' ? 'stand' : 'ilan'} ${definition.durationDays} gün yayında kalır.`
            : ''}
        </p>
        <Button
          type="submit"
          size="lg"
          width="full-mobile"
          icon={Send}
          loading={sending}
          loadingLabel="Başvurunuz gönderiliyor, lütfen bekleyin"
          className="mt-4"
        >
          {sending ? 'Gönderiliyor…' : definition.submitLabel}
        </Button>
      </div>
    </form>
  );
}

function SubmissionResult({
  outcome,
  email,
  resultRef,
  onReset,
}: {
  outcome: Outcome;
  email: string;
  resultRef: RefObject<HTMLDivElement | null>;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const { submission } = outcome;

  // "Kopyalandı" geri bildirimi birkaç saniye sonra eski haline döner
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 3000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(submission.text);
      setCopied(true);
    } catch {
      // Pano izni yoksa metni göster ve seç; kullanıcı kendisi kopyalar
      const area = document.getElementById('basvuru-metni') as HTMLTextAreaElement | null;
      area?.closest('details')?.setAttribute('open', '');
      area?.select();
    }
  };
  const title =
    outcome.status === 'sent'
      ? 'Başvurunuz alındı'
      : outcome.status === 'mailto'
        ? 'Son adım: e-postayı gönderin'
        : 'Gönderilemedi, e-postayla iletin';
  return (
    <div ref={resultRef} tabIndex={-1} role="status" className="space-y-5 focus:outline-none">
      <div
        className={`rounded-sm border p-5 sm:p-6 ${outcome.status === 'failed' ? 'border-amber-300 bg-amber-50' : 'border-emerald-300 bg-emerald-50'}`}
      >
        <h2 className="flex items-center gap-2 text-xl font-semibold text-graphite-950">
          {outcome.status === 'failed' ? (
            <CircleAlert aria-hidden="true" className="h-6 w-6 text-amber-700" />
          ) : (
            <Check aria-hidden="true" className="h-6 w-6 text-emerald-700" />
          )}
          {title}
        </h2>
        <p className="mt-3 text-graphite-800">
          Başvuru numaranız: <strong className="font-mono text-lg">{submission.ref}</strong>
        </p>
        <p className="mt-2 text-sm leading-6 text-graphite-700">
          {outcome.status === 'sent' &&
            'Başvurunuzu editör kontrol edecek. Eksik bilgi varsa size e-postayla yazacağız. Yazışmalarda başvuru numaranızı kullanın.'}
          {outcome.status === 'mailto' &&
            `E-posta uygulamanız başvuru metniyle açılmış olmalı. E-postayı ${email} adresine gönderdiğinizde başvurunuz bize ulaşır. Uygulama açılmadıysa aşağıdaki düğmeyi kullanın veya metni kopyalayıp e-postayla gönderin.`}
          {outcome.status === 'failed' &&
            `Form hizmetine şu an ulaşılamadı. Başvuru metni hazır, ${email} adresine e-postayla gönderebilirsiniz.`}
        </p>
        {outcome.status !== 'sent' && (
          <ButtonGroup className="mt-4">
            <ButtonLink href={outcome.mailto} icon={Mail}>
              E-posta uygulamasını aç
            </ButtonLink>
            {/* Sonuç kutusu bir canlı bölge (role="status"): "Kopyalandı" ekran okuyucuya duyurulur */}
            <Button variant="secondary" icon={copied ? Check : Copy} onClick={copy}>
              {copied ? 'Kopyalandı' : 'Metni kopyala'}
            </Button>
          </ButtonGroup>
        )}
      </div>

      {outcome.status !== 'sent' && (
        <details className="group/ayrinti rounded-sm border border-stone-300 bg-white">
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 rounded-sm px-5 font-semibold text-graphite-900 transition-colors duration-100 ui-hover:bg-stone-50 [&::-webkit-details-marker]:hidden">
            <ChevronRight
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-graphite-500 group-open/ayrinti:rotate-90"
            />
            Başvuru metnini göster
          </summary>
          <div className="px-5 pb-5">
            <label htmlFor="basvuru-metni" className="sr-only">
              Başvuru metni
            </label>
            <textarea
              id="basvuru-metni"
              readOnly
              value={submission.text}
              rows={14}
              className="w-full rounded-sm border border-graphite-500 bg-stone-50 p-3 font-mono text-xs leading-5 text-graphite-900"
            />
          </div>
        </details>
      )}

      <Button variant="ghost" icon={RotateCcw} onClick={onReset} className="-ml-2">
        Yeni başvuru
      </Button>
    </div>
  );
}
