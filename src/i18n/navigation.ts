import { routes } from './routes';

export interface NavItem {
  href: string;
  label: string;
  description?: string;
}

/** Ana menü: sektör ağı (editör onaylı ilanlar) */
export const mainNav: NavItem[] = [
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
  { href: routes.contact(), label: 'İletişim' },
];
