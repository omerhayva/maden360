/**
 * Panel, liste ve kart sınıfları.
 *
 * İlanlar kart ızgarası yerine tek bir panel içinde satır satır listelenir (listPanel + listRow):
 * ilan sitelerinde göz satırları yukarıdan aşağı tarar, aynı biçimli kutular arasında dolaşmaz.
 * Kart (cardFrame) yalnızca gerçekten ayrı duran içerikte kullanılır (ör. yan sütun kutuları).
 * Gölge kullanılmaz; ayrım 1 px kenarlık ve zemin farkıyla yapılır.
 */

/** Beyaz panel: kenarlıklı, küçük köşeli */
export const panel = 'rounded-sm border border-stone-300 bg-white';

/** Satırları ince çizgiyle ayrılan liste paneli (<ul> veya <ol> üzerine) */
export const listPanel = `${panel} divide-y divide-stone-200`;

/**
 * Liste satırı: satırın tamamı başlıktaki bağlantıyla tıklanır (stretchedLink). Klavyeyle
 * odaklanınca satır çerçevelenir; üzerine gelince zemin hafifçe koyulaşır.
 */
export const listRow =
  'group relative px-4 py-4 transition-colors duration-100 sm:px-5 ui-hover:bg-stone-50 has-[a:focus-visible]:z-10 has-[a:focus-visible]:outline-3 has-[a:focus-visible]:-outline-offset-1 has-[a:focus-visible]:outline-copper-700';

/** Kart çerçevesi (iç boşluk olmadan) */
export const cardFrame =
  'group relative flex h-full flex-col rounded-sm border border-stone-300 bg-white transition-colors duration-100 ui-hover:border-graphite-400 has-[a:focus-visible]:outline-3 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-copper-700';

/** İç boşluklu standart kart */
export const cardBase = `${cardFrame} p-5`;

/** Satırın veya kartın tamamını tıklanabilir yapan bağlantı (başlıktaki <Link> üzerine) */
export const stretchedLink =
  'underline-offset-4 after:absolute after:inset-0 focus-visible:outline-none group-hover:underline';
