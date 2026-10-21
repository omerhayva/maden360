import { Mail } from 'lucide-react';
import { SubmissionForm } from '@/components/forms/SubmissionForm';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { ButtonLink } from '@/components/ui/Button';
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
    'Aday profilleri ve iletişim bilgisi gizli market ilanları için talebinizi gönderin. Editör talebinizi ilan sahibine iletir.',
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
            <EmptyState
              title="İletişim talepleri yakında açılacak"
              actions={
                <ButtonLink href={routes.contact()} variant="secondary" icon={Mail}>
                  Bize ulaşın
                </ButtonLink>
              }
            >
              O zamana kadar iletişim sayfasından bize yazabilirsiniz.
            </EmptyState>
          )}
        </div>
      </Container>
    </>
  );
}
