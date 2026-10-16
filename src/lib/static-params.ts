/**
 * Statik dışa aktarma (output: 'export'), her dinamik rotanın en az bir sayfa
 * üretmesini zorunlu kılar. Bir bölümde henüz yayımlanmış ilan yoksa (ör. tüm
 * başvurular editör onayı beklerken) derlemenin kırılmaması için 404 gösteren tek
 * bir yer tutucu sayfa üretilir.
 *
 * Yer tutucu slug alt çizgiyle başlar; içerik slug'ları yalnızca a-z, 0-9 ve tire
 * içerebildiği için gerçek bir içerikle asla çakışmaz. İlk ilan yayımlandığında
 * yer tutucu kendiliğinden kaybolur.
 */
export const PLACEHOLDER_SLUG = '_yayimlanmis-icerik-yok';

export function slugParams(slugs: string[]): { slug: string }[] {
  return slugs.length > 0 ? slugs.map((slug) => ({ slug })) : [{ slug: PLACEHOLDER_SLUG }];
}
