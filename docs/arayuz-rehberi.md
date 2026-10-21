# Arayüz rehberi: tasarım ilkeleri, renkler, yazı, listeler ve düğmeler

Sitenin renkleri tek bir palette, fotoğrafları tek bir hazırlama düzeninde tanımlıdır; tüm düğmeler,
düğme görünümlü bağlantılar, çipler, form alanları, paneller ve liste satırları da ortak sınıf
üreticilerden gelir. Amaç: her sayfada aynı görünüm ve davranış, telefonda rahat kullanım, klavye ve
ekran okuyucu erişimi, fotoğraf üzerinde bile okunur yazılar.

22 Ekim 2026'da site, "yapay zekâ ile yapıldığı belli" geri bildirimi üzerine yeniden tasarlandı.
Bulgular, ölçümler ve gerekçeler: [uzman-incelemesi.md](uzman-incelemesi.md).

| Dosya | İçerik |
|---|---|
| `src/app/globals.css` → `@theme` | Renk paleti (grafit, bakır, taş ölçekleri), yazı tipi, başlık kesimi, odak çerçevesi, `ui-hover` / `ui-active` varyantları |
| `src/components/ui/styles.ts` | Sınıf üreticiler: `buttonClasses`, `iconButtonClasses`, `chipClasses`, `inputClasses`, `textLinkClasses`, fotoğraf katmanı, `cx` |
| `src/components/ui/card.ts` | `panel`, `listPanel`, `listRow`, `cardFrame`, `cardBase`, `stretchedLink` |
| `src/components/ui/Button.tsx` | `Button`, `ButtonLink`, `IconButton`, `IconLink`, `ButtonGroup` |
| `src/components/ui/TextLink.tsx` | `TextLink` ("Tüm iş ilanları (4)" türü bağlantılar, oksuz) |
| `src/components/ui/SectionHeading.tsx` | Bölüm başlığı ve sağında "Tümü" bağlantısı |
| `src/components/ui/Select.tsx` | Ortak görünümlü açılır liste |
| `src/components/listings/ListingCards.tsx` | İlan satırları (iş ilanı, iş arayan, market ilanı, firma) ve `Facts` bilgi satırı |
| `src/components/listings/FairPlan.tsx` | Sanal Fuar salon planı |
| `src/components/listings/Detail.tsx` | İlan sayfası parçaları: `FactList` (bilgi tablosu), iletişim kutuları, uyarılar |
| `src/components/brand/Logo.tsx` | Çapraz çekiç işareti ve yazı logosu |
| `src/components/layout/PageHeader.tsx` | Açık başlık veya `photo` verilirse fotoğraflı koyu başlık |
| `src/components/listings/MobileActionBar.tsx` | İlan sayfalarında mobil eylem çubuğu |
| `src/config/photos.ts`, `src/components/ui/Photo.tsx` | Fotoğraf listesi, odak noktaları, tonlama; `<picture>` ile AVIF/WebP |
| `scripts/prepare-images.ts` | `npm run generate:images`: fotoğrafları tonlar, `public/gorseller/` altına yazar |
| `scripts/generate-brand-assets.mjs` | `npm run generate:brand`: simgeler ve paylaşım görseli |
| `src/components/ui/styles.test.ts` | Sınıf çakışması, dokunma alanı, form kenarlığı, **şablon izleri** denetimleri |
| `src/components/ui/palette.test.ts` | Paletin kontrast çiftleri, soğuk gri zemin, elle yazılmış marka renkleri |
| `src/config/photos.test.ts` | Üretilen fotoğraflar ve fotoğraf üzerindeki yazıların en kötü durum kontrastı |

## Tasarım ilkeleri

1. **İçerik önde.** Ziyaretçi ilan veya firma aramaya gelir. Ana sayfada arama, "Ne arıyorsunuz?"
   girişleri ve son ilanlar ilk ekranda; bölüm sayfalarında başlık kısa, liste hemen başlar.
   Tanıtım blokları (ilkeler, adım adım anlatımlar) ana sayfada yer almaz.
2. **Görsel yapı bilgi taşır.** Çizgi, numara, etiket ve kenarlık yalnızca bir anlam taşıyorsa
   kullanılır: numaralı liste yalnızca gerçek bir sıra için ("İlan ver" sayfasındaki dört adım),
   salon harfi salonun adıdır, kalın dış çizgi fuar alanının sınırıdır.
