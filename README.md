# Maden360 — Türkiye Madencilik Bilgi ve Hesaplama Platformu

Maden mühendisleri, teknikerler, cevher hazırlama çalışanları, öğrenciler ve saha ekipleri için
**kaynaklı teknik rehberler**, **madencilik sözlüğü** ve **formülleri açıklanmış, test edilmiş
hesaplayıcılar** sunan statik bir web platformu. Haber sitesi değildir; dijital bir başvuru kaynağıdır.

> Çalışma adı "Maden360"tır. Ad, alan adı ve iletişim adresi `src/config/site.ts` dosyasından
> tek noktada değiştirilir.

## Özellikler

- **4 hesaplayıcı:** tonaj–hacim–yoğunluk, dekapaj oranı, kütle verimi ve metal kazanımı, vardiya
  üretim performansı. Türkçe sayı biçimi (`2,65`), birim dönüşümü, hatalı girdi ve sıfıra bölme
  koruması, adım adım hesap, yorum, paylaşılabilir bağlantı ve yazdırma.
- **Bilgi merkezi:** 11 kaynaklı makale; numaralı atıflar, inceleme ve düzeltme geçmişi, mevzuat
  içeriklerinde yürürlük ve değişiklik bilgisi.
- **Sözlük:** 41 terim; mevzuattaki resmî tanımlar birebir alıntılanır, İngilizce karşılıklar verilir.
- **Sektör rehberi, konular ve arama:** Türkçe karakter ve eklere duyarlı, tarayıcı içinde çalışan arama.
- **Sektör ağı:** Sanal Fuar (11 salonda tedarikçi ve hizmet firması standları), İş İlanları (işçi
  arayanlar ve iletişim bilgisi yayımlanmayan aday profilleri) ve Market (ekipman, yedek parça, hizmet,
  cevher, saha/rödövans ilanları). Üyelik yok; başvurular formla alınır, editör onayıyla yayımlanır,
  süresi dolunca kendiliğinden kalkar (bkz. [docs/ilanlar-ve-fuar.md](docs/ilanlar-ve-fuar.md)).
- **Yayın iş akışı:** taslak → inceleme → yayın; içerik kuralları otomatik doğrulanır.
- **SEO ve erişilebilirlik:** özgün başlık/açıklama/kanonik URL, yapılandırılmış veri, site haritası;
  klavye ve ekran okuyucu desteği, WCAG 2.2 AA kontrast.

> **Önemli:** Depodaki tüm makale, terim ve hesaplayıcı metinleri yapay zekâ desteğiyle hazırlanmış
> taslaklardır ve `status: review` durumundadır. Bu nedenle üretim derlemesinde (`npm run build`)
> yalnızca güven sayfaları yayımlanır. İçerikler teknik incelemeden geçtikçe yayına alınır
> (bkz. [docs/icerik-is-akisi.md](docs/icerik-is-akisi.md)). Fuar, iş ve market bölümlerindeki
> 18 dosya da yalnızca önizlemede görünen **örnek içeriktir** (`example: true`); ilan formları, ilan
> kuralları ve KVKK aydınlatma metni yayımlanınca açılır.

## Hızlı başlangıç (Windows PowerShell)

