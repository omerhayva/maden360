import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { SubmissionsClosedNote } from '@/components/listings/SectionNav';
import { listPanel, listRow, panel, stretchedLink } from '@/components/ui/card';
import { routes } from '@/i18n/routes';
import { areSubmissionsOpen } from '@/lib/content';
import { getFormDefinition, SUBMISSION_ORDER } from '@/lib/submissions/forms';
import { formRegistries } from '@/lib/submissions/registries';
import { pageMetadata } from '@/lib/seo/metadata';

const title = 'İlan ver';
const description =
  'İş ilanı, aday profili, market ilanı ve fuar standı için başvuru formları. Üyelik gerekmez. Başvurunuzu editör okur, uygunsa yayımlar.';

export const metadata = pageMetadata({
  title: 'İlan ver: iş ilanı, aday profili, market ilanı ve fuar standı',
  description,
  path: routes.postListing(),
});

/** Gerçek bir sıra olduğu için numaralı liste (form → numara → kontrol → yayın) */
const steps = [
  {
    title: 'Formu doldurun',
    text: 'Üyelik gerekmez. Yayımlanmayacak iletişim bilgileriniz ayrı bölümde sorulur.',
  },
  {
    title: 'Başvuru numaranızı alın',
    text: 'Başvurunuz bize ulaşınca size bir numara verilir. Yazışmalarda bu numarayı kullanın.',
  },
  {
    title: 'Editör kontrol eder',
    text: 'Bilgileri ilan kurallarına göre kontrol ederiz. Eksik varsa size yazarız.',
  },
  {
    title: 'İlan yayına girer',
    text: 'Onaylanan ilan yayımlanır, süresi dolunca kendiliğinden kalkar.',
  },
];

function durationLabel(days: number): string {
  return days >= 365 ? '1 yıl yayında kalır' : `${days} gün yayında kalır`;
}

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
      <Container className="grid gap-10 py-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12 lg:py-10">
        <section aria-labelledby="basvuru-turleri" className="min-w-0">
          <h2
            id="basvuru-turleri"
            className="text-2xl leading-tight font-semibold text-graphite-950"
          >
            Ne yayımlamak istiyorsunuz?
          </h2>
          <ul className={`mt-4 ${listPanel}`}>
            {SUBMISSION_ORDER.map((type) => {
              const definition = getFormDefinition(type, registries);
              return (
                <li key={type}>
                  <div className={open ? listRow : 'px-4 py-4 sm:px-5'}>
                    <h3
                      className={`text-lg leading-snug font-semibold ${open ? 'text-graphite-950' : 'text-graphite-700'}`}
                    >
                      {open ? (
                        <Link href={routes.postListing(type)} className={stretchedLink}>
                          {definition.title}
                        </Link>
                      ) : (
                        definition.title
                      )}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-graphite-700">{definition.short}</p>
                    {definition.durationDays && (
                      <p className="mt-1 text-sm text-graphite-600">
                        {durationLabel(definition.durationDays)}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section
          aria-labelledby="nasil-calisir"
          className={`${panel} min-w-0 self-start p-5 sm:p-6`}
        >
          <h2 id="nasil-calisir" className="text-xl leading-tight font-semibold text-graphite-950">
            Başvurudan yayına
          </h2>
          <ol className="mt-4 space-y-4">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="w-5 shrink-0 text-lg leading-6 font-semibold text-copper-700 tabular-nums"
                >
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold text-graphite-950">{step.title}</p>
                  <p className="mt-0.5 text-sm leading-6 text-graphite-700">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-5 border-t border-stone-200 pt-4 text-sm leading-6 text-graphite-700">
            Maden360 alım satıma ve işe alıma taraf değildir, ödeme almaz.
            {open && (
              <>
                {' '}
                Ayrıntılar için{' '}
                <Link
                  href={routes.listingRules()}
                  className="font-medium text-copper-700 underline underline-offset-4 ui-hover:text-copper-900"
                >
                  ilan kuralları
                </Link>{' '}
                ve{' '}
                <Link
                  href={routes.privacy()}
                  className="font-medium text-copper-700 underline underline-offset-4 ui-hover:text-copper-900"
                >
                  KVKK aydınlatma metni
                </Link>
                .
              </>
            )}
          </p>
        </section>
      </Container>
    </>
  );
}
