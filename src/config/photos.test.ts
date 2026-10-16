import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { photoScrimClasses } from '@/components/ui/styles';
import {
  composite,
  contrastRatio,
  hexToRgb,
  parseThemeColors,
  relativeLuminance,
  type Rgb,
} from '@/lib/color';
import {
  createToner,
  exposureGamma,
  PHOTO_FORMATS,
  PHOTO_KEYS,
  PHOTO_OUTPUT_DIR,
  PHOTO_SOURCE_DIR,
  PHOTO_TONE,
  PHOTO_WIDTHS,
  photoFallbackSrc,
  photos,
  photoSrcSet,
  photoUrl,
} from './photos';

const root = process.cwd();
const theme = parseThemeColors(readFileSync(join(root, 'src/app/globals.css'), 'utf8'));
const themeColor = (name: string): Rgb => {
  if (name === 'white') return [255, 255, 255];
  const hex = theme[name];
  if (!hex) throw new Error(`globals.css içinde --color-${name} tanımlı değil`);
  return hexToRgb(hex);
};
const toner = createToner();

describe('fotoğraf yapılandırması', () => {
  it.each(PHOTO_KEYS)('%s: kaynak dosya var', (key) => {
    const found = ['.jpg', '.jpeg', '.png', '.webp'].some((extension) =>
      existsSync(join(root, PHOTO_SOURCE_DIR, `${key}${extension}`)),
    );
    expect(found).toBe(true);
  });

  it('odak noktaları 0–100% aralığında', () => {
    for (const { focus } of Object.values(photos)) {
      const values = focus.split(' ').map((part) => Number.parseFloat(part));
      expect(values).toHaveLength(2);
      for (const value of values) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
    }
  });

  it('srcset tüm genişlikleri listeler; maxWidth büyük dosyaları dışarıda bırakır', () => {
    expect(photoSrcSet('fuar', 'avif')).toBe(
      '/gorseller/fuar-640.avif 640w, /gorseller/fuar-960.avif 960w, /gorseller/fuar-1376.avif 1376w',
    );
    expect(photoSrcSet('market', 'webp', 960)).toBe(
      '/gorseller/market-640.webp 640w, /gorseller/market-960.webp 960w',
    );
    expect(photoSrcSet('market', 'webp', 100)).toBe('/gorseller/market-640.webp 640w');
    expect(photoFallbackSrc('fuar')).toBe('/gorseller/fuar-960.webp');
    expect(photoFallbackSrc('fuar', 700)).toBe('/gorseller/fuar-640.webp');
  });
});

describe('üretilen dosyalar (npm run generate:images)', () => {
  const expected = PHOTO_KEYS.flatMap((key) =>
    PHOTO_WIDTHS.flatMap((width) => PHOTO_FORMATS.map((format) => photoUrl(key, width, format))),
  ).map((url) => url.replace('/gorseller/', ''));

  it('her görsel için tüm genişlik ve biçimler var, fazladan dosya yok', () => {
    const files = readdirSync(join(root, PHOTO_OUTPUT_DIR)).sort();
    expect(files).toEqual([...expected].sort());
  });

  it.each(PHOTO_KEYS)('%s: dosyaların genişliği adlarındaki değerle aynı', async (key) => {
    for (const width of PHOTO_WIDTHS) {
      for (const format of PHOTO_FORMATS) {
        const file = join(root, PHOTO_OUTPUT_DIR, `${key}-${width}.${format}`);
        const metadata = await sharp(file).metadata();
        expect(metadata.width, `${key}-${width}.${format}`).toBe(width);
      }
    }
  });
});

describe('tonlama', () => {
  const stops = PHOTO_TONE.stops.map(([, hex]) => hexToRgb(hex));

  it('siyah ilk durağa, beyaz son durak ile özgün beyazın karışımına eşlenir', () => {
    const mix = PHOTO_TONE.originalMix;
    const first = stops[0] ?? [0, 0, 0];
    const last = stops.at(-1) ?? [0, 0, 0];
    // Kayan nokta yuvarlaması yüzünden kanal başına ±1 fark olabilir
    const expectClose = (actual: Rgb, expected: Rgb) =>
      actual.forEach((value, channel) =>
        expect(Math.abs(value - (expected[channel] ?? 0))).toBeLessThanOrEqual(1),
      );
    expectClose(toner(0, 0, 0), first.map((value) => value * (1 - mix)) as unknown as Rgb);
    expectClose(
      toner(255, 255, 255),
      last.map((value) => value * (1 - mix) + 255 * mix) as unknown as Rgb,
    );
  });

  it('pozlama dengeleme yalnızca koyu fotoğrafları aydınlatır, sınırlı ölçüde', () => {
    const { target, minGamma } = PHOTO_TONE.exposure;
    expect(exposureGamma(target)).toBe(1);
    expect(exposureGamma(0.6)).toBe(1);
    expect(exposureGamma(0.05)).toBe(minGamma);
    const moderate = exposureGamma(0.3);
    expect(moderate).toBeGreaterThan(minGamma);
    expect(moderate).toBeLessThan(1);
    expect(0.3 ** moderate).toBeCloseTo(target);
    expect(exposureGamma(0)).toBe(1);
  });

  it('aydınlatma en açık pikseli değiştirmez (metin kontrastı korunur)', () => {
    const lifted = createToner(PHOTO_TONE, { gamma: PHOTO_TONE.exposure.minGamma });
    expect(lifted(255, 255, 255)).toEqual(toner(255, 255, 255));
    expect(relativeLuminance(lifted(80, 80, 80))).toBeGreaterThan(
      relativeLuminance(toner(80, 80, 80)),
    );
  });

  it('açıktan koyuya sıralama korunur (gri rampa)', () => {
    let previous = -1;
    for (let value = 0; value <= 255; value += 5) {
      const luminance = relativeLuminance(toner(value, value, value));
      expect(luminance).toBeGreaterThanOrEqual(previous);
      previous = luminance;
    }
  });

  it('son durak her kanalda en açık durak: en açık piksel beyaz girdiden çıkar', () => {
    const last = stops.at(-1) ?? [0, 0, 0];
    for (const stop of stops) {
      stop.forEach((value, channel) => expect(value).toBeLessThanOrEqual(last[channel] ?? 0));
    }
  });
});

