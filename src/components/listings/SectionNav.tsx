import Link from 'next/link';
import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { ButtonGroup, ButtonLink } from '@/components/ui/Button';
import { routes } from '@/i18n/routes';

/*
 * Bu dosyadaki bileşenler bölüm sayfalarının koyu, fotoğraflı başlığında (PageHeader `photo`)
 * kullanılır; renkleri koyu zemine göredir.
 */

/** İş ilanları ↔ iş arayanlar sekmeleri; her sekmede yayındaki kayıt sayısı */
export function CareerTabs({
  active,
  counts,
}: {
  active: 'jobs' | 'candidates';
  counts: { jobs: number; candidates: number };
}) {
  const tabs = [
    { key: 'jobs', href: routes.jobs(), label: 'İş ilanları', count: counts.jobs },
    {
      key: 'candidates',
      href: routes.candidates(),
      label: 'İş arayanlar',
      count: counts.candidates,
    },
  ] as const;
  return (
    <nav aria-label="İş ilanları bölümü" className="mt-5">
      <ul className="inline-flex max-w-full gap-0.5 rounded-sm border border-white/40 bg-graphite-950/55 p-0.5">
        {tabs.map((tab) => {
          const current = tab.key === active;
          return (
            <li key={tab.key}>
              <Link
                href={tab.href}
                aria-current={current ? 'page' : undefined}
                className={`inline-flex min-h-11 items-center gap-2 rounded-xs px-4 text-sm font-semibold whitespace-nowrap [-webkit-tap-highlight-color:transparent] transition-colors duration-100 ${
                  current
                    ? 'bg-white text-graphite-950'
                    : 'text-white ui-hover:bg-white/10 ui-active:bg-white/20'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`font-normal tabular-nums ${current ? 'text-graphite-600' : 'text-graphite-200'}`}
                  >
                    {tab.count}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Başlık altındaki eylemler: birincil düğme (ilan ver) ve isteğe bağlı ikincil düğme/bağlantı.
 * İkincil düğme koyu zemin için `variant="inverse"` olmalıdır. Mobilde alt alta ve tam genişlikte
 * dizilir.
 */
export function HeaderActions({
  primary,
  secondary,
}: {
  primary?: { href: string; label: string };
  secondary?: ReactNode;
}) {
  if (!primary && !secondary) return null;
  return (
    <ButtonGroup className="mt-5">
      {primary && (
        <ButtonLink href={primary.href} icon={Plus}>
          {primary.label}
        </ButtonLink>
      )}
      {secondary}
    </ButtonGroup>
  );
}

/** Başvurular kapalıyken (ilan kuralları ve KVKK metni yayımlanmadan) gösterilen not */
export function SubmissionsClosedNote() {
  return (
    <p className="mt-5 max-w-2xl border-l-2 border-copper-300 pl-3 text-sm leading-6 text-graphite-100">
      Başvuru formları, ilan kuralları ve KVKK aydınlatma metni yayımlanınca açılacak.
    </p>
  );
}
