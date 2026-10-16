/**
 * Arka plan fotoğrafları: ana sayfanın giriş bölümü ve bölüm başlıkları (Sanal Fuar, İş İlanları,
 * İş Arayanlar, Market, İlan ver ve alt sayfaları).
 *
 * Kaynaklar `assets/gorseller/<anahtar>.jpg` dosyalarıdır. `npm run generate:images` her kaynağı
 * sitenin renklerine göre tonlar (gölgeler grafit, açık tonlar bakır) ve `public/gorseller/`
 * klasörüne üç genişlikte AVIF ve WebP olarak yazar. Kendi fotoğrafınızı kullanmak için dosyayı
 * aynı adla kaynak klasörüne koyup betiği yeniden çalıştırın (docs/arayuz-rehberi.md → Görseller).
 *
 * Bileşenler, hazırlama betiği ve testler bu dosyayı ortak kullanır; React içe aktarmaz.
 */

import { hexToRgb } from '@/lib/color';

export const PHOTO_SOURCE_DIR = 'assets/gorseller';
export const PHOTO_OUTPUT_DIR = 'public/gorseller';
export const PHOTO_URL_BASE = '/gorseller';

/** Üretilen genişlikler (px). Kaynak görsel en az en büyük genişlik kadar geniş olmalıdır. */
export const PHOTO_WIDTHS = [640, 960, 1376] as const;
/** srcset'i tanımayan çok eski tarayıcıların indireceği genişlik */
export const PHOTO_FALLBACK_WIDTH: (typeof PHOTO_WIDTHS)[number] = 960;
export const PHOTO_FORMATS = ['avif', 'webp'] as const;
export type PhotoFormat = (typeof PHOTO_FORMATS)[number];

export interface PhotoConfig {
  /** Görselde ne olduğu (belgeler için; görseller dekoratiftir, sayfada alt metni boştur) */
  subject: string;
  /** Görsel kırpılırken görünür kalacak odak noktası (CSS object-position: yatay dikey) */
  focus: `${number}% ${number}%`;
}

export const photos = {
  'ana-sayfa': {
    subject: 'Gün batımında açık ocak: basamaklar ve rampada tırmanan maden kamyonu',
    focus: '72% 55%',
  },
  fuar: {
    subject: 'Fuar salonunda sergilenen sondaj makinesi, mobil kırıcı ve ekskavatör',
    focus: '68% 60%',
  },
  'is-ilanlari': {
    subject: 'Açık ocağı tepeden izleyen, baretli ve yelekli iki mühendis (arkadan)',
    focus: '76% 45%',
  },
  'is-arayanlar': {
    subject: 'Lamba odasında askıdaki baretler ve kask lambaları',
    focus: '35% 50%',
  },
  market: {
    subject: 'Kırma-eleme tesisi: konveyörler, konik kırıcı, stok yığınları ve yükleyici',
    focus: '60% 50%',
  },
  'ilan-ver': {
    subject: 'Saha ofisinde baret, tablet, maden planları ve karot sandığı',
    focus: '62% 60%',
  },
} as const satisfies Record<string, PhotoConfig>;

export type PhotoKey = keyof typeof photos;
export const PHOTO_KEYS = Object.keys(photos) as PhotoKey[];

export function photoUrl(key: PhotoKey, width: number, format: PhotoFormat): string {
  return `${PHOTO_URL_BASE}/${key}-${width}.${format}`;
}

/**
 * `srcset` değeri: tarayıcı ekran genişliğine ve piksel yoğunluğuna göre dosyayı seçer.
 * `maxWidth`, küçük alanlarda (ör. kart görselleri) gereğinden büyük dosya indirilmesini önler.
 */
export function photoSrcSet(
  key: PhotoKey,
  format: PhotoFormat,
  maxWidth: number = Number.POSITIVE_INFINITY,
): string {
  const widths = PHOTO_WIDTHS.filter((width) => width <= maxWidth);
  return (widths.length > 0 ? widths : [PHOTO_WIDTHS[0]])
    .map((width) => `${photoUrl(key, width, format)} ${width}w`)
    .join(', ');
}

/** srcset'i tanımayan tarayıcılar için tek dosya: `maxWidth` sınırı içindeki en uygun genişlik */
export function photoFallbackSrc(key: PhotoKey, maxWidth: number = Number.POSITIVE_INFINITY) {
  const limit = Math.min(PHOTO_FALLBACK_WIDTH, maxWidth);
  const width = PHOTO_WIDTHS.filter((candidate) => candidate <= limit).at(-1) ?? PHOTO_WIDTHS[0];
  return photoUrl(key, width, 'webp');
}

