import Link from 'next/link';
import { CalendarDays, Clock, History, Mail, Sparkles, UserCheck } from 'lucide-react';
import { Callout } from '@/components/ui/Callout';
import { StatusBadge } from '@/components/ui/Badge';
import { siteConfig } from '@/config/site';
import { routes } from '@/i18n/routes';
import { formatDate } from '@/lib/format';
import type { Correction, ContentStatus, LegalInstrument, Person } from '@/lib/content/schemas';
import { statusLabels } from '@/lib/content/visibility';
import { absoluteUrl } from '@/lib/seo/metadata';

interface EditorialData {
  status: ContentStatus;
  authors: Person[];
  reviewers: Person[];
  publishedAt?: string;
  reviewedAt?: string;
  updatedAt?: string;
  corrections: Correction[];
  aiAssisted: boolean;
}

const personLabel = (person: Person) => (person.title ? `${person.name} (${person.title})` : person.name);

/** Başlığın altındaki kısa bilgi satırı */
export function EditorialMeta({ data, readingMinutes }: { data: EditorialData; readingMinutes?: number }) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-graphite-600">
      <span className="inline-flex items-center gap-1.5">
        <UserCheck aria-hidden="true" className="h-4 w-4 text-copper-600" />
        {data.reviewers.length > 0
          ? `Teknik inceleme: ${data.reviewers.map((p) => p.name).join(', ')}`
          : 'Teknik inceleme bekleniyor'}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays aria-hidden="true" className="h-4 w-4 text-copper-600" />
        {data.reviewedAt ? `Son inceleme: ${formatDate(data.reviewedAt)}` : 'Henüz incelenmedi'}
      </span>
      {readingMinutes !== undefined && (
        <span className="inline-flex items-center gap-1.5">
          <Clock aria-hidden="true" className="h-4 w-4 text-copper-600" />
          {readingMinutes} dk okuma
        </span>
      )}
    </div>
  );
}

/** Yayımlanmamış içerik uyarısı (yalnızca önizleme ortamında görülür) */
export function StatusNotice({ status, aiAssisted }: { status: ContentStatus; aiAssisted: boolean }) {
  if (status === 'published') return null;
  return (
    <Callout variant="warning" title={`Bu içerik henüz yayımlanmadı — ${statusLabels[status]}`} className="mt-6">
      <p>
        Teknik inceleme tamamlanmadığı için yalnızca önizleme ortamında görünür. Bilgiler uzman doğrulamasından
        geçmeden saha kararlarında kullanılmamalıdır.
      </p>
      {aiAssisted && (
        <p className="mt-1">
          İlk taslak yapay zekâ desteğiyle hazırlandı; kaynakların doğrulanması ve teknik inceleme bekleniyor.
        </p>
      )}
    </Callout>
  );
}

/** İçerikte düzeltme yapıldıysa başta gösterilen kısa not */
export function CorrectionNotice({ corrections }: { corrections: Correction[] }) {
  if (corrections.length === 0) return null;
  const latest = [...corrections].sort((a, b) => b.date.localeCompare(a.date))[0]!;
  return (
    <Callout variant="info" title="Düzeltme yapıldı" className="mt-6">
      <p>
        Bu içerikte {formatDate(latest.date)} tarihinde düzeltme yapıldı: {latest.note}{' '}
        <a href="#duzeltme-gecmisi" className="font-semibold underline">
          Düzeltme geçmişi
        </a>
      </p>
    </Callout>
  );
}

