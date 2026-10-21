# Maden360 — Madencilik Sektör Ağı

Türkiye madencilik sektörü için **sanal fuar**, **iş ilanları** ve **market** sunan statik bir web
platformu. Tedarikçi ve hizmet firmaları stand açar; işverenler ve iş arayanlar ilan verir; ekipman,
yedek parça, hizmet, cevher ve saha ilanları yayımlanır. Üyelik yoktur: başvurular formla alınır ve
editör onayıyla yayımlanır.

> Çalışma adı "Maden360"tır. Ad, alan adı ve iletişim adresi `src/config/site.ts` dosyasından
> tek noktada değiştirilir.

## Özellikler

- **Sanal Fuar:** 11 salonda tedarikçi ve hizmet firmalarının standları: ürünler, hizmetler, markalar,
  hizmet bölgesi ve iletişim bilgileri.
- **İş İlanları:** işçi arayan işverenlerin ilanları ve iletişim bilgisi yayımlanmayan aday profilleri;
  işverenlerin talepleri editörler aracılığıyla adaya iletilir.
- **Market:** satılık, kiralık ve aranan ekipman, yedek parça, hizmet, cevher ve ürün, saha ve rödövans
  ilanları. Ruhsat, rödövans, cevher ve patlatma hizmeti kategorilerinde resmî metne dayanan yasal notlar
  gösterilir.
- **Moderasyonlu yayın:** başvuru formu → editör kontrolü → yayın. Her ilanın yayın süresi vardır,
  süresi dolan ilan kendiliğinden kalkar; yayın kuralları otomatik doğrulanır
  (bkz. [docs/ilanlar-ve-fuar.md](docs/ilanlar-ve-fuar.md)).
- **Arama:** fuar, iş ve market ilanlarında Türkçe karakter ve eklere duyarlı, tarayıcı içinde çalışan
  arama.
- **SEO ve erişilebilirlik:** özgün başlık/açıklama/kanonik URL, yapılandırılmış veri (JobPosting,
  Organization), site haritası; klavye ve ekran okuyucu desteği, WCAG 2.2 AA kontrast.
- **Ortak arayüz sistemi:** GOV.UK, Primer, shadcn/ui, USWDS ve Radix tasarım sistemleri incelenerek
  hazırlanan düğme, form alanı, çip, panel ve liste bileşenleri; dokunmatik ekranda ≥ 44 px dokunma
  alanı, basılı/odak/yükleniyor durumları, mobilde sabit başvuru çubuğu
  (bkz. [docs/arayuz-rehberi.md](docs/arayuz-rehberi.md)).
- **İlan sitesi tasarımı (22 Ekim 2026):** içerik önde; beyaz ve soğuk gri zemin, koyu bakır vurgu,
  IBM Plex Sans; ilanlar satır satır; Sanal Fuar için harfli salon planı; hazır şablon izleri yok ve
  testle denetleniyor. 10 uzman bakış açısıyla yapılan inceleme, ölçümler ve sizden beklenen bilgiler:
  [docs/uzman-incelemesi.md](docs/uzman-incelemesi.md).
- **Fotoğraflar:** ana sayfa ve bölüm başlıklarında sitenin renklerine göre tonlanmış maden
  fotoğrafları. Fotoğraf üzerindeki yazıların okunurluğu testlerle güvence altındadır; fotoğraflar
  kendi çekimlerinizle tek komutla değiştirilebilir (bkz. [assets/gorseller/README.md](assets/gorseller/README.md)).