export type ToneStop = readonly [position: number, color: `#${string}`];

/**
 * Tonlama. Her pikselin parlaklığı `stops` renk geçişinde bir renge eşlenir (gradient map) ve
 * özgün renkle `originalMix` oranında karıştırılır. Önce parlaklık %1–%99 aralığına yayılır
 * (normalise): farklı pozlamadaki fotoğraflar birbirine yakın aydınlıkta görünür.
 *
 * En açık durak ile özgün renk payı, tonlanmış fotoğraftaki en açık olası pikseli sınırlar.
 * Fotoğraf üzerindeki koyu katman bu sınıra göre seçilmiştir; photos.test.ts, metinlerin en kötü
 * durumda da WCAG AA kontrastını (4,5:1) sağladığını denetler.
 */
export const PHOTO_TONE = {
  stops: [
    [0, '#0c111a'], // graphite-950
    [0.25, '#232e3c'],
    [0.5, '#6b6461'],
    [0.75, '#c07a48'],
    [1, '#f6d0ad'],
  ] as const satisfies readonly ToneStop[],
  originalMix: 0.25,
  normalise: { lower: 1, upper: 99 },
  /**
   * Pozlama dengeleme: ortalama parlaklığı `target` altında kalan (koyu) fotoğrafların orta
   * tonları gamma eğrisiyle aydınlatılır; üs `minGamma` altına inmez (aşırı soluklaşmasın).
   * Koyu katman altında da sahnenin seçilebilmesi içindir. Açık fotoğraflar değişmez.
   */
  exposure: { target: 0.4, minGamma: 0.65 },
};

/** Ortalama parlaklığa (0–1) göre orta tonları aydınlatma üssü; 1 = değişiklik yok */
export function exposureGamma(
  meanLuma: number,
  { target, minGamma }: { target: number; minGamma: number } = PHOTO_TONE.exposure,
): number {
  if (!(meanLuma > 0) || meanLuma >= target) return 1;
  return Math.max(minGamma, Math.log(target) / Math.log(meanLuma));
}

export type Toner = (r: number, g: number, b: number) => [number, number, number];

/**
 * Piksel tonlayıcı üretir (0–255 aralığında RGB alır ve döndürür). Hazırlama betiği her piksel
 * için çağırır; testler de aynı fonksiyonla en açık olası sonucu hesaplar.
 */
interface ResolvedStop {
  position: number;
  rgb: [number, number, number];
}

export interface TonerOptions {
  /**
   * Orta tonları aydınlatan üs (0 < gamma ≤ 1; 1 = değişiklik yok). Siyah ve beyaz yerinde kalır,
   * yani en açık piksel ve fotoğraf üzerindeki metin kontrastı değişmez.
   */
  gamma?: number;
}

export function createToner(
  tone: typeof PHOTO_TONE = PHOTO_TONE,
  { gamma = 1 }: TonerOptions = {},
): Toner {
  const stops: ResolvedStop[] = tone.stops.map(([position, color]) => ({
    position,
    rgb: hexToRgb(color),
  }));
  if (stops.length < 2) throw new Error('Tonlama için en az iki renk durağı gerekir.');
  const mix = tone.originalMix;

  /** Parlaklığın düştüğü iki komşu durak */
  const segment = (luma: number): [ResolvedStop, ResolvedStop] => {
    for (let index = 1; index < stops.length; index += 1) {
      const upper = stops[index] as ResolvedStop;
      if (luma <= upper.position || index === stops.length - 1) {
        return [stops[index - 1] as ResolvedStop, upper];
      }
    }
    throw new Error('Tonlama durakları sıralı olmalıdır.');
  };

  return (r, g, b) => {
    const luma = ((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255) ** gamma;
    const [lower, upper] = segment(luma);
    const span = upper.position - lower.position;
    const t = span > 0 ? Math.min(1, Math.max(0, (luma - lower.position) / span)) : 0;
    const tint = (channel: 0 | 1 | 2, original: number) =>
      Math.round(
        (lower.rgb[channel] + (upper.rgb[channel] - lower.rgb[channel]) * t) * (1 - mix) +
          original * mix,
      );
    return [tint(0, r), tint(1, g), tint(2, b)];
  };
}