3. **Tek akılda kalan öğe.** Cesaret tek bir yerde harcanır: Sanal Fuar salon planı (fuar
   girişindeki kat planı gibi; salon sayfasında "Buradasınız"). Çevresindeki her şey sade kalır.
4. **Liste, kart ızgarası değil.** İlanlar tek bir panelde satır satır listelenir; göz yukarıdan
   aşağı tarar. Kart yalnızca gerçekten ayrı duran içerikte (yan sütun kutuları, ürün ve hizmetler).
5. **Simge yalnızca işlev için:** arama, menü, kapatma, telefon, e-posta, dış bağlantı, uyarı.
   Süs simgesi, simge kutusu ve bağlantıya eklenmiş ok yoktur.
6. **Metin sektörün dilinde, kısa ve somut.** Slogan, zorlama üçleme, "tek yerde", "buluşturun",
   noktalı virgüllü uzun cümle ve uzun tire kullanılmaz; site kendini anlatmaz. Kanıtı olmayan bilgi
   eklenmez (süre, sayı, iddia). Hukuki metinler (ilan kuralları, KVKK) bu kuralın dışındadır.
7. **Boş durum dürüst.** Sıfır sayılar yazılmaz; boş liste tek satırlık açık bir notla anlatılır.

### Kullanılmayan şablon öğeleri

Aşağıdakiler yapay zekâ ile üretilmiş sayfaların ortak izleridir ve sitede kullanılmaz.
`styles.test.ts` → "şablon izleri" testi kaynak kodu tarar ve bunlardan biri eklenirse başarısız olur:

| Kullanılmaz | Yerine |
|---|---|
| Başlık üstünde büyük harfli küçük etiket (`uppercase`, `tracking-wide`) | Etiket yok; gerekiyorsa başlığın altında cümle düzeninde bilgi satırı |
| Degrade, bulanık parlama, dalgalı kontur zemin | Düz zemin; fotoğraf üzerindeki koyu katman tek istisna (işlevsel) |
| Hap biçimli etiket ve düğme (`rounded-full`), iri köşe (`rounded-xl`) | 2–4 px köşe |
| "→" veya ok simgesi eklenmiş bağlantı | Ne açılacağını söyleyen bağlantı metni: "Tüm iş ilanları (4)" |
| Orta noktayla birleştirilmiş bilgi satırı ("A · B · C") | `Facts`: ince dikey çizgiyle ayrılmış parçalar, ya da virgül |
| Kullanıcıya görünen metinde uzun tire (—) | Virgül, iki nokta veya ayrı cümle |
| Başlığın bir sözcüğünü farklı renge boyamak (eski logodaki "360") | Tek renk |

## Renk paleti

Tek tema vardır; tema seçici ve karanlık mod yoktur. Ölçekler OKLCH renk uzayında tasarlandı ve
`src/app/globals.css` → `@theme` içindedir. Zemin beyaz ve soğuk taş grisi, metin grafit, vurgu koyu
bakır. Bakır az kullanılır: bağlantılar, birincil düğme, etkin menü çizgisi, odak çerçevesi ve salon
planındaki harfler. Koyu zemin yalnızca fotoğraflı başlıklarda vardır.

