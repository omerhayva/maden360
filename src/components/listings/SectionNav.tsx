import Link from 'next/link';
import { Clock, Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { ButtonGroup, ButtonLink } from '@/components/ui/Button';
import { routes } from '@/i18n/routes';

/*
 * Bu dosyadaki bileşenler bölüm sayfalarının koyu, fotoğraflı başlığında (PageHeader `photo`)
 * kullanılır; renkleri koyu zemine göredir.
 */

/** İş ilanları ↔ aday profilleri sekmeleri */
export function CareerTabs({ active }: { active: 'jobs' | 'candidates' }) {
  const tabs = [
    { key: 'jobs', href: routes.jobs(), label: 'İş ilanları', hint: 'İşçi arayanlar' },
    {
      key: 'candidates',
      href: routes.candidates(),
      label: 'Aday profilleri',
      hint: 'İş arayanlar',
    },
  ] as const;
  return (
    <nav aria-label="İş ilanları bölümü" className="mt-6">
      <ul className="flex gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const current = tab.key === active;
          return (
            <li key={tab.key}>
              <Link
                href={tab.href}
                aria-current={current ? 'page' : undefined}
                className={`flex min-h-12 flex-col justify-center rounded-lg border px-4 py-1.5 [-webkit-tap-highlight-color:transparent] transition-colors duration-100 ${
                  current
                    ? 'border-white bg-white text-graphite-950'
                    : 'border-white/25 bg-graphite-950/45 text-white backdrop-blur-sm ui-hover:border-copper-300 ui-hover:bg-graphite-950/65 ui-active:bg-graphite-950/80'
                }`}
              >
                <span className="text-sm font-semibold">{tab.label}</span>
                <span className={`text-xs ${current ? 'text-graphite-600' : 'text-graphite-200'}`}>
                  {tab.hint}
                </span>
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
    <ButtonGroup className="mt-6">
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
    <p className="mt-6 flex max-w-2xl items-start gap-2.5 rounded-lg bg-graphite-950/55 px-4 py-3 text-sm leading-6 text-graphite-100 ring-1 ring-inset ring-white/15 backdrop-blur-sm">
      <Clock aria-hidden="true" className="mt-1 size-4 shrink-0 text-copper-300" />
      <span>
        Başvuru formları, ilan kuralları ve KVKK aydınlatma metni yayımlandığında açılacak.
      </span>
    </p>
  );
}
