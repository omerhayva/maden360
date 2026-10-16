import Link from 'next/link';
import { ArrowRight, Briefcase, Store, Tent, UserSearch, type LucideIcon } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { SubmissionsClosedNote } from '@/components/listings/SectionNav';
import { iconTile, tileClasses } from '@/components/ui/card';
import { routes } from '@/i18n/routes';
import { areSubmissionsOpen } from '@/lib/content';
import { getFormDefinition, SUBMISSION_ORDER } from '@/lib/submissions/forms';
import { formRegistries } from '@/lib/submissions/registries';
import type { SubmissionType } from '@/lib/submissions/types';
import { pageMetadata } from '@/lib/seo/metadata';

const title = 'İlan ver';
const description =
  'İş ilanı, aday profili, market ilanı veya sanal fuar standı için başvurun. Üyelik gerekmez; başvurular editör kontrolünden sonra yayımlanır ve süresi dolunca otomatik olarak kalkar.';

export const metadata = pageMetadata({
  title: 'İlan ver: iş ilanı, aday profili, market ilanı ve fuar standı',
  description,
  path: routes.postListing(),
});

const icons: Record<SubmissionType, LucideIcon> = {
  'is-ilani': Briefcase,
  'aday-profili': UserSearch,
  'market-ilani': Store,
  'fuar-standi': Tent,
};

const steps = [
  {
    title: 'Formu doldurun',
    text: 'Üyelik gerekmez. Yayımlanmayacak iletişim bilgileriniz ayrı bölümde sorulur.',
  },
  {
    title: 'Başvurunuz bize ulaşır',
    text: 'Size bir başvuru numarası verilir; yazışmalarda bu numarayı kullanın.',
  },
  {
    title: 'Editör kontrolü',
    text: 'Bilgiler ilan kurallarına göre kontrol edilir; eksik varsa size yazarız.',
  },
  {
    title: 'Yayın ve otomatik bitiş',
    text: 'Onaylanan ilan yayımlanır; süresi dolunca kendiliğinden kalkar.',
  },
];

export default function PostListingPage() {
  const open = areSubmissionsOpen();
  const registries = formRegistries();
  return (
    <>
      <PageHeader
        photo="ilan-ver"
        title={title}
        description={description}
        breadcrumbs={[{ name: title, href: routes.postListing() }]}
      >
        {!open && <SubmissionsClosedNote />}
      </PageHeader>
      <Container className="space-y-12 py-10">
        <section aria-labelledby="basvuru-turleri">
          <h2
            id="basvuru-turleri"
            className="heading-accent text-2xl font-bold tracking-tight text-graphite-950"
          >
            Ne yayımlamak istiyorsunuz?
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {SUBMISSION_ORDER.map((type) => {
              const definition = getFormDefinition(type, registries);
              const Icon = icons[type];
              const body = (
                <>
                  <span className={`${iconTile} h-11 w-11`}>
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-semibold text-graphite-950 group-hover:text-copper-800">
                      {definition.title}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-graphite-600">
                      {definition.short}
                    </span>
                    {definition.durationDays && (
                      <span className="mt-2 block text-xs font-semibold text-copper-700">
                        {definition.durationDays >= 365
                          ? '1 yıl'
                          : `${definition.durationDays} gün`}{' '}
                        yayında kalır
                      </span>
                    )}
                  </span>
                  {open && (
                    <ArrowRight
                      aria-hidden="true"
                      className="h-5 w-5 shrink-0 self-center text-graphite-400 group-hover:text-copper-600"
                    />
                  )}
                </>
              );
              return (
                <li key={type}>
                  {open ? (
                    <Link
                      href={routes.postListing(type)}
                      className={tileClasses({ align: 'start', size: 'lg' })}
                    >
                      {body}
                    </Link>
                  ) : (
                    <div className="flex h-full gap-4 rounded-xl border border-dashed border-stone-300 bg-white p-5 opacity-80">
                      {body}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section
          aria-labelledby="nasil-calisir"
          className="rounded-xl bg-graphite-950 p-6 text-white sm:p-8"
        >
          <h2 id="nasil-calisir" className="heading-accent text-2xl font-bold tracking-tight">
            Nasıl çalışır?
          </h2>
          <ol className="mt-6 grid gap-6 md:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-copper-600 font-bold">
                  {index + 1}
                </span>
                <p className="mt-3 font-semibold">{step.title}</p>
                <p className="mt-1 text-sm leading-6 text-graphite-300">{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm leading-6 text-graphite-300">
            Maden360 alım-satıma ve işe alım süreçlerine taraf değildir; ödeme almaz.
            {open && (
              <>
                {' '}
                Ayrıntılar:{' '}
                <Link
                  href={routes.listingRules()}
                  className="font-semibold text-copper-400 underline underline-offset-4 ui-hover:text-copper-300"
                >
                  İlan kuralları
                </Link>{' '}
                ·{' '}
                <Link
                  href={routes.privacy()}
                  className="font-semibold text-copper-400 underline underline-offset-4 ui-hover:text-copper-300"
                >
                  KVKK aydınlatma metni
                </Link>
              </>
            )}
          </p>
        </section>
      </Container>
    </>
  );
}