| Belirteç | Değer | Kullanım |
|---|---|---|
| `white` | `#ffffff` | Üst bilgi, altbilgi, paneller, liste satırları |
| `stone-100` | `#f3f5f7` | Sayfa zemini (soğuk taş grisi; 22 Ekim'e kadar krem `#f6f2ec`) |
| `stone-200` / `stone-300` | `#e5e8ec` / `#d5d8dd` | Satır ayırıcıları / panel kenarlıkları |
| `graphite-950` … `graphite-700` | `#0c111a` … `#39424f` | Başlıklar ve gövde metni |
| `graphite-600` / `graphite-500` | `#4d5663` / `#656e7b` | İkincil metin / küçük bilgi metni (açık zeminde en açık gri) |
| `graphite-500` | `#656e7b` | Form alanı kenarlığı |
| `copper-700` | `#933d08` | Birincil düğme, bağlantılar, odak çerçevesi, logo işareti, salon harfleri |
| `copper-800` / `copper-900` | `#75300b` / `#5d270d` | Birincil düğme: üzerine gelince / basılıyken |
| `copper-300` | `#f9b07a` | Fotoğraflı başlıkta odak çerçevesi; salon planında bulunulan salonun harfi |

Kontrast (WCAG 2.2 AA): beyaz / `copper-700` 7,2:1 · `copper-700` / `stone-100` 6,6:1 ·
`graphite-500` / `stone-100` 4,7:1 · form kenarlığı `graphite-500` / beyaz 5,2:1 (WCAG 1.4.11) ·
odak çerçevesi `copper-700` / beyaz 7,2:1, fotoğraflı başlıkta `copper-300` / `graphite-950` 10,4:1.
`palette.test.ts` 29 çifti, ölçeklerin açıktan koyuya sıralı olduğunu ve zeminin krem değil soğuk gri
olduğunu denetler.

Renk değerini elle yazmak gerektiğinde (simge SVG'si, `manifest`, tema rengi, kritik hata ekranı, marka
görseli betiği) paletteki değeri kullanın; test, paletin dışındaki değeri yakalar. Logo işareti
`currentColor` ile boyanır (`text-copper-700`). Logo veya palet değişirse `npm run generate:brand`
simgeleri ve paylaşım görselini yeniden üretir.

## Yazı tipi ve tipografi

- **IBM Plex Sans** (değişken; ağırlık 100–700, genişlik %75–100), `@fontsource-variable/ibm-plex-sans`
  ile siteyle birlikte sunulur. Mühendislik belgeleri için tasarlanmış bir ailedir; yapay zekâ
  araçlarının varsayılanı olan Inter, Geist, DM Sans gibi aileler bilinçli olarak seçilmedi. Türkçe
  metin için indirilen dosyalar 109,6 KB (Inter 130,2 KB idi).
- **Başlıklar** yarı dar kesimde (`font-stretch: 87.5%`, `globals.css`), yarı kalın (600); harf
  aralığı daraltılmaz. **Gövde** normal genişlikte, 400. Salon harfleri dar kesimde (%75).
- Sayılar (fiyat, ücret, sayaçlar, tarih) `tabular-nums` ile hizalanır. Küçük veri etiketleri için
  ayrı eş aralıklı yazı tipi kullanılmaz (ilan numarası da dahil).
- Fiyatlar ilan sitelerindeki gibi yazılır: "4.750.000 TL", "210 USD/ton", "70.000–90.000 TL net,
  aylık", fiyatsız ilanda "Fiyat sorunuz" (`src/lib/listings/format.ts`).

## Fotoğraflı başlıklar

| Yer | Fotoğraf (`photos` anahtarı) |
|---|---|
| Ana sayfa girişi | `ana-sayfa` |
| Sanal Fuar ve salon sayfaları | `fuar` |
| İş İlanları | `is-ilanlari` |
| İş Arayanlar | `is-arayanlar` |
| Market ve kategori sayfaları | `market` |
| İlan ver ve başvuru formu sayfaları | `ilan-ver` |
| Sosyal medya paylaşım görseli (`public/og-image.jpg`) | `ana-sayfa` |

Arama, kurumsal sayfalar (Hakkımızda, İletişim…), ilan ayrıntı sayfaları ve iletişim talebi açık
başlıkta kalır. Ana sayfadaki bölüm kartları ve onların fotoğraf şeritleri 22 Ekim'de kaldırıldı.

Başlıklar kısadır (telefonda yaklaşık 300 px): yol gösterici, başlık, bir iki cümlelik açıklama ve en
fazla bir birincil eylem. Başlığın üstüne etiket konmaz.

**Nasıl çalışır?**

1. Kaynaklar `assets/gorseller/<anahtar>.jpg` (en az 1376 px genişlik). Mevcut altı fotoğraf yapay
   zekâ ile üretildi; gerçek bir yeri, firmayı veya kişiyi göstermez.
2. `npm run generate:images` her kaynak için parlaklığı yayar, koyu fotoğrafların orta tonlarını
   açar, 640, 960 ve 1376 px'e küçültür, tonlar (gölgeler grafit, açık tonlar bakır; özgün rengin %25'i
   korunur) ve AVIF ile WebP olarak `public/gorseller/` altına yazar. Üretilen dosyalar depoya eklenir.
3. `Photo` bileşeni `<picture>` ile AVIF ve WebP sunar; fotoğraflar dekoratiftir (`alt=""`) ve
   başlık fotoğrafı öncelikle yüklenir (`fetchpriority="high"`).
4. Fotoğrafın üstünde koyu katman (`photoScrimClasses`) vardır: 1280 px altında %75 grafit; 1280 px ve
   üstünde soldan sağa %90 → %75 → %25.

