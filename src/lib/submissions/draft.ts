import { LISTING_MAX_DAYS, type ListingKind } from '@/lib/listings/options';
import { slugify, truncate } from '@/lib/text';
import type { FormKind } from './types';
import {
  arrayValue,
  canonicalProvince,
  listValue,
  numberValue,
  textValue,
  type FormValues,
} from './values';

/**
 * Başvurudan editör için taslak içerik dosyası (Markdown + YAML ön bilgi) üretir.
 *
 * Editör, e-postayla gelen bu metni önerilen yola kaydeder, bilgileri kontrol eder
 * ve yayımlarken status, postedAt, expiresAt, moderatedBy, moderatedAt alanlarını
 * doldurur. Yayımlanmayacak alanlar (başvuru sorumlusu, adayın iletişim bilgileri,
 * gizli iletişimde satıcının telefonu/e-postası) taslağa yazılmaz.
 */

type YamlValue =
  string | number | boolean | undefined | null | YamlValue[] | { [key: string]: YamlValue };

function scalar(value: string | number | boolean): string {
  // JSON dizgeleri geçerli YAML çift tırnaklı dizgeleridir; kaçış karakterleri güvenle işlenir.
  return typeof value === 'string' ? JSON.stringify(value) : String(value);
}

function isEmpty(value: YamlValue): boolean {
  if (value === undefined || value === null || value === '') return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.values(value).every(isEmpty);
  return false;
}

