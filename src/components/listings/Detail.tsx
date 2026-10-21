import { ExternalLink, Globe, Mail, MapPin, Phone, ShieldAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { siteConfig } from '@/config/site';
import { routes } from '@/i18n/routes';
import type { ContentStatus, Reference } from '@/lib/content/schemas';
import { listingStatusLabels } from '@/lib/content/visibility';
import { formatDate } from '@/lib/format';
import { telHref } from '@/lib/listings/contact';
import { absoluteUrl } from '@/lib/seo/metadata';
import { ExpiryNotice } from './ExpiryNotice';

/* ------------------------------ Bilgi listesi ------------------------------ */

export interface Fact {
  label: string;
  value?: ReactNode;
}

/**
 * Son satırdaki boş hücreler ızgara zemininde gri blok olarak görünmesin diye son öğe kalan
 * sütunları kaplar (2 sütunda sm, 3 sütunda lg kırılımında).
 */
function lastCellSpan(count: number, columns: 2 | 3): string {
  const sm = count % 2 === 1 ? 'sm:col-span-2' : '';
  if (columns === 2) return sm;
  const lg = { 0: 'lg:col-span-1', 1: 'lg:col-span-3', 2: 'lg:col-span-2' }[count % 3] ?? '';
  return `${sm} ${lg}`;
}

/**
 * Etiket–değer tablosu; boş değerler atlanır. Hücreler ince çizgilerle ayrılır (teknik
 * çizimlerdeki antet gibi): küçük etiket üstte, değer altta.
 */
export function FactList({ facts, columns = 2 }: { facts: Fact[]; columns?: 2 | 3 }) {
  const shown = facts.filter(
    (fact) => fact.value !== undefined && fact.value !== null && fact.value !== '',
  );
  if (shown.length === 0) return null;
  const lastSpan = lastCellSpan(shown.length, columns);
  return (
    <dl
      className={`grid gap-px overflow-hidden rounded-sm border border-stone-300 bg-stone-200 sm:grid-cols-2 ${columns === 3 ? 'lg:grid-cols-3' : ''}`}
    >
      {shown.map((fact, index) => (
        <div
          key={fact.label}
          className={`min-w-0 bg-white px-4 py-3 ${index === shown.length - 1 ? lastSpan : ''}`}
        >
          <dt className="text-sm text-graphite-600">{fact.label}</dt>
          <dd className="mt-0.5 font-medium break-words text-graphite-950">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function BulletList({ title, items, id }: { title: string; items: string[]; id: string }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby={id} className="mt-8">
      <h2 id={id} className="text-xl font-semibold text-graphite-950">
        {title}
      </h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-graphite-800 marker:text-graphite-400">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function ChipList({ items, label }: { items: string[]; label: string }) {
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={label}>
      {items.map((item) => (
        <li
          key={item}
          className="rounded-xs border border-stone-300 bg-white px-2 py-0.5 text-sm font-medium text-graphite-800"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------ Yasal ve güvenlik notları ------------------------------ */

/** Kategori notu (ör. ruhsat devri ve rödövans); mevzuata dayanan cümleler kaynağa bağlanır. */
export function NoticeBox({
  title,
  text,
  references,
}: {
  title: string;
  text: string;
  references: Reference[];
}) {
  return (
    <aside
      aria-label={title}
      className="rounded-sm border border-amber-300 bg-amber-50 p-5 text-amber-950"
    >
      <p className="flex items-center gap-2 font-semibold">
        <ShieldAlert aria-hidden="true" className="h-5 w-5 shrink-0 text-amber-700" />
        {title}
      </p>
      <p className="mt-2 text-sm leading-6">{text}</p>
      {references.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-amber-200 pt-3 text-xs leading-5">
          {references.map((reference) => (
            <li key={reference.url + (reference.locator ?? '')}>
              <span className="font-semibold">Dayanak:</span>{' '}
              <a
                href={reference.url}
                className="underline underline-offset-2 ui-hover:text-amber-800"
                rel="noopener noreferrer"
              >
                {reference.title}
              </a>
              {reference.locator ? `, ${reference.locator}` : ''}. Son kontrol:{' '}
              {formatDate(reference.checkedAt)}.
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

const safetyTexts = {
  market: {
    title: 'Güvenli alışveriş',
    items: [
      'Maden360 alım satıma taraf değildir, ödeme almaz.',
      'Ürünü veya sahayı görmeden kapora ya da ön ödeme göndermeyin.',
      'Fatura, ruhsat, muayene ve bakım belgelerini isteyin. Sözleşmeyi yazılı yapın.',
    ],
  },
  job: {
    title: 'Başvurmadan önce',
    items: [
      'İşe alım için sizden ücret, depozito veya eğitim bedeli isteyen ilanları bize bildirin.',
      'Kimlik fotokopisi gibi belgeleri yalnızca işverenin kimliğini doğruladıktan sonra paylaşın.',
      'Maden360 işe alım sürecine taraf değildir.',
    ],
  },
  stand: {
    title: 'Firma bilgileri hakkında',
    items: [
      'Stand bilgileri firmanın kendi beyanıdır. Maden360 ürün ve hizmetlerin kalitesini garanti etmez.',
      'Sözleşme öncesinde belgeleri ve referansları doğrulayın.',
    ],
  },
} as const;

export function SafetyNotice({ variant }: { variant: keyof typeof safetyTexts }) {
  const { title, items } = safetyTexts[variant];
  return (
    <Callout variant="safety" title={title}>
      <ul className="list-disc space-y-1 pl-4">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Callout>
  );
}

/* ------------------------------ Önizleme notları ------------------------------ */

export function ListingPreviewNotice({
  status,
  example,
  expiredAtBuild,
}: {
  status: ContentStatus;
  example?: boolean;
  expiredAtBuild?: boolean;
}) {
  if (status === 'published' && !example && !expiredAtBuild) return null;
  return (
    <Callout variant="warning" title="Önizleme: bu sayfa yayında değil" className="mt-6">
      {status !== 'published' && (
        <p>Durum: {listingStatusLabels[status]}. Editör onayından sonra yayımlanır.</p>
      )}
      {example && (
        <p>
          Bu, sayfa düzenini göstermek için hazırlanmış örnek bir içeriktir. Gerçek bir ilan veya
          firma değildir.
        </p>
      )}
      {expiredAtBuild && <p>İlanın süresi doldu. Yayındaki sitede gösterilmez.</p>}
    </Callout>
  );
}

/* ------------------------------ İletişim ------------------------------ */

export interface ContactItems {
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
}

/** İletişim satırı: tüm satır tek dokunuşla arar, e-posta yazar veya siteyi açar. */
const contactRow =
  'flex min-h-12 items-center gap-3 rounded-sm border border-stone-300 bg-white px-3 py-2 font-semibold text-graphite-900 [-webkit-tap-highlight-color:transparent] transition-colors duration-100 ui-hover:border-graphite-500 ui-hover:bg-stone-50 ui-active:bg-stone-100';

/** Doğrudan iletişim bilgileri (dış bağlantılar kullanıcı içeriği olarak işaretlenir). */
export function ContactList({
  items,
  emailSubject,
}: {
  items: ContactItems;
  emailSubject?: string;
}) {
  const mailHref = items.email
    ? `mailto:${items.email}${emailSubject ? `?subject=${encodeURIComponent(emailSubject)}` : ''}`
    : undefined;
  return (
    <ul className="space-y-2 text-sm">
      {items.phone && (
        <li>
          <a href={telHref(items.phone)} className={contactRow}>
            <Phone aria-hidden="true" className="h-4 w-4 shrink-0 text-graphite-500" />
            <span>
              <span className="sr-only">Telefon: </span>
              {items.phone}
            </span>
          </a>
        </li>
      )}
      {mailHref && (
        <li>
          <a href={mailHref} className={contactRow}>
            <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-graphite-500" />
            <span className="break-all">
              <span className="sr-only">E-posta: </span>
              {items.email}
            </span>
          </a>
        </li>
      )}
      {items.website && (
        <li>
          <a href={items.website} rel="nofollow ugc noopener noreferrer" className={contactRow}>
            <Globe aria-hidden="true" className="h-4 w-4 shrink-0 text-graphite-500" />
            <span className="break-all">
              <span className="sr-only">Web sitesi: </span>
              {items.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </span>
            <ExternalLink
              aria-hidden="true"
              className="ml-auto h-3.5 w-3.5 shrink-0 text-graphite-400"
            />
          </a>
        </li>
      )}
      {items.address && (
        <li className="flex items-start gap-3 px-3 py-2 text-graphite-700">
          <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-graphite-500" />
          {items.address}
        </li>
      )}
    </ul>
  );
}

/** İletişim bilgisi gizli ilanlar ve aday profilleri için editör aracılığıyla talep */
export function RelayContact({ refCode, description }: { refCode?: string; description: string }) {
  return (
    <div>
      <p className="text-sm leading-6 text-graphite-700">{description}</p>
      <ButtonLink href={routes.contactRequest(refCode)} size="lg" width="full" className="mt-3">
        İletişim talebi gönder
      </ButtonLink>
    </div>
  );
}

export function SideCard({
  title,
  children,
  id,
}: {
  title: string;
  children: ReactNode;
  id: string;
}) {
  return (
    <section
      aria-labelledby={id}
      className="ilan-iletisim rounded-sm border border-stone-300 bg-white p-5"
    >
      <h2 id={id} className="text-lg font-semibold text-graphite-950">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/* ------------------------------ İlan bilgileri ------------------------------ */

export function ListingMetaFooter({
  refCode,
  postedAt,
  updatedAt,
  moderatedAt,
  expiresAt,
  expiryLabel,
  title,
  path,
}: {
  refCode?: string;
  postedAt?: string;
  updatedAt?: string;
  moderatedAt?: string;
  expiresAt?: string;
  expiryLabel?: string;
  title: string;
  path: string;
}) {
  const report = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(
    `İlan bildirimi: ${refCode ?? title}`,
  )}&body=${encodeURIComponent(`Sayfa: ${absoluteUrl(path)}\n\nBildirim nedeni (yanıltıcı bilgi, dolandırıcılık şüphesi, kural ihlali, kişisel veri vb.):\n`)}`;
  return (
    <section
      aria-label="İlan bilgileri"
      className="mt-10 space-y-3 border-t border-stone-300 pt-5 text-sm text-graphite-700"
    >
      <ExpiryNotice expiresAt={expiresAt} label={expiryLabel} />
      <dl className="flex flex-wrap gap-x-6 gap-y-1">
        {refCode && (
          <div className="flex gap-1">
            <dt>İlan no:</dt>
            <dd className="font-semibold text-graphite-900 tabular-nums">{refCode}</dd>
          </div>
        )}
        {postedAt && (
          <div className="flex gap-1">
            <dt>Yayın:</dt>
            <dd>{formatDate(postedAt)}</dd>
          </div>
        )}
        {updatedAt && (
          <div className="flex gap-1">
            <dt>Güncelleme:</dt>
            <dd>{formatDate(updatedAt)}</dd>
          </div>
        )}
        {moderatedAt && (
          <div className="flex gap-1">
            <dt>Editör onayı:</dt>
            <dd>{formatDate(moderatedAt)}</dd>
          </div>
        )}
      </dl>
      <p className="no-print flex flex-wrap items-center gap-x-2 gap-y-1">
        Yanıltıcı veya kurallara aykırı mı?
        <a
          href={report}
          className="inline-flex min-h-11 items-center font-semibold text-copper-700 underline underline-offset-4 ui-hover:text-copper-900"
        >
          İlanı bildirin
        </a>
      </p>
    </section>
  );
}
