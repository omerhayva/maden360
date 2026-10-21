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
  shortDescription: 'Madencilik ilanları ve firma rehberi',
  /** Ana sayfanın <title> etiketi ve paylaşım görseli */
  tagline: 'Madencilik iş ilanları, makine ilanları ve firma rehberi',
  /** Varsayılan meta açıklaması (arama motoru sonuçlarında görünür) */
  description:
    'Madencilik iş ilanları, iş arayan mühendis ve operatör profilleri, satılık ve kiralık iş makineleri, yedek parça, cevher ve saha ilanları, tedarikçi firma rehberi. İlanlar editör onayıyla yayımlanır.',
  /** Altbilgideki kısa tanım */
  footerNote:
    'Madencilik sektörü için ücretsiz ilan sitesi. Her ilanı yayından önce bir editör okur.',
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
  /**
   * TODO(yayın öncesi): İlan, stand ve iletişim talebi başvurularının gideceği adres.
   * Form hizmeti ayarlanmamışsa başvurular bu adrese e-postayla (mailto) gönderilir.
   */
  listingsEmail: 'ilan@maden360.example',
  /**
   * İsteğe bağlı form hizmeti (Formspree, Web3Forms vb.). Ayarlanırsa başvurular e-posta
   * programı açılmadan doğrudan bu adrese gönderilir. Bkz. docs/ilanlar-ve-fuar.md
   */
  formEndpoint: process.env.NEXT_PUBLIC_FORM_ENDPOINT?.trim() ?? '',
  /** Web3Forms gibi erişim anahtarı isteyen hizmetler için (gizli değildir, tarayıcıya gider). */
  formAccessKey: process.env.NEXT_PUBLIC_FORM_ACCESS_KEY?.trim() ?? '',
  /** Ana sayfada ve aramada önerilen sorgular. */
  popularSearches: ['ekskavatör', 'daimi nezaretçi', 'kırıcı', 'rödövans', 'sondaj'],
} as const;

export type SiteConfig = typeof siteConfig;