function emit(object: { [key: string]: YamlValue }, indent: number, lines: string[]) {
  const pad = '  '.repeat(indent);
  for (const [key, value] of Object.entries(object)) {
    if (isEmpty(value)) continue;
    if (Array.isArray(value)) {
      lines.push(`${pad}${key}:`);
      for (const item of value) {
        if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
          const entries = Object.entries(item).filter(([, v]) => !isEmpty(v));
          entries.forEach(([k, v], index) => {
            lines.push(
              `${pad}${index === 0 ? '  - ' : '    '}${k}: ${scalar(v as string | number | boolean)}`,
            );
          });
        } else if (!isEmpty(item)) {
          lines.push(`${pad}  - ${scalar(item as string | number | boolean)}`);
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      lines.push(`${pad}${key}:`);
      emit(value, indent + 1, lines);
    } else {
      lines.push(`${pad}${key}: ${scalar(value as string | number | boolean)}`);
    }
  }
}

/** Basit YAML üretici (yalnızca bu taslaklardaki şekiller için). */
export function toYaml(object: { [key: string]: YamlValue }): string {
  const lines: string[] = [];
  emit(object, 0, lines);
  return lines.join('\n');
}

export interface Draft {
  /** Depoda önerilen dosya yolu */
  path: string;
  content: string;
}

const DIRS: Record<ListingKind, string> = {
  stand: 'content/fuar',
  job: 'content/is-ilanlari',
  candidate: 'content/is-arayanlar',
  market: 'content/market',
};

function fileSlug(title: string, fallback: string): string {
  let slug = slugify(title);
  if (slug.length > 70) slug = slug.slice(0, 70).replace(/-[^-]*$/, '');
  return slug || fallback.toLowerCase();
}

function summaryFrom(text: string): string {
  return truncate(text.replace(/\s+/g, ' ').trim(), 200);
}

function provinces(values: FormValues, id: string): string[] {
  return listValue(values, id).map((item) => canonicalProvince(item) ?? item);
}

function header(ref: string, kind: ListingKind): string {
  return [
    `# Başvuru ${ref}: editör kontrolünden sonra yayımlamak için`,
    `#   status: published, postedAt, expiresAt (en fazla ${LISTING_MAX_DAYS[kind]} gün),`,
    '#   moderatedBy ve moderatedAt alanlarını doldurun. Kurallar: docs/ilanlar-ve-fuar.md',
  ].join('\n');
}

function assemble(
  kind: ListingKind,
  ref: string,
  slug: string,
  data: { [key: string]: YamlValue },
  body: string,
): Draft {
  return {
    path: `${DIRS[kind]}/${slug}.md`,
    content: `---\n${header(ref, kind)}\n${toYaml(data)}\n---\n\n${body.trim()}\n`,
  };
}

/** Başvurunun taslak içerik dosyası; iletişim talebinde taslak yoktur. */
export function buildDraft(
  kind: FormKind,
  values: FormValues,
  context: { ref: string; today: string; marketKind?: string },
): Draft | undefined {
  const t = (id: string) => textValue(values, id) || undefined;
  const n = (id: string) => numberValue(values, id);
  const list = (id: string) => listValue(values, id);
  const { ref, today } = context;

  switch (kind) {
    case 'is-ilani': {
      const title = textValue(values, 'title');
      const description = textValue(values, 'description');
      const min = n('salaryMin');
      const max = n('salaryMax');
      return assemble(
        'job',
        ref,
        fileSlug(title, ref),
        {
          status: 'review',
          ref,
          title,
          summary: summaryFrom(description),
          position: t('position'),
          employer: { name: t('employerName'), website: t('employerWebsite') },
          city: t('city'),
          district: t('district'),
          siteType: t('siteType'),
          employmentType: t('employmentType'),
          shift: t('shift'),
          openings: n('openings'),
          experienceYears: n('experienceYears'),
          education: t('education'),
          requirements: list('requirements'),
          certificates: list('certificates'),
          benefits: list('benefits'),
          salary:
            min !== undefined || max !== undefined
              ? { min, max, currency: 'TRY', period: 'aylik', basis: 'net' }
              : undefined,
          apply: { method: t('applyMethod'), value: t('applyValue'), note: t('applyNote') },
        },
        description,
      );
    }
    case 'aday-profili': {
      const about = textValue(values, 'about');
      return assemble(
        'candidate',
        ref,
        ref.toLowerCase(),
        {
          status: 'review',
          ref,
          headline: t('headline'),
          summary: summaryFrom(about),
          position: t('position'),
          experienceYears: n('experienceYears'),
          education: t('education'),
          certificates: list('certificates'),
          skills: list('skills'),
          languages: list('languages'),
          preferredCities: provinces(values, 'preferredCities'),
          siteTypes: arrayValue(values, 'siteTypes'),
          employmentTypes: arrayValue(values, 'employmentTypes'),
          availability: t('availability'),
          consentAt: today,
        },
        about,
      );
    }
    case 'market-ilani': {
      const title = textValue(values, 'title');
      const description = textValue(values, 'description');
      const marketKind = context.marketKind;
      const equipment = marketKind === 'ekipman' || marketKind === 'parca';
      const direct = textValue(values, 'contactMode') === 'dogrudan';
      const amount = n('priceAmount');
      const quantity = n('quantityValue');
      return assemble(
        'market',
        ref,
        fileSlug(title, ref),
        {
          status: 'review',
          ref,
          title,
          summary: summaryFrom(description),
          category: t('category'),
          type: t('type'),
          condition: equipment ? t('condition') : undefined,
          brand: equipment ? t('brand') : undefined,
          model: equipment ? t('model') : undefined,
          year: equipment ? n('year') : undefined,
          hours: equipment ? n('hours') : undefined,
          quantity:
            marketKind === 'cevher' && quantity !== undefined
              ? { value: quantity, unit: t('quantityUnit') ?? 't' }
              : undefined,
          price:
            amount !== undefined
              ? {
                  amount,
                  currency: t('priceCurrency') ?? 'TRY',
                  per: t('pricePer'),
                  vat: t('priceVat'),
                }
              : undefined,
          city: t('city'),
          district: t('district'),
          seller: { name: t('sellerName'), kind: t('sellerKind') },
          contact: {
            mode: direct ? 'dogrudan' : 'aracili',
            phone: direct ? t('contactPhone') : undefined,
            email: direct ? t('contactEmail') : undefined,
            website: t('website'),
          },
          ore:
            marketKind === 'cevher'
              ? {
                  mineral: t('oreMineral'),
                  grade: t('oreGrade'),
                  analysis: t('oreAnalysis'),
                  delivery: t('oreDelivery'),
                }
              : undefined,
          license:
            marketKind === 'saha'
              ? {
                  group: t('licenseGroup'),
                  kind: t('licenseKind'),
                  offer: t('licenseOffer'),
                  areaHectares: n('licenseArea'),
                  reserve: t('licenseReserve'),
                }
              : undefined,
        },
        description,
      );
    }
    case 'fuar-standi': {
      const name = textValue(values, 'name');
      const offerings = list('offerings').map((line) => {
        const [head, ...rest] = line.split(':');
        const description = rest.join(':').trim();
        return {
          name: (head ?? line).trim().slice(0, 80),
          description: description.length >= 5 ? description.slice(0, 240) : undefined,
        };
      });
      return assemble(
        'stand',
        ref,
        fileSlug(name, ref),
        {
          status: 'review',
          ref,
          name,
          summary: t('summary'),
          halls: arrayValue(values, 'halls'),
          city: t('city'),
          serviceArea: provinces(values, 'serviceArea'),
          founded: n('founded'),
          website: t('website'),
          email: t('email'),
          phone: t('phone'),
          address: t('address'),
          offerings,
          brands: list('brands'),
          certificates: list('certificates'),
        },
        textValue(values, 'description'),
      );
    }
    case 'iletisim-talebi':
      return undefined;
  }
}