/** Mevzuat içeriğinde yürürlük ve değişiklik bilgisi */
export function LegalInfo({ instruments }: { instruments?: LegalInstrument[] }) {
  if (!instruments || instruments.length === 0) return null;
  return (
    <section aria-labelledby="mevzuat-bilgisi" className="mt-6 rounded-xl border border-graphite-200 bg-white p-5">
      <h2 id="mevzuat-bilgisi" className="text-base font-bold text-graphite-950">
        Mevzuat bilgisi
      </h2>
      <div className="mt-3 space-y-4">
        {instruments.map((item) => (
          <dl key={item.instrument} className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[11rem_1fr]">
            <dt className="font-medium text-graphite-600">Düzenleme</dt>
            <dd className="font-semibold text-graphite-950">{item.instrument}</dd>
            <dt className="font-medium text-graphite-600">Yayım</dt>
            <dd>{item.publication}</dd>
            <dt className="font-medium text-graphite-600">Yürürlük</dt>
            <dd>{formatDate(item.effectiveDate)}</dd>
            {item.lastAmendment && (
              <>
                <dt className="font-medium text-graphite-600">Son değişiklik</dt>
                <dd>
                  {formatDate(item.lastAmendment.date)} — {item.lastAmendment.description}
                </dd>
              </>
            )}
            <dt className="font-medium text-graphite-600">Resmî metin</dt>
            <dd>
              <a href={item.officialUrl} rel="noopener noreferrer" className="font-semibold text-copper-700 hover:underline">
                Resmî kaynakta görüntüle
              </a>{' '}
              <span className="text-graphite-500">(son kontrol: {formatDate(item.checkedAt)})</span>
            </dd>
          </dl>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-graphite-600">
        Mevzuat sık değişebilir. Bu sayfa hukuki görüş değildir; uygulamadan önce resmî metnin güncel hâlini kontrol
        edin.
      </p>
    </section>
  );
}

/** Sayfa sonundaki ayrıntılı inceleme, sürüm ve düzeltme bilgisi */
export function ReviewInfo({
  data,
  pageTitle,
  pagePath,
  engineVersion,
}: {
  data: EditorialData;
  pageTitle: string;
  pagePath: string;
  engineVersion?: string;
}) {
  const sortedCorrections = [...data.corrections].sort((a, b) => b.date.localeCompare(a.date));
  const mailto = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(
    `Düzeltme bildirimi: ${pageTitle}`,
  )}&body=${encodeURIComponent(`Sayfa: ${absoluteUrl(pagePath)}\n\nHatalı olduğunu düşündüğünüz bilgi:\n\nDayanak (kaynak, ölçüm, mevzuat maddesi):\n`)}`;

  return (
    <section aria-labelledby="inceleme-bilgisi" className="mt-12 rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
      <h2 id="inceleme-bilgisi" className="text-xl font-bold tracking-tight text-graphite-950">
        İnceleme ve sürüm bilgisi
      </h2>
      <dl className="mt-4 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-graphite-600">Durum</dt>
          <dd className="mt-1">
            <StatusBadge status={data.status} />
          </dd>
        </div>
        <div>
          <dt className="font-medium text-graphite-600">Hazırlayan</dt>
          <dd className="mt-1 text-graphite-900">{data.authors.map(personLabel).join(', ') || '—'}</dd>
        </div>
        <div>
          <dt className="font-medium text-graphite-600">Teknik inceleme</dt>
          <dd className="mt-1 text-graphite-900">
            {data.reviewers.length > 0 ? data.reviewers.map(personLabel).join(', ') : 'Henüz yapılmadı'}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-graphite-600">İlk yayın tarihi</dt>
          <dd className="mt-1 text-graphite-900">{data.publishedAt ? formatDate(data.publishedAt) : 'Yayımlanmadı'}</dd>
        </div>
        <div>
          <dt className="font-medium text-graphite-600">Son teknik inceleme</dt>
          <dd className="mt-1 text-graphite-900">{data.reviewedAt ? formatDate(data.reviewedAt) : '—'}</dd>
        </div>
        <div>
          <dt className="font-medium text-graphite-600">Son güncelleme</dt>
          <dd className="mt-1 text-graphite-900">
            {data.updatedAt ? formatDate(data.updatedAt) : data.publishedAt ? formatDate(data.publishedAt) : '—'}
          </dd>
        </div>
        {engineVersion && (
          <div className="sm:col-span-2">
            <dt className="font-medium text-graphite-600">Hesap motoru</dt>
            <dd className="mt-1 text-graphite-900">
              Sürüm {engineVersion} — formüller ve hata kontrolleri, bilinen örneklerle otomatik olarak test edilir.
            </dd>
          </div>
        )}
      </dl>

      {data.aiAssisted && (
        <p className="mt-5 flex gap-2 rounded-lg bg-stone-100 p-3 text-sm leading-6 text-graphite-700">
          <Sparkles aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-copper-600" />
          <span>
            Bu içeriğin ilk taslağı yapay zekâ desteğiyle hazırlandı.{' '}
            {data.status === 'published'
              ? 'Yayımlanmadan önce kaynakları doğrulandı ve teknik incelemeden geçirildi.'
              : 'Kaynak doğrulaması ve teknik inceleme tamamlanmadan yayımlanmaz.'}
          </span>
        </p>
      )}

      <div id="duzeltme-gecmisi" className="mt-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-graphite-900">
          <History aria-hidden="true" className="h-4 w-4 text-copper-600" />
          Düzeltme geçmişi
        </h3>
        {sortedCorrections.length > 0 ? (
          <ol className="mt-2 space-y-2 text-sm text-graphite-800">
            {sortedCorrections.map((correction) => (
              <li key={`${correction.date}-${correction.note}`}>
                <span className="font-semibold">{formatDate(correction.date)}:</span> {correction.note}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-sm text-graphite-600">Bu içerikte henüz düzeltme yapılmadı.</p>
        )}
      </div>

      <p className="no-print mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-stone-200 pt-4 text-sm text-graphite-700">
        <Mail aria-hidden="true" className="h-4 w-4 text-copper-600" />
        Hata veya eksik mi gördünüz?
        <a href={mailto} className="font-semibold text-copper-700 hover:underline">
          Düzeltme bildirin
        </a>
        <span aria-hidden="true">·</span>
        <Link href={routes.correctionPolicy()} className="text-copper-700 hover:underline">
          Düzeltme politikası
        </Link>
      </p>
    </section>
  );
}
