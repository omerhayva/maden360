/**
 * Arayüz sınıf üreticileri: düğmeler, simge düğmeleri, çipler, form alanları ve metin bağlantıları.
 * Sunucu ve tarayıcı bileşenlerinde ortak kullanılır (React içe aktarmaz, saf fonksiyonlardır).
 *
 * Tasarım kararları ve dayandıkları açık kaynak tasarım sistemleri: docs/arayuz-rehberi.md
 *
 * Kurallar:
 * - Tailwind sınıfları derleme sırasında kaynak koddan tarandığı için her sınıf burada tam yazılır;
 *   parça birleştirerek sınıf adı üretilmez.
 * - Aynı CSS özelliğini iki kez veren sınıflar (ör. `p-0` ve `p-5`) hangisinin kazanacağı CSS
 *   sırasına bağlı olduğu için birlikte kullanılmaz. Her üretici, temel/varyant/boyut gruplarını
 *   çakışmayacak biçimde ayırır; `className` ile yalnızca bu gruplarda olmayan sınıflar (kenar
 *   boşluğu, iç boşluk, konum) eklenir. styles.test.ts bunu tüm seçenekler için denetler.
 */

export type ClassValue = string | false | null | undefined;

/** Boş ve yanlış değerleri atlayarak sınıfları birleştirir. */
export function cx(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}

/* ---------------------------------- Düğmeler ---------------------------------- */

export const BUTTON_VARIANTS = [
  'primary',
  'secondary',
  'ghost',
  'subtle',
  'inverse',
  'ghost-inverse',
] as const;
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

export const BUTTON_SIZES = ['sm', 'md', 'lg'] as const;
export type ButtonSize = (typeof BUTTON_SIZES)[number];

export const BUTTON_WIDTHS = ['auto', 'full', 'full-mobile'] as const;
export type ButtonWidth = (typeof BUTTON_WIDTHS)[number];

/**
 * Ortak temel. Kenarlık her varyantta vardır (çoğunda saydam): Windows yüksek kontrast
 * modunda arka plan renkleri kaldırılınca düğmenin sınırı yine görünür.
 * Renk geçişleri kısa (100 ms) ve yalnızca renk/gölge içindir; basınca geçiş beklenmez.
 */
const BUTTON_BASE =
  'relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2 rounded-sm border text-center font-semibold leading-tight no-underline [-webkit-tap-highlight-color:transparent] transition-[color,background-color,border-color,box-shadow,translate] duration-100 ui-active:transition-none disabled:cursor-not-allowed disabled:opacity-55 data-loading:cursor-progress [&_svg]:pointer-events-none [&_svg]:shrink-0';

/**
 * "Basılabilir" düğmeler: altta 2 px'lik koyu kenar; basınca düğme 2 px iner ve kenar kaybolur.
 * ::before katmanı tıklama alanını alt kenarı da kapsayacak biçimde genişletir; düğme aşağı
 * inerken üst kenara yapılan tıklamalar boşa gitmez (GOV.UK Frontend'deki çözüm).
 */
const PRESSABLE =
  'shadow-[0_2px_0_0_var(--btn-edge)] before:absolute before:-inset-x-px before:-top-px before:-bottom-[3px] ui-active:translate-y-0.5 ui-active:shadow-none ui-active:before:-top-[3px]';

const BUTTON_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  /** Sayfanın ana eylemi (bir ekranda tercihen bir tane) */
  primary: `${PRESSABLE} border-transparent bg-copper-700 text-white [--btn-edge:var(--color-copper-900)] ui-hover:bg-copper-800 ui-hover:[--btn-edge:var(--color-copper-950)] ui-active:bg-copper-900`,
  /** İkincil eylemler; ana eylemin yanında */
  secondary: `${PRESSABLE} border-graphite-400 bg-white text-graphite-900 [--btn-edge:var(--color-graphite-400)] ui-hover:border-graphite-600 ui-hover:bg-stone-50 ui-hover:[--btn-edge:var(--color-graphite-600)] ui-active:bg-stone-100`,
  /** Düşük öncelikli eylemler (süzgeç temizleme, yeni başvuru); bakır metin */
  ghost:
    'border-transparent bg-transparent text-copper-700 ui-hover:bg-copper-50 ui-hover:text-copper-800 ui-active:bg-copper-100',
  /** Nötr simge düğmeleri (ör. arama kutusunu temizle) */
  subtle:
    'border-transparent bg-transparent text-graphite-600 ui-hover:bg-stone-100 ui-hover:text-graphite-950 ui-active:bg-stone-200',
  /** Fotoğraflı (koyu) başlıklarda ikincil eylem */
  inverse: `${PRESSABLE} border-white/60 bg-graphite-950/55 text-white [--btn-edge:var(--color-graphite-950)] ui-hover:border-white ui-hover:bg-graphite-950/75 ui-active:bg-graphite-950/90`,
  /** Koyu zeminde simge düğmeleri */
  'ghost-inverse':
    'border-transparent bg-transparent text-graphite-100 ui-hover:bg-graphite-800 ui-hover:text-white ui-active:bg-graphite-700',
};

