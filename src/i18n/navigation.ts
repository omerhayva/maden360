import { routes } from './routes';

export interface NavItem {
  href: string;
  label: string;
  description?: string;
}

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

export const trustNav: NavItem[] = [
  { href: routes.about(), label: 'Hakkımızda' },
  { href: routes.sourcePolicy(), label: 'Kaynak politikası' },
  { href: routes.correctionPolicy(), label: 'Düzeltme politikası' },
  { href: routes.contact(), label: 'İletişim' },
];
