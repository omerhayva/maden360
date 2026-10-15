import Link from 'next/link';
import {
  ExternalLink,
  Flag,
  Globe,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  ShieldAlert,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Callout } from '@/components/ui/Callout';
import { siteConfig } from '@/config/site';
import { routes } from '@/i18n/routes';
import type { ResolvedSource } from '@/lib/content';
import type { ContentStatus } from '@/lib/content/schemas';
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

/** Etiket–değer listesi; boş değerler atlanır. */
export function FactList({ facts, columns = 2 }: { facts: Fact[]; columns?: 2 | 3 }) {
  const shown = facts.filter(
    (fact) => fact.value !== undefined && fact.value !== null && fact.value !== '',
  );
  if (shown.length === 0) return null;
  return (
    <dl
      className={`grid gap-x-6 gap-y-4 rounded-xl border border-stone-200 bg-white p-5 text-sm sm:grid-cols-2 ${columns === 3 ? 'lg:grid-cols-3' : ''}`}
    >
      {shown.map((fact) => (
        <div key={fact.label} className="min-w-0">
          <dt className="font-medium text-graphite-600">{fact.label}</dt>
          <dd className="mt-1 break-words text-graphite-950">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function BulletList({ title, items, id }: { title: string; items: string[]; id: string }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby={id} className="mt-8">
      <h2 id={id} className="text-xl font-bold tracking-tight text-graphite-950">
        {title}
      </h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-graphite-800 marker:text-copper-500">
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
          className="rounded-md border border-stone-200 bg-white px-2.5 py-1 text-sm font-medium text-graphite-800"
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
  sources,
}: {
  title: string;
  text: string;
  sources: ResolvedSource[];
}) {
  return (
    <aside
      aria-label={title}
      className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950"
    >
      <p className="flex items-center gap-2 font-semibold">
        <ShieldAlert aria-hidden="true" className="h-5 w-5 shrink-0 text-amber-700" />
        {title}
      </p>
      <p className="mt-2 text-sm leading-6">{text}</p>
      {sources.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-amber-200 pt-3 text-xs leading-5">
          {sources.map(({ source, ref }) => (
            <li key={source.id}>
              <span className="font-semibold">Dayanak:</span>{' '}
              {source.url ? (
                <a
                  href={source.url}
                  className="underline hover:no-underline"
                  rel="noopener noreferrer"
                >
                  {source.title}
                </a>
              ) : (
                source.title
              )}
              {source.identifier ? ` (${source.identifier})` : ''}
              {ref.locator ? ` — ${ref.locator}` : ''}
              {source.accessedAt ? `. Erişim: ${formatDate(source.accessedAt)}.` : '.'}
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
      'Maden360 alım-satıma taraf değildir ve ödeme almaz.',
      'Ürünü veya sahayı görmeden kapora ya da ön ödeme göndermeyin.',
      'Fatura, ruhsat, muayene ve bakım belgelerini isteyin; sözleşmeyi yazılı yapın.',
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
      'Stand bilgileri firmanın beyanıdır; Maden360 ürün ve hizmetlerin kalitesini garanti etmez.',
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
          Bu, sayfa düzenini göstermek için hazırlanmış örnek bir içeriktir; gerçek bir ilan veya
          firma değildir.
        </p>
      )}
      {expiredAtBuild && <p>İlanın süresi doldu; üretim derlemesinde yayımlanmaz.</p>}
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
          <a
            href={telHref(items.phone)}
            className="flex min-h-11 items-center gap-3 rounded-lg border border-stone-200 px-3 font-semibold text-graphite-900 hover:border-copper-300"
          >
            <Phone aria-hidden="true" className="h-4 w-4 text-copper-600" />
            {items.phone}
          </a>
        </li>
      )}
      {mailHref && (
        <li>
          <a
            href={mailHref}
            className="flex min-h-11 items-center gap-3 rounded-lg border border-stone-200 px-3 font-semibold text-graphite-900 hover:border-copper-300"
          >
            <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-copper-600" />
            <span className="break-all">{items.email}</span>
          </a>
        </li>
      )}
      {items.website && (
        <li>
          <a
            href={items.website}
            rel="nofollow ugc noopener noreferrer"
            className="flex min-h-11 items-center gap-3 rounded-lg border border-stone-200 px-3 font-semibold text-graphite-900 hover:border-copper-300"
          >
            <Globe aria-hidden="true" className="h-4 w-4 shrink-0 text-copper-600" />
            <span className="break-all">
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
          <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-copper-600" />
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
      <Link
        href={routes.contactRequest(refCode)}
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-copper-600 px-4 font-semibold text-white hover:bg-copper-700"
      >
        <MessageSquareText aria-hidden="true" className="h-4 w-4" />
        İletişim talebi gönder
      </Link>
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
      className="ilan-iletisim rounded-xl border border-stone-200 bg-white p-5"
    >
      <h2 id={id} className="text-base font-bold text-graphite-950">
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
      className="mt-10 space-y-3 border-t border-stone-200 pt-5 text-sm text-graphite-700"
    >
      <ExpiryNotice expiresAt={expiresAt} label={expiryLabel} />
      <dl className="flex flex-wrap gap-x-6 gap-y-1">
        {refCode && (
          <div className="flex gap-1">
            <dt>İlan no:</dt>
            <dd className="font-mono font-semibold text-graphite-900">{refCode}</dd>
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
        <Flag aria-hidden="true" className="h-4 w-4 text-copper-600" />
        Yanıltıcı veya kurallara aykırı mı?
        <a href={report} className="font-semibold text-copper-700 hover:underline">
          İlanı bildirin
        </a>
      </p>
    </section>
  );
}
