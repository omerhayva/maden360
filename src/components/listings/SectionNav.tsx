import Link from 'next/link';
import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { ButtonGroup, ButtonLink } from '@/components/ui/Button';
import { routes } from '@/i18n/routes';

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
                    ? 'border-graphite-900 bg-graphite-900 text-white'
                    : 'border-stone-300 bg-stone-50 text-graphite-800 ui-hover:border-copper-500 ui-hover:bg-white ui-active:bg-stone-100'
                }`}
              >
                <span className="text-sm font-semibold">{tab.label}</span>
                <span className={`text-xs ${current ? 'text-graphite-300' : 'text-graphite-500'}`}>
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
 * Mobilde alt alta ve tam genişlikte dizilir.
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
    <p className="mt-6 max-w-2xl rounded-lg bg-stone-100 px-4 py-3 text-sm text-graphite-700">
      Başvuru formları, ilan kuralları ve KVKK aydınlatma metni yayımlandığında açılacak.
    </p>
  );
}
