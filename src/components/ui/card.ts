/** Kart çerçevesi (iç boşluk olmadan); görselli kartlarda kullanılır */
export const cardFrame =
  'group relative flex h-full flex-col rounded-xl border border-stone-200 bg-white shadow-sm transition-colors hover:border-copper-300 has-[a:focus-visible]:outline-3 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-copper-500';

/** İç boşluklu standart kart */
export const cardBase = `${cardFrame} p-5`;

/** Kartın tamamını tıklanabilir yapan bağlantı (başlıktaki <Link> üzerine) */
export const stretchedLink =
  'after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none';