> **Önemli:** Fuar, iş ve market bölümlerindeki 18 dosya yalnızca önizlemede görünen **örnek
> içeriktir** (`example: true`). Üretim derlemesinde (`npm run build`) örnek ilanlar yer almaz. İlan
> formları, ilan kuralları ve KVKK aydınlatma metni yayımlanınca açılır.
>
> Bilgi Merkezi, Sözlük ve Hesaplamalar bölümleri 16 Ekim 2026'da kaldırıldı. Gerekçe ve geri getirme
> yolu: [docs/urun-plani.md §12](docs/urun-plani.md#12-kapsam-güncellemesi-bilgi-merkezi-sözlük-ve-hesaplamalar-kaldırıldı).

## Hızlı başlangıç (Windows PowerShell)

Gereksinim: [Node.js 22 LTS](https://nodejs.org) (22.12 veya üzeri) ve Git.

```powershell
node -v                     # v22.12.0 veya üzeri olmalı
git clone https://github.com/omerhayva/maden360.git
cd maden360
npm install
npm run dev                 # http://localhost:3000 — örnek ve taslak ilanlar dahil tüm içerik görünür
```

Komutlar macOS ve Linux'ta da aynıdır.

## Komutlar

| Komut | Ne yapar? |
|---|---|
| `npm run dev` | Geliştirme sunucusu (tüm içerik, uyarı bandıyla) |
| `npm run build` | Üretim derlemesi → `out/` (yalnızca yayımlanmış, süresi dolmamış ilanlar) |
| `npm run build:onizleme` | Önizleme derlemesi (taslak ve örnek ilanlar dahil, arama motorlarına kapalı) |
| `npm start` | `out/` klasörünü yerelde sunar (http://localhost:3000) |
| `npm test` | Birim testleri (içerik ve ilan kuralları, başvuru formları, arama) |
| `npm run content:check` | İçerik doğrulama (şema, yayın ve ilan kuralları, bağlantılar, yasal not atıfları) |
| `npm run site:check` | Derleme sonrası kırık bağlantı ve SEO denetimi |
| `npm run check` | Lint + tip denetimi + testler + içerik doğrulama |
| `npm run new -- market "Başlık"` | Şablondan yeni ilan dosyası: `firma`, `is-ilani`, `aday`, `market` |
| `npm run generate:images` | Fotoğrafları tonlayıp `public/gorseller/` altına AVIF/WebP olarak yazar (`-- market` ile tek görsel) |
| `npm run generate:brand` | Logo simgelerini ve sosyal medya paylaşım görselini yeniden üretir |
| `npm run lint` / `npm run typecheck` / `npm run format` | Kod kalitesi |

Ortam değişkeni ayarlamak için (PowerShell): `$env:SITE_URL="https://www.alanadiniz.com.tr"; npm run build`

## Proje yapısı

```text
content/        Fuar standları, iş ilanları, aday profilleri, market ilanları, sayfalar;
                salon, kategori, meslek ve editör kayıtları
src/app/        Sayfalar ve rotalar (/fuar, /is-ilanlari, /is-arayanlar, /market, /ilan-ver, /ara ...)
src/components  Arayüz bileşenleri
src/lib/        İçerik işleme ve doğrulama, ilan ve başvuru mantığı, arama, SEO
scripts/        Doğrulama, site denetimi, yerel sunucu, ilan dosyası oluşturma
docs/           Belgeler
```

## Belgeler

- [Ürün planı](docs/urun-plani.md) — kapsam ve kapsam güncellemeleri, URL yapısı, veri modeli, fazlar
- [Mimari](docs/mimari.md) — teknik yapı, yayın kuralı, arama, çok dilliliğe hazırlık
- [Arayüz rehberi](docs/arayuz-rehberi.md) — düğme türleri, boyutlar, durumlar, form alanları; araştırılan tasarım sistemleri
- [Sanal Fuar, İş İlanları ve Market](docs/ilanlar-ve-fuar.md) — başvuru akışı, editör onayı, süre dolumu, KVKK ve kaldırma
- [Yayına alma ve geri alma](docs/yayinlama-ve-geri-alma.md) — Cloudflare Pages, GitHub ayarları, geri alma, yedekleme
- [Kabul kriterleri](docs/kabul-kriterleri.md) — kriterlerin karşılanışı ve doğrulanması

## Yayın öncesi yapılacaklar

1. `src/config/site.ts` → `contactEmail` ve `listingsEmail` alanlarını gerçek adreslerle değiştirin.
2. Barındırma hizmetinde `SITE_URL` ortam değişkenini gerçek alan adınızla ayarlayın.
3. `content/kisiler.yaml` dosyasına en az bir ilan editörü (`canModerate: true`) ekleyin.
4. KVKK aydınlatma metnini doldurup hukuki kontrolden geçirin ve ilan kurallarıyla birlikte yayımlayın;
   isterseniz günlük yeniden derleme kancasını kurun
   ([docs/ilanlar-ve-fuar.md](docs/ilanlar-ve-fuar.md#yayına-almadan-önce-bir-kez)).
5. Yayına alma adımları: [docs/yayinlama-ve-geri-alma.md](docs/yayinlama-ve-geri-alma.md).

## Sorumluluk notu

Fuar standları ve ilanlar sahiplerinin beyanıdır. Maden360 alım-satıma, kiralamaya, ruhsat devrine ve
işe alıma taraf değildir; ödeme almaz. Yasal notlar bilgilendirme amaçlıdır ve hukuki danışmanlık
yerine geçmez; mevzuatın güncel ve resmî metni için Resmî Gazete ve mevzuat.gov.tr esas alınır.
