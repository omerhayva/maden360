/**
 * Kart ve kutucuk sınıfları. Üzerine gelince kenarlık bakıra döner ve gölge hafifçe derinleşir;
 * kart içindeki bağlantı klavyeyle odaklanınca kartın tamamı çerçevelenir.
 */

/** Kart çerçevesi (iç boşluk olmadan); görselli kartlarda kullanılır */
export const cardFrame =
  'group relative flex h-full flex-col rounded-xl border border-stone-200 bg-white shadow-sm transition-[border-color,box-shadow] duration-100 ui-hover:border-copper-400 ui-hover:shadow-md has-[a:focus-visible]:outline-3 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-copper-500';

/** İç boşluklu standart kart */
export const cardBase = `${cardFrame} p-5`;

/** Kartın tamamını tıklanabilir yapan bağlantı (başlıktaki <Link> üzerine) */
export const stretchedLink =
  'after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none';

const TILE_BASE =
  'group flex h-full rounded-xl border border-stone-200 [-webkit-tap-highlight-color:transparent] transition-[border-color,box-shadow,background-color] duration-100 ui-hover:border-copper-400 ui-hover:shadow-sm';

/**
 * Bağlantı kutucuğu (kategori, salon, bölüm kısayolları): kutunun tamamı tek bir bağlantıdır.
 * Taş zeminli bölümlerde beyaz (`white`), beyaz zeminli bölümlerde açık taş renkli (`stone`)
 * yüzey kullanılır. Çok satırlı içerikte simge üste hizalanır (`align: 'start'`).
 */
export function tileClasses({
  surface = 'white',
  align = 'center',
  size = 'md',
}: {
  surface?: 'white' | 'stone';
  align?: 'center' | 'start';
  /** md: p-4, lg: p-5 (büyük başlıklı kutucuklar) */
  size?: 'md' | 'lg';
} = {}): string {
  return [
    TILE_BASE,
    surface === 'stone'
      ? 'bg-stone-50 ui-hover:bg-white ui-active:bg-stone-100'
      : 'bg-white shadow-xs ui-active:bg-stone-50',
    align === 'start' ? 'items-start gap-4' : 'items-center gap-3',
    size === 'lg' ? 'p-5' : 'p-4',
  ].join(' ');
}

export const tileLink = tileClasses();

/** Kutucuktaki koyu simge yuvası */
export const iconTile =
  'flex shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-graphite-800 to-graphite-950 text-copper-400 ring-1 ring-inset ring-white/10';