/**
 * Yükseklikler: dokunmatik ekranda en az 44 px (WCAG 2.5.5, Apple HIG). `sm` yalnızca fareli
 * cihazlarda 40 px'tir; dokunmatik ekranda 44 px'e büyür.
 */
const BUTTON_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-3.5 py-1.5 text-sm pointer-coarse:min-h-11 [&_svg]:size-4',
  md: 'min-h-11 px-4 py-2 text-base [&_svg]:size-4',
  lg: 'min-h-12 px-5 py-2.5 text-base [&_svg]:size-[1.125rem]',
};

const BUTTON_WIDTH_CLASSES: Record<ButtonWidth, string> = {
  auto: '',
  full: 'w-full',
  /** Mobilde tam genişlik, geniş ekranda içerik kadar (GOV.UK ve USWDS düzeni) */
  'full-mobile': 'w-full sm:w-auto',
};

export interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  width?: ButtonWidth;
  /** Yalnızca kenar boşluğu, konum gibi çakışmayan sınıflar */
  className?: string;
}

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  width = 'auto',
  className,
}: ButtonStyleOptions = {}): string {
  return cx(
    BUTTON_BASE,
    BUTTON_VARIANT_CLASSES[variant],
    BUTTON_SIZE_CLASSES[size],
    BUTTON_WIDTH_CLASSES[width],
    className,
  );
}

/** Kare simge düğmeleri; erişilebilir ad (aria-label) bileşende zorunludur. */
const ICON_BUTTON_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'size-10 pointer-coarse:size-11 [&_svg]:size-4',
  md: 'size-11 [&_svg]:size-5',
  lg: 'size-12 [&_svg]:size-5',
};

export function iconButtonClasses({
  variant = 'ghost',
  size = 'md',
  className,
}: Omit<ButtonStyleOptions, 'width'> = {}): string {
  return cx(
    BUTTON_BASE,
    BUTTON_VARIANT_CLASSES[variant],
    ICON_BUTTON_SIZE_CLASSES[size],
    className,
  );
}

/* ---------------------------------- Çipler ---------------------------------- */

export type ChipTone = 'light' | 'inverse';

/**
 * Etiket bağlantıları ve süzgeç düğmeleri (küçük köşeli, hap biçimi kullanılmaz). Süzgeç olarak kullanılan çipte seçili
 * durum `aria-pressed` ile bildirilir; etiket metni seçime göre değişmez (WAI-ARIA APG).
 */
export function chipClasses({
  selected = false,
  tone = 'light',
}: { selected?: boolean; tone?: ChipTone } = {}): string {
  return cx(
    'inline-flex min-h-10 items-center gap-1.5 rounded-sm border px-3 text-sm font-medium [-webkit-tap-highlight-color:transparent] transition-colors duration-100 pointer-coarse:min-h-11 [&_svg]:size-4 [&_svg]:shrink-0',
    tone === 'inverse'
      ? 'border-white/45 bg-graphite-950/45 text-white ui-hover:border-white ui-hover:bg-graphite-950/70 ui-active:bg-graphite-950/85'
      : selected
        ? 'border-graphite-900 bg-graphite-900 text-white'
        : 'border-graphite-400 bg-white text-graphite-800 ui-hover:border-graphite-700 ui-hover:text-graphite-950 ui-active:bg-stone-100',
  );
}

/* ---------------------------------- Form alanları ---------------------------------- */

export const FIELD_SIZES = ['sm', 'md', 'lg', 'xl'] as const;
export type FieldSize = (typeof FIELD_SIZES)[number];
export type FieldTone = 'light' | 'dark';

const FIELD_SIZE_CLASSES: Record<FieldSize, string> = {
  sm: 'min-h-10 rounded-sm',
  md: 'min-h-11 rounded-sm',
  lg: 'min-h-12 rounded-sm',
  /** Büyük arama kutuları (ana sayfa, arama sayfası) */
  xl: 'min-h-14 rounded-sm',
};

