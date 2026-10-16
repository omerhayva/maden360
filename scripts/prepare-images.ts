/**
 * Arka plan fotoğraflarını hazırlar:
 *   assets/gorseller/<anahtar>.jpg  →  public/gorseller/<anahtar>-<genişlik>.avif / .webp
 *
 * Kullanım (PowerShell, macOS ve Linux'ta aynı):
 *   npm run generate:images                 → tüm görseller
 *   npm run generate:images -- fuar market  → yalnızca adı verilen görseller
 *
 * Adımlar: parlaklık %1–%99 aralığına yayılır → site renklerine göre tonlanır
 * (src/config/photos.ts → PHOTO_TONE) → her genişlik için AVIF ve WebP olarak kaydedilir.
 * Kaynak .jpg, .jpeg, .png veya .webp olabilir ve en az 1376 px genişliğinde olmalıdır.
 * Üretilen dosyalar depoya eklenir; site derlemesi bu betiği çalıştırmaz.
 */
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import {
  createToner,
  exposureGamma,
  PHOTO_FORMATS,
  PHOTO_KEYS,
  PHOTO_OUTPUT_DIR,
  PHOTO_SOURCE_DIR,
  PHOTO_TONE,
  PHOTO_WIDTHS,
  type PhotoFormat,
  type PhotoKey,
} from '../src/config/photos';

/** Sıkıştırma kalitesi: fotoğraflar koyu katmanın altında kaldığı için orta kalite yeterlidir */
const QUALITY: Record<PhotoFormat, number> = { avif: 52, webp: 74 };
const SOURCE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_WIDTH = Math.max(...PHOTO_WIDTHS);

const isPhotoKey = (value: string): value is PhotoKey => (PHOTO_KEYS as string[]).includes(value);

function findSource(key: PhotoKey): string | undefined {
  return SOURCE_EXTENSIONS.map((extension) => join(PHOTO_SOURCE_DIR, `${key}${extension}`)).find(
    (path) => existsSync(path),
  );
}

const kb = (path: string) => `${(statSync(path).size / 1024).toFixed(0)} KB`.padStart(7);

async function main(): Promise<void> {
  const requested = process.argv.slice(2);
  const unknown = requested.filter((name) => !isPhotoKey(name));
  if (unknown.length > 0) {
    console.error(
      `Bilinmeyen görsel: ${unknown.join(', ')}\nGeçerli adlar: ${PHOTO_KEYS.join(', ')}`,
    );
    process.exit(1);
  }
  const keys = requested.length > 0 ? requested.filter(isPhotoKey) : PHOTO_KEYS;

  mkdirSync(PHOTO_OUTPUT_DIR, { recursive: true });
  let failures = 0;

  for (const key of keys) {
    const source = findSource(key);
    if (!source) {
      console.error(`✖ ${key}: kaynak bulunamadı (${PHOTO_SOURCE_DIR}/${key}.jpg)`);
      failures += 1;
      continue;
    }

    const metadata = await sharp(source).metadata();
    // EXIF yönü 5–8 olan (dik çekilmiş) fotoğraflarda genişlik ve yükseklik yer değiştirir
    const width = (metadata.orientation ?? 1) >= 5 ? metadata.height : metadata.width;
    if (!width || width < MAX_WIDTH) {
      console.error(
        `✖ ${key}: kaynak ${width ?? '?'} px genişliğinde; en az ${MAX_WIDTH} px gerekir.`,
      );
      failures += 1;
      continue;
    }

    // Parlaklık tam boyutta bir kez yayılır; her genişlik önce küçültülür, sonra tonlanır.
    // Böylece küçültmenin keskin kenarlarda yaptığı taşmalar da tonlamayla sınırlanır.
    const normalised = await sharp(source)
      .rotate()
      .resize({ width: MAX_WIDTH })
      .removeAlpha()
      .normalise(PHOTO_TONE.normalise)
      .raw()
      .toBuffer({ resolveWithObject: true });
    const base = sharp(normalised.data, {
      raw: { width: normalised.info.width, height: normalised.info.height, channels: 3 },
    });

    // Koyu fotoğrafların orta tonlarını aydınlat (src/config/photos.ts → PHOTO_TONE.exposure)
    let lumaSum = 0;
    for (let index = 0; index + 2 < normalised.data.length; index += 3) {
      lumaSum +=
        0.2126 * (normalised.data[index] ?? 0) +
        0.7152 * (normalised.data[index + 1] ?? 0) +
        0.0722 * (normalised.data[index + 2] ?? 0);
    }
    const meanLuma = lumaSum / 255 / (normalised.data.length / 3);
    const gamma = exposureGamma(meanLuma);
    const toner = createToner(PHOTO_TONE, { gamma });

    const written: string[] = [];
    for (const outputWidth of PHOTO_WIDTHS) {
      const { data, info } = await base
        .clone()
        .resize({ width: outputWidth })
        .raw()
        .toBuffer({ resolveWithObject: true });
      for (let index = 0; index + 2 < data.length; index += 3) {
        const [r, g, b] = toner(data[index] ?? 0, data[index + 1] ?? 0, data[index + 2] ?? 0);
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
      }
      const toned = sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } });
      for (const format of PHOTO_FORMATS) {
        const file = join(PHOTO_OUTPUT_DIR, `${key}-${outputWidth}.${format}`);
        const encoded =
          format === 'avif'
            ? toned.clone().avif({ quality: QUALITY.avif, effort: 4 })
            : toned.clone().webp({ quality: QUALITY.webp, effort: 6 });
        await encoded.toFile(file);
        written.push(`${outputWidth}.${format} ${kb(file)}`);
      }
    }
    console.log(`✔ ${key.padEnd(13)} γ ${gamma.toFixed(2)} · ${written.join(' · ')}`);
  }

  // Tüm görseller hazırlandığında artık kullanılmayan eski çıktıları sil (ör. kaldırılan görsel)
  if (requested.length === 0 && failures === 0) {
    const expected = new Set(
      PHOTO_KEYS.flatMap((key) =>
        PHOTO_WIDTHS.flatMap((width) => PHOTO_FORMATS.map((format) => `${key}-${width}.${format}`)),
      ),
    );
    for (const file of readdirSync(PHOTO_OUTPUT_DIR)) {
      if (!expected.has(file)) {
        unlinkSync(join(PHOTO_OUTPUT_DIR, file));
        console.log(`– ${file} silindi (artık kullanılmıyor)`);
      }
    }
  }

  if (failures > 0) {
    console.error(`\n${failures} görsel hazırlanamadı.`);
    process.exit(1);
  }
  console.log(`\nGörseller ${PHOTO_OUTPUT_DIR}/ klasörüne yazıldı.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