/**
 * Fotoğraf üzerindeki metinlerin en kötü durum kontrastı: metnin hemen arkasında tonlanmış
 * fotoğrafın en açık olası pikseli olduğu varsayılır. Koyu katman styles.ts → photoScrimClasses.
 */
describe('fotoğraf üzerindeki metin kontrastı (en kötü durum)', () => {
  const alphaOf = (pattern: RegExp) => {
    const value = pattern.exec(photoScrimClasses)?.[1];
    if (!value) throw new Error(`photoScrimClasses içinde bulunamadı: ${pattern}`);
    return Number(value) / 100;
  };
  const baseAlpha = alphaOf(/(?:^|\s)bg-graphite-950\/(\d+)(?:\s|$)/);
  const fromAlpha = alphaOf(/xl:from-graphite-950\/(\d+)/);
  const viaAlpha = alphaOf(/xl:via-graphite-950\/(\d+)/);
  const viaPosition = alphaOf(/xl:via-(\d+)%/);
  const toAlpha = alphaOf(/xl:to-graphite-950\/(\d+)/);
  /** Yatay konumda (0 = sol, 1 = sağ) katmanın örtücülüğü (xl ve üstü) */
  const wideAlphaAt = (x: number) =>
    x <= viaPosition
      ? fromAlpha + ((viaAlpha - fromAlpha) * x) / viaPosition
      : viaAlpha + ((toAlpha - viaAlpha) * (x - viaPosition)) / (1 - viaPosition);
  /**
   * Metin sütunu en fazla 48rem (max-w-3xl). Kapsayıcı 80rem ve iç boşluğu 2rem olduğundan
   * sütunun sağ ucu xl'nin başladığı 1280 px'te (32 + 768) / 1280 = %62,5'tedir; daha geniş
   * ekranlarda bu oran küçülür.
   */
  const TEXT_EXTENT = (32 + 768) / 1280;
  const overlay = themeColor('graphite-950');
  const brightest = toner(255, 255, 255);
  const TEXT_COLORS = ['white', 'graphite-100', 'graphite-200', 'copper-300'];

  it('geniş ekranda katman soldan sağa açılır ve metin sütununu da kapsar', () => {
    expect(fromAlpha).toBeGreaterThanOrEqual(viaAlpha);
    expect(viaAlpha).toBeGreaterThan(toAlpha);
    expect(wideAlphaAt(0)).toBeCloseTo(fromAlpha);
    expect(wideAlphaAt(1)).toBeCloseTo(toAlpha);
  });

  it.each(TEXT_COLORS)('%s: telefon ve tablette (düz katman) ≥ 4,5:1', (name) => {
    const background = composite(overlay, baseAlpha, brightest);
    expect(contrastRatio(themeColor(name), background)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(TEXT_COLORS)('%s: geniş ekranda metin sütununun sağ ucunda ≥ 4,5:1', (name) => {
    const background = composite(overlay, wideAlphaAt(TEXT_EXTENT), brightest);
    expect(contrastRatio(themeColor(name), background)).toBeGreaterThanOrEqual(4.5);
  });

  /*
   * Kayıplı sıkıştırma (AVIF/WebP renk alt örneklemesi) parlak kenarlarda birkaç pikseli sınırın
   * biraz üzerine çıkarabilir. Asıl ölçüt, her dosyanın gerçek en açık pikselinde metin kontrastıdır.
   */
  const outputs = PHOTO_KEYS.flatMap((key) =>
    PHOTO_WIDTHS.flatMap((width) => PHOTO_FORMATS.map((format) => `${key}-${width}.${format}`)),
  );
  it.each(outputs)('%s: en açık gerçek pikselde de metinler ≥ 4,5:1', async (file) => {
    const { data } = await sharp(join(root, PHOTO_OUTPUT_DIR, file))
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const limit = relativeLuminance(brightest);
    let brightestPixel: Rgb = [0, 0, 0];
    let max = 0;
    let above = 0;
    for (let index = 0; index + 2 < data.length; index += 3) {
      const pixel: Rgb = [data[index] ?? 0, data[index + 1] ?? 0, data[index + 2] ?? 0];
      const luminance = relativeLuminance(pixel);
      if (luminance > limit) above += 1;
      if (luminance > max) {
        max = luminance;
        brightestPixel = pixel;
      }
    }
    // Tonlanmamış veya bozuk bir dosyada çok sayıda piksel sınırı aşar
    expect(above / (data.length / 3)).toBeLessThan(0.001);
    const alpha = Math.min(baseAlpha, wideAlphaAt(TEXT_EXTENT));
    for (const name of TEXT_COLORS) {
      const background = composite(overlay, alpha, brightestPixel);
      expect(contrastRatio(themeColor(name), background), name).toBeGreaterThanOrEqual(4.5);
    }
  });
});
