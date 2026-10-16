import { siteConfig } from '@/config/site';
import { routes } from '@/i18n/routes';
import type { JobPosting, Stand } from '@/lib/content';
import { absoluteUrl } from './metadata';

const organization = () => ({
  '@type': 'Organization',
  '@id': `${siteConfig.url}/#organization`,
  name: siteConfig.name,
  url: siteConfig.url,
  logo: absoluteUrl('/icon-512.png'),
});

export function websiteSchema() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${siteConfig.url}/#website`,
      name: siteConfig.name,
      url: siteConfig.url,
      inLanguage: 'tr-TR',
      description: siteConfig.description,
      publisher: { '@id': `${siteConfig.url}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${absoluteUrl(routes.search())}?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    { '@context': 'https://schema.org', ...organization() },
  ];
}

export interface Crumb {
  name: string;
  href: string;
}

export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.href),
    })),
  };
}

/* ------------------------------ İlanlar ------------------------------ */

const employmentTypeSchema: Record<JobPosting['employmentType'], string> = {
  'tam-zamanli': 'FULL_TIME',
  'yari-zamanli': 'PART_TIME',
  sozlesmeli: 'CONTRACTOR',
  proje: 'CONTRACTOR',
  sezonluk: 'TEMPORARY',
  staj: 'INTERN',
};

const salaryUnit: Record<NonNullable<JobPosting['salary']>['period'], string> = {
  aylik: 'MONTH',
  gunluk: 'DAY',
  saatlik: 'HOUR',
  yillik: 'YEAR',
};

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Google iş ilanı arama sonuçları için JobPosting (yalnızca yayımlanmış ilanlarda). */
export function jobPostingSchema(job: JobPosting, positionName: string) {
  const lists = [
    ['Aranan nitelikler', job.requirements],
    ['İstenen belgeler', job.certificates],
    ['Yan haklar', job.benefits],
  ] as const;
  const description = [
    job.html,
    ...lists
      .filter(([, items]) => items.length > 0)
      .map(
        ([title, items]) =>
          `<p><strong>${title}</strong></p><ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`,
      ),
  ].join('');
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description,
    datePosted: job.postedAt,
    ...(job.expiresAt ? { validThrough: `${job.expiresAt}T23:59:59+03:00` } : {}),
    employmentType: employmentTypeSchema[job.employmentType],
    occupationalCategory: positionName,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.employer.name,
      ...(job.employer.website ? { sameAs: job.employer.website } : {}),
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.district ?? job.city,
        addressRegion: job.city,
        addressCountry: 'TR',
      },
    },
    ...(job.salary && (job.salary.min !== undefined || job.salary.max !== undefined)
      ? {
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: job.salary.currency,
            value: {
              '@type': 'QuantitativeValue',
              ...(job.salary.min !== undefined ? { minValue: job.salary.min } : {}),
              ...(job.salary.max !== undefined ? { maxValue: job.salary.max } : {}),
              unitText: salaryUnit[job.salary.period],
            },
          },
        }
      : {}),
    ...(job.experienceYears
      ? {
          experienceRequirements: {
            '@type': 'OccupationalExperienceRequirements',
            monthsOfExperience: job.experienceYears * 12,
          },
        }
      : {}),
    totalJobOpenings: job.openings,
    ...(job.ref
      ? { identifier: { '@type': 'PropertyValue', name: siteConfig.name, value: job.ref } }
      : {}),
    url: absoluteUrl(job.url),
    inLanguage: 'tr-TR',
  };
}

/** Sanal fuar standı: firma bilgisi */
export function standSchema(stand: Stand) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: stand.name,
    description: stand.summary,
    url: stand.website ?? absoluteUrl(stand.url),
    ...(stand.email ? { email: stand.email } : {}),
    ...(stand.phone ? { telephone: stand.phone } : {}),
    ...(stand.founded ? { foundingDate: String(stand.founded) } : {}),
    ...(stand.logo ? { logo: absoluteUrl(stand.logo) } : {}),
    address: {
      '@type': 'PostalAddress',
      addressRegion: stand.city,
      addressCountry: 'TR',
      ...(stand.address ? { streetAddress: stand.address } : {}),
    },
    ...(stand.offerings.length > 0
      ? {
          makesOffer: stand.offerings.map((offering) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: offering.name,
              ...(offering.description ? { description: offering.description } : {}),
            },
          })),
        }
      : {}),
    subjectOf: { '@type': 'WebPage', url: absoluteUrl(stand.url) },
  };
}
