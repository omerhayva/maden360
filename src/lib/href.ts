/**
 * Site içi adres mi? (/fuar, /ara?q=... → evet; //alan.com, https:, mailto:, tel:, #bolum → hayır)
 * Site içi adresler Next.js bağlantısıyla (sayfa yenilenmeden), diğerleri düz <a> ile açılır.
 */
export function isInternalHref(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//');
}
