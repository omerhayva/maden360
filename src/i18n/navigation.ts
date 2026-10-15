import { routes } from './routes';

export interface NavItem {
  href: string;
  label: string;
  description?: string;
}

/** Bilgi ve araçlar */
export const mainNav: NavItem[] = [
  {
    href: routes.articles(),
    label: 'Bilgi Merkezi',
    description: 'Kaynaklı teknik makaleler',
  },
  {
    href: routes.calculators(),
    label: 'Hesaplamalar',
    description: 'Formülleri açıklanmış araçlar',
  },
  {
    href: routes.guide(),
    label: 'Sektör Rehberi',
    description: 'Maden türleri, yöntemler, roller',
  },
  {
    href: routes.glossary(),
    label: 'Sözlük',
    description: 'Madencilik terimleri',
  },
];

/** Sektör ağı: fuar, iş ve market (editör onaylı ilanlar) */
export const sectorNav: NavItem[] = [
  {
    href: routes.fair(),
    label: 'Sanal Fuar',
    description: 'Tedarikçi ve hizmet firmalarının standları',
  },
  {
    href: routes.jobs(),
    label: 'İş İlanları',
    description: 'İşçi arayanlar ve iş arayanlar',
  },
  {
    href: routes.market(),
    label: 'Market',
    description: 'Ekipman, parça, hizmet, cevher ve saha',
  },
];

export const trustNav: NavItem[] = [
  { href: routes.about(), label: 'Hakkımızda' },
  { href: routes.sourcePolicy(), label: 'Kaynak politikası' },
  { href: routes.correctionPolicy(), label: 'Düzeltme politikası' },
  { href: routes.contact(), label: 'İletişim' },
];
