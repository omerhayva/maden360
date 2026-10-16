import { photoFallbackSrc, photos, photoSrcSet, type PhotoKey } from '@/config/photos';

interface PhotoProps {
  name: PhotoKey;
  /** Görselin sayfada kapladığı genişlik (img `sizes`); tarayıcı dosyayı buna göre seçer */
  sizes?: string;
  /**
   * Sayfanın ilk ekranındaki büyük görsel: tembel yüklenmez, öncelikli indirilir (LCP).
   * Sayfa başına en fazla bir görselde kullanılır.
   */
  priority?: boolean;
  /** En büyük dosya genişliği (px); küçük alanlarda gereksiz büyük indirmeyi önler */
  maxWidth?: number;
  className?: string;
}

/**
 * Dekoratif fotoğraf (alt metni boş; ekran okuyucular atlar). AVIF destekleyen tarayıcılar AVIF,
 * diğerleri WebP indirir. next/image yerine düz <img> kullanılır: site statik olarak dışa aktarılır
 * ve görseller derlemeden önce `npm run generate:images` ile hazırlanır (src/config/photos.ts).
 */
export function Photo({
  name,
  sizes = '100vw',
  priority = false,
  maxWidth,
  className,
}: PhotoProps) {
  return (
    <picture>
      <source type="image/avif" srcSet={photoSrcSet(name, 'avif', maxWidth)} sizes={sizes} />
      <img
        src={photoFallbackSrc(name, maxWidth)}
        srcSet={photoSrcSet(name, 'webp', maxWidth)}
        sizes={sizes}
        alt=""
        loading={priority ? undefined : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        className={className}
        style={{ objectPosition: photos[name].focus }}
      />
    </picture>
  );
}
