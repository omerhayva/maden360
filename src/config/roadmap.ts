/**
 * Planlanan hesaplayıcılar (hesaplamalar sayfasında "yol haritası" olarak gösterilir).
 * Bir araç yayımlandığında buradan kaldırın.
 */
export interface PlannedCalculator {
  title: string;
  category: string;
  note: string;
  /** Saha kararlarıyla ilişkili, ek mesleki doğrulama uyarısı gerektiren araç */
  safetyCritical?: boolean;
}

export const plannedCalculators: PlannedCalculator[] = [
  {
    title: 'Kamyon çevrim süresi ve filo kapasitesi',
    category: 'Nakliyat',
    note: 'Teorik kapasite ile kullanılabilirlik, kullanım oranı ve verim kayıpları sonrası fiili kapasite ayrı gösterilecek.',
  },
  {
    title: 'Bant konveyör kapasitesi (ön boyutlandırma)',
    category: 'Nakliyat',
    note: 'Bant hızı, yük kesit alanı ve yığın yoğunluğuna göre teorik kapasite; fiili kapasite için düzeltme katsayıları.',
  },
  {
    title: 'Ekipman kullanılabilirliği ve kullanım oranı',
    category: 'Üretim ve Planlama',
    note: 'Takvim, planlı/plansız bakım, bekleme ve çalışma sürelerinden standart zaman sınıflandırmasına göre göstergeler.',
  },
  {
    title: 'Havalandırma hava miktarı (ön hesap)',
    category: 'Havalandırma',
    note: 'Yalnızca eğitim ve ön değerlendirme amaçlı; ilgili mevzuat ve yetkili mühendis doğrulaması olmadan saha kararında kullanılamaz.',
    safetyCritical: true,
  },
  {
    title: 'Patlatma delik düzeni (ön hesap)',
    category: 'Madencilik Yöntemleri',
    note: 'Yalnızca eğitim amaçlı; patlatma tasarımı yetkili mühendis ve ateşleyici sorumluluğundadır.',
    safetyCritical: true,
  },
];
