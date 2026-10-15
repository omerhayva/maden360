/**
 * Sitenin tek yapılandırma noktası.
 *
 * Proje adı henüz kesinleşmediği için "Maden360" çalışma adı olarak kullanılıyor.
 * Ad, alan adı veya iletişim adresi değiştiğinde yalnızca bu dosyayı (ve gerekirse
 * SITE_URL ortam değişkenini) güncellemek yeterlidir.
 */

const DEFAULT_SITE_URL = 'https://maden360.example';

function resolveSiteUrl(): string {
  const raw = process.env.SITE_URL?.trim();
  return (raw && raw.length > 0 ? raw : DEFAULT_SITE_URL).replace(/\/+$/, '');
}

export const siteConfig = {
  name: 'Maden360',
  shortDescription: 'Madencilik bilgi ve hesaplama platformu',
  tagline: 'Madencilik için kaynaklı bilgi, test edilmiş hesaplamalar',
  description:
    'Maden mühendisleri, teknikerler, öğrenciler ve saha ekipleri için kaynaklı teknik rehberler, madencilik sözlüğü ve formülleri açıklanmış hesaplama araçları.',
  url: resolveSiteUrl(),
  /** SITE_URL ayarlanmadan üretim derlemesi alınırsa uyarı vermek için kullanılır. */
  isUrlConfigured: Boolean(process.env.SITE_URL?.trim()),
  language: 'tr',
  ogLocale: 'tr_TR',
  /**
   * TODO(yayın öncesi): Gerçek iletişim adresiyle değiştirin.
   * ".example" uzantısı ayrılmış bir alan adıdır; yanlışlıkla başkasına e-posta gitmez.
   */
  contactEmail: 'iletisim@maden360.example',
  /** Ana sayfada ve aramada önerilen sorgular. */
  popularSearches: ['dekapaj oranı', 'metal kazanımı', 'tonaj hesabı', 'kabarma', 'maden grupları'],
} as const;

export type SiteConfig = typeof siteConfig;