**Fotoğraf üzerindeki yazılar** yalnızca beyaz, `graphite-100`, `graphite-200` ve `copper-300`
olabilir. `photos.test.ts`, tonlamanın üretebileceği en açık piksel ve 36 dosyanın her birindeki
gerçek en açık piksel için kontrastı hesaplar (en kötü durumda beyaz 9,2:1, `copper-300` 5,0:1).
Fotoğraflı başlıktaki ikincil düğme `variant="inverse"`, iş ilanları sekmeleri ve "formlar yakında
açılacak" notu koyu zemine göre tasarlanmıştır (`SectionNav`).

**Boyutlar:** ana sayfa telefonda (3× ekran) 50,5 KB fotoğraf indirir (önce 170 KB), bölüm sayfaları
tek fotoğraf, yaklaşık 60–80 KB.

**Fotoğraf değiştirmek veya yeni sayfaya eklemek:**
[assets/gorseller/README.md](../assets/gorseller/README.md).

## Listeler, paneller ve kartlar

- **Panel** (`panel`): beyaz zemin, 1 px `stone-300` kenarlık, 2 px köşe, gölge yok.
- **Liste paneli** (`listPanel`) ve **liste satırı** (`listRow`): ilanlar, firmalar, arama sonuçları,
  "İlan ver" seçenekleri. Satırın tamamı başlıktaki bağlantıyla tıklanır (`stretchedLink`); üzerine
  gelince zemin hafifçe koyulaşır ve başlığın altı çizilir; klavye odağında satır çerçevelenir.
- **İlan satırı düzeni** (`ListingCards.tsx`): solda başlık ve bilgiler; sağda en çok bakılan değer
  (ücret, fiyat, il). Telefonda bu değer başlığın altına iner. Bilgi parçaları `Facts` ile ince dikey
  çizgiyle ayrılır. Satır kaydığında yeni satırın başındaki çizgi kırpılarak gizlenir.
- **Bilgi tablosu** (`FactList`): ilan sayfalarında, teknik çizimlerdeki antet gibi ince çizgilerle
  ayrılmış hücreler; küçük etiket üstte, değer altta. Son satırda boş hücre kalmaz.
- **Kart** (`cardFrame`, `cardBase`): yalnızca ayrı duran içerikte (ör. firma sayfasında ürün ve
  hizmetler). Üzerine gelince kenarlık koyulaşır.
- **Dizin listesi**: market kategorileri gibi kısa bağlantı listeleri; alt çizgiyle ayrılmış satırlar,
  sağda sayı (sıfırsa sayı yazılmaz).
- **Salon planı** (`FairPlan`): ana sayfada, Sanal Fuar'da ve salon sayfalarında. Hücreler arasındaki
  çizgiler duvar, kalın dış çizgi fuar alanının sınırıdır. Son hücre "Fuaye"dir ve son sırayı
  doldurur. Salon sayfasında o salon koyu zeminde ve "Buradasınız" notuyla gösterilir
  (`aria-current="page"`). Telefonda harf solda, ad sağda; geniş ekranda alt alta.

## Araştırılan açık kaynak tasarım sistemleri

16 Ekim 2026'da GitHub'daki şu depoların düğme bileşenleri ve kullanım kuralları incelendi. Kod
kopyalanmadı; yaklaşımlar Tailwind CSS 4 ile yeniden yazıldı. 22 Ekim'deki yeniden tasarımın
dayanakları için bkz. [uzman-incelemesi.md](uzman-incelemesi.md) (Anthropic frontend-design rehberi,
blader/humanizer).