/**
 * Metin kutusu, açılır liste ve çok satırlı alanlar. Kenarlık beyaz zeminde ≈ 5,2:1 kontrastlıdır
 * (graphite-500; WCAG 1.4.11 arayüz sınırları için 3:1 ister). Odakta kenarlık koyu bakıra döner
 * ve kalınlaşır, çevresinde hafif bir hale belirir. Saydam dış çizgi yüksek kontrast modunda odak
 * çerçevesi olarak görünür (gölgeler o modda çizilmez).
 */
export function inputClasses({
  size = 'lg',
  tone = 'light',
  invalid = false,
  className,
}: { size?: FieldSize; tone?: FieldTone; invalid?: boolean; className?: string } = {}): string {
  return cx(
    'block w-full min-w-0 border text-base transition-[border-color,box-shadow] duration-100 focus:outline-2 focus:outline-offset-0 focus:outline-transparent focus:ring-3 focus:inset-ring-1',
    tone === 'dark'
      ? 'border-graphite-700 bg-graphite-900 text-white placeholder:text-graphite-400 ui-hover:not-focus:border-graphite-500 focus:border-copper-400 focus:ring-copper-400/30 focus:inset-ring-copper-400'
      : invalid
        ? 'border-red-700 bg-white text-graphite-950 placeholder:text-graphite-500 focus:border-red-700 focus:ring-red-700/20 focus:inset-ring-red-700'
        : 'border-graphite-500 bg-white text-graphite-950 placeholder:text-graphite-500 ui-hover:not-focus:border-graphite-700 focus:border-copper-700 focus:ring-copper-700/20 focus:inset-ring-copper-700',
    FIELD_SIZE_CLASSES[size],
    className,
  );
}

/* ---------------------------------- Fotoğraflı zeminler ---------------------------------- */

/**
 * Fotoğrafın üzerindeki koyu katman (ana sayfa girişi ve bölüm başlıkları); metin bu katmanın
 * üzerinde durur. Kapsayıcıda `relative isolate` olmalı, fotoğraf da `-z-10` ile arkada durur.
 * - xl altı (telefon, tablet, küçük dizüstü): her yerde %75 grafit.
 * - xl ve üstü: soldan sağa %90 → %75 (genişliğin %65'inde) → %25. Metin sütunu en fazla 48rem
 *   olduğundan 1280 px'te genişliğin %62,5'ine kadar uzanır; orada katman hâlâ ≈ %76'dır.
 * Fotoğraf üzerindeki metinler beyaz, graphite-100/200 ve copper-300 renklerindendir.
 * photos.test.ts, tonlanmış fotoğrafın en açık olası pikselinde bile bu metinlerin 4,5:1
 * kontrastı sağladığını buradaki değerlerle denetler; değerleri değiştirirseniz test uyarır.
 */
export const photoScrimClasses =
  'absolute inset-0 -z-10 bg-graphite-950/75 xl:bg-transparent xl:bg-linear-to-r xl:from-graphite-950/90 xl:via-graphite-950/75 xl:via-65% xl:to-graphite-950/25';

/** Fotoğrafın kendisi (kapsayıcıyı kaplar, katmanın arkasında durur) */
export const photoFillClasses = 'absolute inset-0 -z-10 size-full object-cover';

/* ---------------------------------- Metin bağlantıları ---------------------------------- */

/**
 * Bölüm başlığı yanındaki ve bölüm sonlarındaki "Tüm iş ilanları (4)" türü bağlantılar. Metin
 * bağlantısıdır (düğme değil); ok simgesi eklenmez, ne olduğu metinden anlaşılır. Dokunma alanı
 * 44 px yüksekliktedir.
 */
export function textLinkClasses({
  tone = 'light',
  size = 'sm',
  className,
}: { tone?: 'light' | 'inverse'; size?: 'sm' | 'md'; className?: string } = {}): string {
  return cx(
    'inline-flex min-h-11 items-center gap-1.5 font-semibold underline-offset-4 ui-hover:underline [&_svg]:size-4 [&_svg]:shrink-0',
    tone === 'inverse'
      ? 'text-copper-300 ui-hover:text-copper-200'
      : 'text-copper-700 ui-hover:text-copper-900',
    size === 'md' ? 'text-base' : 'text-sm',
    className,
  );
}
