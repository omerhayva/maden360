import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarClock, Mail, ShieldCheck } from 'lucide-react';
import { SubmissionForm } from '@/components/forms/SubmissionForm';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { routes } from '@/i18n/routes';
import { areSubmissionsOpen } from '@/lib/content';
import { getFormDefinition } from '@/lib/submissions/forms';
import { deliveryConfig, formRegistries, marketKindMap } from '@/lib/submissions/registries';
import { isSubmissionType, SUBMISSION_TYPES } from '@/lib/submissions/types';
import { pageMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ tur: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return SUBMISSION_TYPES.map((tur) => ({ tur }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tur } = await params;
  if (!isSubmissionType(tur)) return {};
  const definition = getFormDefinition(tur, formRegistries());
  return pageMetadata({
    title: definition.title,
    description: definition.description,
    path: routes.postListing(tur),
  });
}

export default async function SubmissionPage({ params }: Props) {
  const { tur } = await params;
  if (!isSubmissionType(tur)) notFound();
  const definition = getFormDefinition(tur, formRegistries());
  const open = areSubmissionsOpen();

  return (
    <>
      <PageHeader
        photo="ilan-ver"
        title={definition.title}
        description={definition.description}
        breadcrumbs={[
          { name: 'İlan ver', href: routes.postListing() },
          { name: definition.title, href: routes.postListing(tur) },
        ]}
      />
      <Container className="py-10">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10">
          <div className="min-w-0 max-w-3xl">
            {open ? (
              <SubmissionForm
                definition={definition}
                delivery={deliveryConfig()}
                marketKinds={marketKindMap()}
              />
            ) : (
              <EmptyState
                title="Başvurular yakında açılacak"
                icon={<CalendarClock aria-hidden="true" />}
                actions={
                  <ButtonLink href={routes.contact()} variant="secondary" icon={Mail}>
                    Bize ulaşın
                  </ButtonLink>
                }
              >
                Başvuru formları, ilan kuralları ve KVKK aydınlatma metni yayımlandığında açılacak.
                Bu sürede iletişim sayfasından bize ulaşabilirsiniz.
              </EmptyState>
            )}
          </div>
          <aside className="mt-10 space-y-4 lg:mt-0" aria-label="Başvuru hakkında">
            <div className="rounded-xl border border-stone-200 bg-white p-5 text-sm leading-6 text-graphite-700">
              <p className="flex items-center gap-2 font-semibold text-graphite-950">
                <ShieldCheck aria-hidden="true" className="h-4 w-4 text-copper-600" />
                Başvurunuz nasıl işlenir?
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Üyelik gerekmez; başvurunuz editörlerimize ulaşır.</li>
                <li>
                  “Yayımlanmaz” yazan bölümlerdeki bilgiler yalnızca doğrulama ve iletişim için
                  kullanılır.
                </li>
                <li>
                  Editör kontrolünden sonra yayımlanır; süresi dolunca otomatik olarak kalkar.
                </li>
                <li>Kaldırma veya düzeltme talepleri için başvuru numaranızla bize yazın.</li>
              </ul>
            </div>
            {open && (
              <p className="px-1 text-sm text-graphite-600">
                <Link
                  href={routes.listingRules()}
                  className="font-semibold text-copper-700 underline underline-offset-4 ui-hover:text-copper-800"
                >
                  İlan kuralları
                </Link>{' '}
                ·{' '}
                <Link
                  href={routes.privacy()}
                  className="font-semibold text-copper-700 underline underline-offset-4 ui-hover:text-copper-800"
                >
                  KVKK aydınlatma metni
                </Link>
              </p>
            )}
          </aside>
        </div>
      </Container>
    </>
  );
}
