import Link from 'next/link';
import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';
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
                className={`flex min-h-12 flex-col justify-center rounded-lg border px-4 py-1.5 ${
                  current
                    ? 'border-graphite-900 bg-graphite-900 text-white'
                    : 'border-stone-300 bg-stone-50 text-graphite-800 hover:border-copper-400'
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

/** Başlık altındaki birincil eylem (ilan ver) ve ikincil bağlantılar */
export function HeaderActions({
  primary,
  secondary,
}: {
  primary?: { href: string; label: string };
  secondary?: ReactNode;
}) {
  if (!primary && !secondary) return null;
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      {primary && (
        <Link
          href={primary.href}
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-copper-600 px-4 font-semibold text-white hover:bg-copper-700"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          {primary.label}
        </Link>
      )}
      {secondary}
    </div>
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