| Kaynak | İncelenen dosya | Maden360'a alınan karar |
|---|---|---|
| [shadcn-ui/ui](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/button.tsx) | `button.tsx` | Tür (variant) ve boyut (size) ayrımı; tek bir sınıf üretici; simge boyutunun düğme boyutundan gelmesi (`[&_svg]:size-4`) |
| [alphagov/govuk-frontend](https://github.com/alphagov/govuk-frontend/tree/main/packages/govuk-frontend/src/govuk/components/button) | `_index.scss`, `button.mjs` | "Basılabilir" görünüm: 2 px koyu alt kenar, basınca 2 px iniş; iniş sırasında üst kenara yapılan tıklama boşa gitmesin diye `::before` ile genişletilen tıklama alanı; yüksek kontrast modunda görünen saydam kenarlık; çift gönderim koruması |
| [alphagov/govuk-design-system](https://github.com/alphagov/govuk-design-system/blob/main/src/components/button/index.md) | `button/index.md` | Kullanım kuralları: eylemi anlatan, cümle düzeninde etiket; bir sayfada tek birincil düğme; ikincil düğmeyi az kullanma; düğme grubu; devre dışı düğmeden kaçınma; yavaş bağlantıda yükleniyor geri bildirimi |
| [primer/react](https://github.com/primer/react/tree/main/packages/react/src/Button) | `ButtonBase.tsx`, `ButtonBase.module.css` | Yükleniyor durumu: `disabled` yerine `aria-disabled` (odak kaybolmaz), tıklama yok sayılır, durum canlı bölgeyle duyurulur; blok genişlik; önde ve arkada simge |
| [uswds/uswds](https://github.com/uswds/uswds/blob/develop/packages/usa-button/src/styles/_usa-button.scss) | `_usa-button.scss` | Üzerine gelme ve basılı durum için ayrı (giderek koyulaşan) tonlar; mobilde tam genişlik; `forced-colors` modunda kenarlık |
| [radix-ui/themes](https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/components/_internal/base-button.css) | `base-button.css` | Üzerine gelme stillerinin yalnızca fareli cihazlarda uygulanması (dokunmatik ekranda "takılı kalan hover" olmaz); dokunmatikte basılı durum geri bildirimi |
| [w3c/aria-practices](https://github.com/w3c/aria-practices/blob/main/content/patterns/button/button-pattern.html) | Button pattern | Bağlantı ile düğme ayrımı; geçişli düğmede (`aria-pressed`) etiketin durumla değişmemesi; açılır paneli kontrol eden düğmede `aria-expanded` |

**Neden yeni bağımlılık eklenmedi?** shadcn/ui'nin kullandığı `class-variance-authority` ve
`tailwind-merge` yerine kısa bir `styles.ts` yazıldı: `tailwind-merge` 3.7 tek başına ~9 KB (gzip)
eklerken `styles.ts` ~1,5 KB'tır. Sınıf çakışmalarını çalışma anında çözmek yerine çakışmayı baştan
önleyen kurallar ve bunu denetleyen testler kullanılır (aşağıda).

## Düğme türleri

| Tür (`variant`) | Görünüm | Ne zaman? | Örnek |
|---|---|---|---|
| `primary` | Koyu bakır zemin, beyaz metin, koyu alt kenar | Sayfanın ana eylemi; bir ekranda tercihen bir tane | İlan ver, İlanı gönder, Ara, Başvur |
| `secondary` | Beyaz zemin, gri kenarlık (`graphite-400`), alt kenar | Ana eylemin yanındaki eylemler; boş liste durumundaki eylemler | Metni kopyala, Bize ulaşın, Bize yazın |
| `ghost` | Saydam, bakır metin | Düşük öncelikli eylemler | Süzgeçleri temizle, Yeni başvuru |
| `subtle` | Saydam, gri | Simge düğmeleri: üst bilgideki Ara ve Menü, arama kutusunu temizle | Menü, Ara, × |
| `inverse` | Koyu yarı saydam zemin, beyaz çerçeve | Fotoğraflı başlıkta ikincil eylem | İş arıyorum, profil oluştur |
| `ghost-inverse` | Koyu zeminde saydam | Koyu zeminde simge düğmesi (şu an kullanılmıyor) | |

Tehlikeli eylem (`danger`) türü bilinçli olarak yoktur: sitede silme gibi geri alınamaz bir eylem
bulunmuyor. GOV.UK'nin önerisiyle, böyle bir eylem eklenirse onay adımıyla birlikte tasarlanmalıdır.

## Boyutlar ve dokunma alanı

| Boyut (`size`) | Yükseklik | Kullanım |
|---|---|---|
| `sm` | 40 px (dokunmatik ekranda 44 px) | Dar alanlar: üst menüdeki "İlan ver", "Süzgeçleri temizle" |
| `md` | 44 px | Varsayılan |
| `lg` | 48 px | Form gönderme, ilan sayfasında başvuru, mobil eylem çubuğu |

- Dokunmatik ekranda (`pointer: coarse`) tüm düğmeler, çipler, simge düğmeleri, logo, yol gösterici
  bağlantılar ve bağımsız bağlantılar en az **44 px** yüksekliktedir (WCAG 2.5.5 hedefi; AA düzeyindeki
  alt sınır 24 px). Görünümü büyütmeden yalnızca dokunma alanını genişletmek için negatif dikey boşluk
  kullanılır (`pointer-coarse:-my-2 pointer-coarse:min-h-11`).
- Simge düğmeleri karedir: 40/44/48 px.
- Genişlik (`width`): `auto` (içerik kadar), `full` (tam genişlik), `full-mobile` (mobilde tam
  genişlik, geniş ekranda içerik kadar).
- `ButtonGroup` içindeki düğmeler mobilde alt alta ve tam genişlikte, geniş ekranda yan yana dizilir.

## Durumlar

| Durum | Görünüm | Not |
|---|---|---|
| Dinlenme | Tür rengi; `primary`/`secondary`/`inverse` düğmelerde 2 px koyu alt kenar | Düğme olduğu ilk bakışta anlaşılır |
| Üzerine gelme | Bir ton koyu zemin | Yalnızca fareli cihazlarda (`ui-hover` varyantı); dokunmatik ekranda takılı kalmaz |
| Basılı | İki ton koyu zemin; düğme 2 px iner, alt kenar kaybolur | `ui-active` varyantı; dokunmatik ekranda da çalışır |
| Klavye odağı | 3 px koyu bakır çerçeve, 2 px boşlukla; fotoğraflı başlıkta açık bakır | `:focus-visible`; fareyle tıklamada görünmez |
| Devre dışı | Soluk, "yasak" imleci, üzerine gelme ve basma tepkisi yok | Kullanmaktan kaçının: kullanıcı nedenini anlamaz. Bunun yerine düğmeyi gösterip hatayı açıklayın |
| Yükleniyor | Dönen simge, "Gönderiliyor…" metni, ilerleme imleci | `loading` özelliği: `aria-disabled` (odak düğmede kalır), tıklama ve Enter ile yeniden gönderim yok sayılır, ekran okuyucuya duyurulur |

Hareket: yalnızca 100 ms'lik renk geçişi ve yükleniyor simgesinin dönmesi vardır; basılı duruma geçiş
anlıktır. İşletim sisteminde "hareketi azalt" açıksa geçişler ve dönme durur (`globals.css`).

Çift gönderim: başvuru formu, gönderim sürerken ikinci gönderimi hem düğme düzeyinde (`loading`) hem
form işleyicisinde (anlık bayrak) engeller.

## Bağlantı mı, düğme mi?

- Başka bir sayfaya, adrese veya aynı sayfadaki bir bölüme götürüyorsa **bağlantıdır**: `ButtonLink`
  (düğme görünümlü), `TextLink` veya metin bağlantısı.
- Bir işlem yapıyorsa (form gönderme, kopyalama, panel açma, süzgeç temizleme) **düğmedir**: `Button`
  veya `IconButton`.
- Görünüm aynı olabilir; HTML öğesi işleve uygun olmalıdır. `ButtonLink`, site içi adreslerde Next.js
  bağlantısı, diğerlerinde (`#`, `mailto:`, `tel:`, `https:`) düz `<a>` üretir.
- Metin içindeki bağlantılar her zaman altı çizilidir. Bölüm başlığı yanındaki bağlantılar
  (`TextLink`) ok taşımaz; ne açılacağını ve varsa kayıt sayısını söyler: "Tüm market ilanları (7)".

## Etiket yazımı

- Eylemi anlatan kısa ifade, mümkünse fiille: "İlan ver", "İlanı gönder", "Süzgeçleri temizle",
  "Satıcıyla iletişime geç".
- Cümle düzeni: yalnızca ilk harf büyük; tamamı büyük harfli düğme veya etiket yok.
- "Tıklayın", "Buraya", "Devam" gibi bağlamsız etiketler yok. Ekran okuyucu için bağlam gerekiyorsa
  görünmez ek kullanılır: "Telefonla başvur: 0312 …".
- Simge tek başına anlam taşımaz: `IconButton` ve `IconLink` için `label` zorunludur.
- Durum etiketle değil öznitelikle bildirilir: süzgeç sekmelerinde `aria-pressed`, menü ve "Süzgeçler"
  düğmesinde `aria-expanded`, iş ilanları sekmelerinde ve salon planında `aria-current`. Menü
  düğmesinin adı her zaman "Menü"dür.

## Kullanım

```tsx
import { Plus, Send, X } from 'lucide-react';
import { Button, ButtonGroup, ButtonLink, IconButton } from '@/components/ui/Button';
import { listPanel } from '@/components/ui/card';
import { JobCard } from '@/components/listings/ListingCards';

// Sayfanın ana eylemi
<ButtonLink href={routes.postListing()} icon={Plus}>İlan ver</ButtonLink>

// Fotoğraflı başlıkta birincil + ikincil eylem (mobilde alt alta)
<ButtonGroup>
  <ButtonLink href={routes.postListing('is-ilani')} icon={Plus}>İş ilanı ver</ButtonLink>
  <ButtonLink href={routes.postListing('aday-profili')} variant="inverse">
    İş arıyorum, profil oluştur
  </ButtonLink>
</ButtonGroup>

// İlan listesi: tek panel, satır satır
<ul className={listPanel}>
  {jobs.map((job) => (
    <li key={job.url}><JobCard data={jobCard(job)} /></li>
  ))}
</ul>

// Form gönderme: yükleniyor durumu ve çift gönderim koruması
<Button type="submit" size="lg" width="full-mobile" icon={Send} loading={sending}>
  {sending ? 'Gönderiliyor…' : 'İlanı gönder'}
</Button>

// Simge düğmesi: label zorunlu
<IconButton label="Aramayı temizle" icon={X} variant="subtle" onClick={clear} />
```

Bileşen kullanılamayan yerlerde (ör. `<summary>`) aynı görünüm sınıf üreticiyle verilir:
`className={buttonClasses({ variant: 'secondary' })}`.

### Sınıf çakışması kuralı

Tailwind'de aynı özelliği ayarlayan iki sınıftan (ör. `relative` ve `absolute`) hangisinin geçerli
olacağı yazılış sırasına değil, CSS dosyasındaki sıraya bağlıdır. Bu yüzden:

- Bileşenlere `className` ile yalnızca düğmenin kendi sınıflarıyla çakışmayan yardımcılar verilir:
  kenar boşluğu (`mt-4`, `-ml-2`) veya bir duruma bağlı varyant (`aria-expanded:bg-stone-200`).
- Görünürlük (`hidden`), konum (`absolute`), renk, yükseklik ve iç boşluk değişiklikleri bir
  kapsayıcıya verilir:

  ```tsx
  <div className="hidden lg:block">
    <ButtonLink href={routes.postListing()} size="sm" icon={Plus}>İlan ver</ButtonLink>
  </div>
  ```

- Yeni bir görünüm gerekiyorsa `styles.ts`'e yeni bir tür veya seçenek eklenir.
- `styles.test.ts` tüm tür/boyut/genişlik bileşimlerini çakışmaya karşı denetler; ayrıca bileşenlerde
  elle yazılmış birincil düğme rengi (`ui-hover:bg-copper-800`) bulunursa test başarısız olur.

## Form alanları

- Metin kutusu ve çok satırlı alan: `inputClasses({ size, tone, invalid })`; açılır liste: `Select`.
- Kenarlık `graphite-500`: beyaz zeminde 5,2:1 (WCAG 1.4.11 arayüz sınırları için 3:1 ister). 22
  Ekim'e kadar `graphite-300` (1,97:1) idi. Seçenek kutuları (onay kutulu etiketler) de aynı kenarlığı
  kullanır.
- Odakta kenarlık koyu bakıra döner ve kalınlaşır, çevresinde hafif bir hale belirir. Yüksek kontrast
  modunda gölgeler çizilmediği için saydam dış çizgi odak çerçevesi olarak görünür.
- Hatalı alan: kırmızı kenarlık + `aria-invalid` + alanın altındaki hata metni; hata yalnızca renkle
  bildirilmez.
- Yükseklikler: başvuru formları 48 px, liste süzgeçleri 44 px, büyük arama kutuları 56 px.
- Yazı boyutu 16 px'ten küçük değildir (iOS, odaklanınca sayfayı yakınlaştırmaz).
- Yer tutucu metinler telefonda kesilmeyecek uzunluktadır (tek satırlık alanda en fazla ~30 karakter).

## Çipler

`chipClasses({ selected, tone })`: arama sayfasındaki tür sekmeleri ve popüler aramalar, firma
sayfasındaki salon bağlantıları. Köşeleri küçüktür (hap biçimi yok). Sekme olarak kullanılan çipler
`<button aria-pressed>`'dir; seçili çip yalnızca renkle değil koyu zeminle de ayrışır. Koyu zeminde
`tone: 'inverse'` kullanılır. Ana sayfadaki "Sık arananlar" çip değil, virgülle ayrılmış metin
bağlantılarıdır.

## Mobil eylem çubuğu ve mobil süzgeçler

- **Eylem çubuğu** (`MobileActionBar`): iş ilanı, market ilanı, fuar standı ve aday profili
  sayfalarında, mobilde ekranın altında sabit durur ve tek dokunuşla başvuru/iletişim kutusuna iner.
  Geniş ekranda (≥ 1024 px) kutu yan sütunda göründüğü için gizlenir. Süresi dolan ilanda iletişim
  kutularıyla birlikte gizlenir. Klavyeyle odaklanan öğeler çubuğun arkasında kalmaz
  (`scroll-padding-bottom`, WCAG 2.4.11); altbilgi çubuk yüksekliği kadar uzar.
- **Süzgeçler**: liste sayfalarındaki açılır listeler mobilde "Süzgeçler" düğmesinin arkasında durur;
  düğme etkin süzgeç sayısını gösterir. Bağlantıda süzgeç varsa (ör. `?il=Ankara`) panel açık başlar.

## Yeni arayüz öğesi eklerken kontrol listesi

- [ ] İçerik önde: yeni öğe ilanları veya firmaları aşağı itiyor mu? Gerekli değilse eklemeyin.
- [ ] Ortak bileşenler kullanıldı: `Button`, `ButtonLink`, `IconButton`, `TextLink`, `Select`,
      `inputClasses`, `chipClasses`, `panel`, `listPanel`, `listRow`, `Facts`.
- [ ] Şablon izi yok: büyük harfli etiket, degrade, parlama, hap biçimi, ok eklenmiş bağlantı, orta
      nokta, uzun tire (`npm test` → "şablon izleri").
- [ ] Simge yalnızca bir işlev için; süs simgesi yok.
- [ ] Metin kısa ve somut; noktalı virgül, slogan ve zorlama üçleme yok; kanıtı olmayan bilgi yok.
- [ ] Ekranda tek birincil düğme var; diğerleri `secondary` veya `ghost`.
- [ ] Etiket eylemi anlatıyor; simge düğmesinde `label` verildi.
- [ ] Bağlantı ile düğme doğru seçildi (götürüyor mu, yapıyor mu?).
- [ ] Dokunmatik ekranda ≥ 44 px; 390 px genişlikte yatay taşma yok; yer tutucu kesilmiyor.
- [ ] Klavyeyle ulaşılıyor ve odak görünüyor.
- [ ] Renkler paletten (`graphite`, `copper`, `stone`); elle renk değeri yazılmadı.
- [ ] Fotoğraflı başlığa konan öğeler koyu zemin için (beyaz, `graphite-100/200`, `copper-300`
      yazı; `inverse` düğme).
- [ ] `npm run check` geçti (`styles.test.ts`, `palette.test.ts`, `photos.test.ts` dahil).

## Doğrulama

### Yeniden tasarım (22 Ekim 2026)

- Testler: 10 dosyada 400 test. `styles.test.ts` yeni "şablon izleri" denetimleri ve form kenarlığı
  testiyle; `palette.test.ts` yeni kontrast çiftleri ve soğuk gri zemin testiyle.
- Tarayıcı, 19 etkileşim denetimi: mobil menü (açma, Escape ile kapatma, odağın düğmeye dönmesi);
  mobil süzgeçler (açma, il süzgeci, adrese yazılma, temizleme); 17 sayfada 390 px'te yatay taşma yok;
  düğme, alan ve bağımsız bağlantılar ≥ 44 px; salon planında "Buradasınız"; ana sayfada dört amaç
  bağlantısı ve "Son iş ilanları"nın ilk ekranda başlaması; "İçeriğe geç" bağlantısı; odak çerçevesi
  rengi (açık ve fotoğraflı zeminde); arama sonucunun duyurulması ve temizleme. Tümü geçti.
- axe-core: önizleme derlemesinde 17 sayfa × 2 genişlik (390 ve 1366 px); ihlal yok. Fotoğraf
  üzerindeki metnin kontrastını axe ölçemez; `photos.test.ts` denetler.
- Üretim derlemesi (ilansız, formlar kapalı): 42 sayfa, site denetimi temiz; ana sayfa boş durumda
  ekran görüntüsüyle kontrol edildi.
- Ölçümler ve bulgular: [uzman-incelemesi.md](uzman-incelemesi.md).

### Önceki doğrulamalar (16 Ekim 2026)

- Düğme sistemi: `styles.test.ts` 175 test; 390 px dokunmatik ve 1366 px'te 27 tarayıcı denetimi;
  axe-core önizlemede 26, üretimde 14 sayfa × 2 genişlik, ihlal yok.
- Tema ve fotoğraflar: 388 test; axe-core önizlemede 15, üretimde 11 sayfa × 2 genişlik, ihlal yok.
- Başsız test tarayıcısında fare bulunmadığından (`hover: none`), üzerine gelme durumu CSS kuralı
  üzerinden doğrulanır (`@media (hover: hover)` içinde, devre dışı düğmeler hariç).