Gereksinim: [Node.js 22 LTS](https://nodejs.org) (22.12 veya üzeri) ve Git.

```powershell
node -v                     # v22.12.0 veya üzeri olmalı
git clone https://github.com/omerhayva/maden360.git
cd maden360
npm install
npm run dev                 # http://localhost:3000 — taslaklar dahil tüm içerik görünür
```

Komutlar macOS ve Linux'ta da aynıdır.

## Komutlar

| Komut | Ne yapar? |
|---|---|
| `npm run dev` | Geliştirme sunucusu (tüm içerik, uyarı bandıyla) |
| `npm run build` | Üretim derlemesi → `out/` (yalnızca `published` içerik) |
| `npm run build:onizleme` | Önizleme derlemesi (taslaklar dahil, arama motorlarına kapalı) |
| `npm start` | `out/` klasörünü yerelde sunar (http://localhost:3000) |
| `npm test` | Birim testleri (hesap motorları, içerik kuralları, arama) |
| `npm run content:check` | İçerik doğrulama (şema, kaynak, atıf, yayın kuralları) |
| `npm run site:check` | Derleme sonrası kırık bağlantı ve SEO denetimi |
| `npm run check` | Lint + tip denetimi + testler + içerik doğrulama |
| `npm run new -- makale "Başlık"` | Şablondan yeni içerik: `makale`, `terim`, `firma`, `is-ilani`, `aday`, `market` |
| `npm run lint` / `npm run typecheck` / `npm run format` | Kod kalitesi |

Ortam değişkeni ayarlamak için (PowerShell): `$env:SITE_URL="https://www.alanadiniz.com.tr"; npm run build`

## Proje yapısı

```text
content/        Makaleler, sözlük, hesaplayıcı açıklamaları, sayfalar, kaynak ve kişi kayıtları
src/app/        Sayfalar ve rotalar (/bilgi, /hesaplamalar, /sozluk, /fuar, /is-ilanlari, /market, /ilan-ver ...)
src/calculators Hesap motorları (saf TypeScript) ve testleri
src/components  Arayüz bileşenleri
src/lib/        İçerik işleme, doğrulama, arama, SEO
scripts/        Doğrulama, site denetimi, yerel sunucu, içerik oluşturma
docs/           Belgeler
```

## Belgeler

- [Ürün planı](docs/urun-plani.md) — kapsam, URL yapısı, veri modeli (ER diyagramı), fazlar
- [Mimari](docs/mimari.md) — teknik yapı, yayın kuralı, arama, çok dilliliğe hazırlık
- [İçerik iş akışı](docs/icerik-is-akisi.md) — durumlar, roller, kaynak ekleme, yayımlama kontrol listesi
- [Hesaplayıcı geliştirme](docs/hesaplayici-gelistirme.md) — yeni hesaplayıcı ekleme ve test etme
- [Sanal Fuar, İş İlanları ve Market](docs/ilanlar-ve-fuar.md) — başvuru akışı, editör onayı, süre dolumu, KVKK ve kaldırma
- [Yayına alma ve geri alma](docs/yayinlama-ve-geri-alma.md) — Cloudflare Pages, geri alma, yedekleme
- [Kabul kriterleri](docs/kabul-kriterleri.md) — dokuz kriterin karşılanışı ve doğrulanması

## Yayın öncesi yapılacaklar

1. `src/config/site.ts` → `contactEmail` alanını gerçek adresle değiştirin.
2. Barındırma hizmetinde `SITE_URL` ortam değişkenini gerçek alan adınızla ayarlayın.
3. `content/kisiler.yaml` dosyasına en az bir teknik inceleyici ekleyin.
4. İçerikleri inceleyip yayımlayın; ayrıntılar [docs/yayinlama-ve-geri-alma.md](docs/yayinlama-ve-geri-alma.md).
5. İlan bölümleri için: `listingsEmail` adresini ayarlayın, KVKK aydınlatma metnini doldurup hukuki
   kontrolden geçirin, ilan kurallarıyla birlikte yayımlayın; isterseniz günlük yeniden derleme kancasını
   kurun ([docs/ilanlar-ve-fuar.md](docs/ilanlar-ve-fuar.md#yayına-almadan-önce-bir-kez)).

## Sorumluluk notu

Hesaplama sonuçları ve teknik içerikler bilgilendirme amaçlıdır. Havalandırma, tahkimat, patlatma ve
iş sağlığı ve güvenliği gibi saha kararları; yetkili mühendis değerlendirmesi, ilgili mevzuat ve
standartlar esas alınarak verilmelidir.
