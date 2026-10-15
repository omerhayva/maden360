import Link from 'next/link';
import { SubmissionForm } from '@/components/forms/SubmissionForm';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { routes } from '@/i18n/routes';
import { areSubmissionsOpen } from '@/lib/content';
import { getFormDefinition } from '@/lib/submissions/forms';
import { deliveryConfig, formRegistries } from '@/lib/submissions/registries';
import { pageMetadata } from '@/lib/seo/metadata';

const definition = () => getFormDefinition('iletisim-talebi', formRegistries());

export const metadata = pageMetadata({
  title: 'İletişim talebi gönder',
  description:
    'Aday profilleri ve iletişim bilgisi gizli market ilanları için talebinizi gönderin; editörlerimiz ilan sahibine iletir.',
  path: routes.contactRequest(),
  noindex: true,
});

export default function ContactRequestPage() {
  const form = definition();
  const open = areSubmissionsOpen();
  return (
    <>
      <PageHeader
        title={form.title}
        description={form.description}
        breadcrumbs={[{ name: form.title, href: routes.contactRequest() }]}
      />
      <Container className="py-10">
        <div className="max-w-3xl">
          {open ? (
            <SubmissionForm
              definition={form}
              delivery={deliveryConfig()}
              queryPrefill={{ ref: 'ilan' }}
            />
          ) : (
            <EmptyState title="İletişim talepleri yakında açılacak">
              Bu sürede{' '}
              <Link
                href={routes.contact()}
                className="font-semibold text-copper-700 hover:underline"
              >
                iletişim sayfasından
              </Link>{' '}
              bize ulaşabilirsiniz.
            </EmptyState>
          )}
        </div>
      </Container>
    </>
  );
}
