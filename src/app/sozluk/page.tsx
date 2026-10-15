import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlossaryList } from '@/components/glossary/GlossaryList';
import { EmptyState } from '@/components/ui/EmptyState';
import { routes } from '@/i18n/routes';
import { getTerms } from '@/lib/content';
import { pageMetadata } from '@/lib/seo/metadata';

const title = 'Madencilik Sözlüğü';
const description =
  'Madencilik terimleri: mevzuattaki resmî tanımlar, teknik açıklamalar ve İngilizce karşılıklarıyla pasa, dekapaj, tenör, kazanım, grizu, topuk ve daha fazlası.';

export const metadata = pageMetadata({ title, description, path: routes.glossary() });

export default function GlossaryPage() {
  const terms = getTerms();
  return (
    <>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={[{ name: 'Sözlük', href: routes.glossary() }]}
      />
      <Container className="py-8">
        {terms.length > 0 ? (
          <GlossaryList
            items={terms.map((term) => ({
              slug: term.slug,
              term: term.term,
              english: term.english,
              abbreviation: term.abbreviation,
              aliases: term.aliases,
              definition: term.definition,
              url: term.url,
              isPublished: term.status === 'published',
            }))}
          />
        ) : (
          <EmptyState title="Henüz yayımlanmış terim yok">
            Terimler teknik incelemeden geçtikçe burada listelenecek.
          </EmptyState>
        )}
      </Container>
    </>
  );
}
