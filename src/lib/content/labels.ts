import type { SourceType } from './schemas';

/** Kaynak türü etiketleri (kaynak politikasındaki öncelik sırasıyla). */
export const sourceTypeLabels: Record<SourceType, string> = {
  'resmi-kurum': 'Resmî kurum',
  mevzuat: 'Mevzuat',
  akademik: 'Akademik yayın',
  kitap: 'Teknik kitap',
  standart: 'Standart',
  kilavuz: 'Mesleki kılavuz',
  sektor: 'Sektör / meslek kuruluşu',
};
