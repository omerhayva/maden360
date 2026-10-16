# Arayüz rehberi: renkler, fotoğraflar, düğmeler ve form alanları

Sitenin renkleri tek bir palette, fotoğrafları tek bir hazırlama düzeninde tanımlıdır; tüm düğmeler,
düğme görünümlü bağlantılar, çipler, form alanları ve bağlantı kutucukları da tek bir sınıf
üreticiden gelir. Amaç: her sayfada aynı görünüm ve davranış, dokunmatik ekranda rahat kullanım,
klavye ve ekran okuyucu erişimi, fotoğraf üzerinde bile okunur yazılar.

| Dosya | İçerik |
|---|---|
| `src/components/ui/styles.ts` | Sınıf üreticiler: `buttonClasses`, `iconButtonClasses`, `chipClasses`, `inputClasses`, `textLinkClasses`, `cx` |
| `src/components/ui/Button.tsx` | `Button`, `ButtonLink`, `IconButton`, `IconLink`, `ButtonGroup` |
| `src/components/ui/Select.tsx` | Ortak görünümlü açılır liste |
| `src/components/ui/TextLink.tsx` | `ArrowLink` ("Tümünü gör →" bağlantıları) |
| `src/components/ui/card.ts` | `cardFrame`, `cardBase`, `stretchedLink`, `tileClasses`, `iconTile` |
| `src/components/listings/MobileActionBar.tsx` | İlan sayfalarında mobil eylem çubuğu |
| `src/app/globals.css` | `ui-hover` ve `ui-active` durum varyantları, mobil eylem çubuğu kuralları |
| `src/components/ui/styles.test.ts` | Sınıf çakışması, dokunma alanı ve elle yazılmış düğme stili denetimleri |
| `src/app/globals.css` → `@theme` | Renk paleti (grafit, bakır, taş/kum ölçekleri), `heading-accent`, `contour-bg` |
| `src/components/ui/palette.test.ts` | Paletin kontrast çiftleri ve elle yazılmış marka renkleri |
| `src/config/photos.ts` | Fotoğraf listesi, odak noktaları, genişlikler, tonlama ayarları |
| `src/components/ui/Photo.tsx` | `<picture>` ile AVIF/WebP dekoratif fotoğraf |
| `src/components/layout/PageHeader.tsx` | Açık başlık veya `photo` verilirse fotoğraflı koyu başlık |
| `scripts/prepare-images.ts` | `npm run generate:images`: kaynakları tonlar, `public/gorseller/` altına yazar |
| `scripts/generate-brand-assets.mjs` | `npm run generate:brand`: logo simgeleri ve paylaşım görseli |
| `assets/gorseller/` | Fotoğraf kaynakları ve [değiştirme rehberi](../assets/gorseller/README.md) |
| `src/config/photos.test.ts` | Üretilen dosyalar, tonlama ve fotoğraf üzerindeki yazıların en kötü durum kontrastı |

## Renk paleti

Tek tema vardır; tema seçici ve karanlık mod yoktur. 16 Ekim 2026'da renkler daha canlı ve zengin
olacak şekilde yenilendi: grafit hafif çelik mavisi alt tonlu ve daha derin, bakır daha doygun, taş
ölçeği soğuk gri yerine sıcak kum tonu. Ölçekler OKLCH renk uzayında tasarlandı ve
`src/app/globals.css` → `@theme` içindedir; Tailwind sınıfları (`bg-copper-600`, `text-graphite-700`
…) bu değerleri kullanır.

| Belirteç | Önceki | Yeni | Kullanım |
|---|---|---|---|
| `graphite-950` | `#14171a` | `#0c111a` | Üst bilgi, altbilgi, koyu bölümler, tarayıcı tema rengi |
| `graphite-900` | `#1c2025` | `#161d27` | Koyu kartlar |
| `graphite-500` | `#646d79` | `#656e7b` | Küçük bilgi metni (açık zeminde kullanılabilecek en açık gri) |
| `copper-400` | `#df8446` | `#f08c46` | Koyu zeminde vurgu (logodaki "360", etkin menü çizgisi) |
| `copper-500` | `#c96a2b` | `#db6b19` | Odak çerçevesi, logo zemini |
| `copper-600` | `#a9541f` | `#b64e00` | Birincil düğme |
| `copper-700` | `#87421b` | `#933d08` | Bağlantılar, açık zeminde vurgu metni |
| `stone-100` | `#f5f5f4` | `#f6f2ec` | Sayfa zemini (sıcak kum) |
| `stone-200` | `#e7e5e4` | `#e8e3da` | Kenarlıklar |

Kontrast (WCAG 2.2 AA): beyaz / `copper-600` 5,2:1 · `copper-700` / beyaz 7,2:1, / `stone-100` 6,5:1
· `copper-400` / `graphite-950` 7,7:1 · `graphite-500` / `stone-100` 4,6:1 · odak çerçevesi
`copper-500`: beyaz 3,4:1, `stone-100` 3,1:1, `graphite-950` 5,5:1. `palette.test.ts` 25 renk
çiftini, ölçeklerin açıktan koyuya sıralı olduğunu ve kontur deseninin çizgisi üzerindeki metinleri
denetler.

Renk değerini elle yazmak gerektiğinde (logo SVG'si, simgeler, `manifest`, tema rengi, kritik hata
ekranı, marka görseli betiği) paletteki değeri kullanın; test, paletin dışındaki değeri yakalar.
Logo veya palet değişirse `npm run generate:brand` simgeleri ve paylaşım görselini yeniden üretir.

### Vurgu öğeleri

- **Bölüm başlığı çizgisi** (`heading-accent`): sayfa düzeyindeki bölüm başlıklarının üstünde kısa
  bakır çizgi. `SectionHeading` bunu kendiliğinden ekler; el yazımı bölüm başlıklarında
  (`Tüm ilanlar`, `Açık pozisyonlar`…) sınıfı ekleyin. İlan ayrıntı sayfalarındaki içerik alt
  başlıklarında (İş tanımı, Ürünler…) kullanılmaz.
- **Bakır ince çizgi**: üst bilginin altında ve altbilginin üstünde, kenarlara doğru kaybolan çizgi.
- **Kontur deseni** (`contour-bg`): "Güven ilkelerimiz" bölümü ve altbilgide eş yükselti çizgileri.
- **Simge kutuları** (`iconTile`): grafit geçişli zemin üzerinde bakır simge.
- Hareket eklenmedi: geçişler, gölgeler ve desenler durağandır.

## Fotoğraflı başlıklar

| Yer | Fotoğraf (`photos` anahtarı) |
|---|---|
| Ana sayfa girişi | `ana-sayfa` |
| Ana sayfadaki üç bölüm kartının üst şeridi | `fuar`, `is-ilanlari`, `market` |
| Sanal Fuar ve salon sayfaları | `fuar` |
| İş İlanları | `is-ilanlari` |
| Aday Profilleri | `is-arayanlar` |
| Market ve kategori sayfaları | `market` |
| İlan ver ve başvuru formu sayfaları | `ilan-ver` |
| Sosyal medya paylaşım görseli (`public/og-image.jpg`) | `ana-sayfa` |

Arama, kurumsal sayfalar (Hakkımızda, İletişim…), ilan ayrıntı sayfaları ve iletişim talebi açık
başlıkta kalır: bu sayfalarda içerik ön plandadır.

**Nasıl çalışır?**

1. Kaynaklar `assets/gorseller/<anahtar>.jpg` (en az 1376 px genişlik). Mevcut altı fotoğraf yapay
   zekâ ile üretildi; gerçek bir yeri, firmayı veya kişiyi göstermez.
2. `npm run generate:images` her kaynak için: parlaklığı %1–%99 aralığına yayar → koyu
   fotoğrafların orta tonlarını gamma eğrisiyle aydınlatır (üs en az 0,65; siyah ve beyaz yerinde
   kalır) → 640, 960 ve 1376 px'e küçültür → tonlar (parlaklık → renk eşlemesi: gölgeler grafit,
   açık tonlar bakır; özgün rengin %25'i korunur) → AVIF ve WebP olarak `public/gorseller/` altına
   yazar. Üretilen dosyalar depoya eklenir; site derlemesi betiği çalıştırmaz.
3. `Photo` bileşeni `<picture>` ile AVIF (destekleyen tarayıcılar) ve WebP sunar; `sizes` ile
   tarayıcı ekrana uygun dosyayı seçer. Fotoğraflar dekoratiftir (`alt=""`). Başlık fotoğrafı
   sayfanın en büyük öğesi olduğundan öncelikle (`fetchpriority="high"`), kart şeritleri tembel
   yüklenir ve en fazla 960 px dosya kullanır.
4. Fotoğrafın üstünde koyu katman (`photoScrimClasses`) vardır: 1280 px altında her yerde %75
   grafit; 1280 px ve üstünde soldan sağa %90 → %75 (genişliğin %65'inde) → %25. Metin sütunu en
   fazla 48rem olduğundan geniş ekranda fotoğraf sağ tarafta açılır.

**Fotoğraf üzerindeki yazılar** yalnızca beyaz, `graphite-100`, `graphite-200` ve `copper-300`
olabilir; `graphite-300` ve daha koyusu en kötü durumda 4,5:1'i sağlamaz. `photos.test.ts`, metnin
hemen arkasında hem tonlamanın üretebileceği en açık pikselin hem de 36 dosyanın her birindeki
gerçek en açık pikselin olduğunu varsayarak kontrastı hesaplar. Ölçülen en kötü değerler: beyaz
9,2:1, `graphite-100` 7,8:1, `graphite-200` 6,5:1, `copper-300` 5,0:1. Düğmeler kendi dolgulu
zeminlerinde durur; fotoğraflı başlıktaki ikincil düğme `variant="inverse"`, sekmeler ve "formlar
yakında açılacak" notu koyu zemine göre tasarlanmıştır (`SectionNav`).

**Boyutlar:** 1376 px AVIF 41–79 KB. Ana sayfa (giriş + üç kart şeridi): telefonda (3× ekran)
170 KB, dizüstünde 114 KB; bölüm sayfaları tek fotoğraf, ≈ 80 KB. Sayfalara JavaScript eklenmedi.

**Fotoğraf değiştirmek veya yeni sayfaya eklemek:**
[assets/gorseller/README.md](../assets/gorseller/README.md).

## Araştırılan açık kaynak tasarım sistemleri

16 Ekim 2026'da GitHub'daki şu depoların düğme bileşenleri ve kullanım kuralları incelendi. Kod
kopyalanmadı; yaklaşımlar Tailwind CSS 4 ile yeniden yazıldı.

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
`tailwind-merge` yerine yaklaşık 200 satırlık `styles.ts` yazıldı: `tailwind-merge` 3.7 tek başına
~9 KB (gzip) eklerken `styles.ts` ~1,5 KB'tır. Sınıf çakışmalarını çalışma anında çözmek yerine
çakışmayı baştan önleyen kurallar ve bunu denetleyen testler kullanılır (aşağıda). Değişiklik sonrası
sayfa başına JavaScript artışı 2–3 KB'tır (gzip).

## Düğme türleri

| Tür (`variant`) | Görünüm | Ne zaman? | Örnek |
|---|---|---|---|
| `primary` | Bakır zemin, beyaz metin, koyu alt kenar | Sayfanın ana eylemi; bir ekranda tercihen bir tane | İlan ver, İlanı gönder, Ara, Başvur |
| `secondary` | Beyaz zemin, gri kenarlık, alt kenar | Ana eylemin yanındaki eylemler; boş liste durumundaki eylemler | Salonları gezin, Metni kopyala, Bize ulaşın |
| `ghost` | Saydam, bakır metin | Düşük öncelikli eylemler | Süzgeçleri temizle, Yeni başvuru |
| `subtle` | Saydam, gri | Alan içindeki küçük simge düğmeleri | Aramayı temizle (×) |
| `inverse` | Koyu zeminde çerçeveli | Koyu bölümde ikincil eylem | Ana sayfa: Stand açın veya ilan verin |
| `ghost-inverse` | Koyu zeminde saydam | Üst menüdeki simgeler | Menü, Ara |

Tehlikeli eylem (`danger`) türü bilinçli olarak yoktur: sitede silme gibi geri alınamaz bir eylem
bulunmuyor. GOV.UK'nin önerisiyle, böyle bir eylem eklenirse onay adımıyla birlikte tasarlanmalıdır.

## Boyutlar ve dokunma alanı

| Boyut (`size`) | Yükseklik | Kullanım |
|---|---|---|
| `sm` | 40 px (dokunmatik ekranda 44 px) | Dar alanlar: üst menüdeki "İlan ver", "Süzgeçleri temizle" |
| `md` | 44 px | Varsayılan |
| `lg` | 48 px | Form gönderme, ilan sayfasında başvuru, mobil eylem çubuğu |

- Dokunmatik ekranda (`pointer: coarse`) tüm düğmeler, çipler ve simge düğmeleri en az **44 × 44 px**
  olur (WCAG 2.5.5 hedefi; AA düzeyindeki alt sınır 24 px).
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
| Klavye odağı | 3 px bakır çerçeve, 2 px boşlukla | `:focus-visible`; fareyle tıklamada görünmez |
| Devre dışı | Soluk, "yasak" imleci, üzerine gelme ve basma tepkisi yok | Kullanmaktan kaçının: kullanıcı nedenini anlamaz. Bunun yerine düğmeyi gösterip hatayı açıklayın |
| Yükleniyor | Dönen simge, "Gönderiliyor…" metni, ilerleme imleci | `loading` özelliği: `aria-disabled` (odak düğmede kalır), tıklama ve Enter ile yeniden gönderim yok sayılır, ekran okuyucuya duyurulur |

Hareket: yalnızca 100 ms'lik renk geçişi ve yükleniyor simgesinin dönmesi vardır; basılı duruma geçiş
anlıktır. İşletim sisteminde "hareketi azalt" açıksa geçişler ve dönme durur (`globals.css`).

Çift gönderim: başvuru formu, gönderim sürerken ikinci gönderimi hem düğme düzeyinde (`loading`) hem
form işleyicisinde (anlık bayrak) engeller.

## Bağlantı mı, düğme mi?

- Başka bir sayfaya, adrese veya aynı sayfadaki bir bölüme götürüyorsa **bağlantıdır**: `ButtonLink`
  (düğme görünümlü) veya `ArrowLink` / metin bağlantısı.
- Bir işlem yapıyorsa (form gönderme, kopyalama, panel açma, süzgeç temizleme) **düğmedir**: `Button`
  veya `IconButton`.
- Görünüm aynı olabilir; HTML öğesi işleve uygun olmalıdır. `ButtonLink`, site içi adreslerde Next.js
  bağlantısı, diğerlerinde (`#`, `mailto:`, `tel:`, `https:`) düz `<a>` üretir.
- Metin içindeki bağlantılar her zaman altı çizilidir; bölüm sonlarındaki bağlantılar `ArrowLink` ile
  oklu ve 44 px yüksekliğinde verilir.

## Etiket yazımı

- Eylemi anlatan kısa ifade, mümkünse fiille: "İlan ver", "İlanı gönder", "Süzgeçleri temizle",
  "Satıcıyla iletişime geç".
- Cümle düzeni: yalnızca ilk harf büyük; tamamı büyük harfli düğme yok.
- "Tıklayın", "Buraya", "Devam" gibi bağlamsız etiketler yok. Ekran okuyucu için bağlam gerekiyorsa
  görünmez ek kullanılır: "Telefonla başvur: 0312 …".
- Simge tek başına anlam taşımaz: `IconButton` ve `IconLink` için `label` zorunludur (erişilebilir ad
  ve fareyle üzerine gelince ipucu).
- Durum etiketle değil öznitelikle bildirilir: süzgeç sekmelerinde `aria-pressed`, menü ve "Süzgeçler"
  düğmesinde `aria-expanded`. Menü düğmesinin adı her zaman "Menü"dür.

## Kullanım

```tsx
import { Plus, Send, X, ArrowDown } from 'lucide-react';
import { Button, ButtonGroup, ButtonLink, IconButton } from '@/components/ui/Button';

// Sayfanın ana eylemi
<ButtonLink href={routes.postListing()} icon={Plus}>İlan ver</ButtonLink>

// Birincil + ikincil eylem (mobilde alt alta)
<ButtonGroup>
  <ButtonLink href={routes.postListing('fuar-standi')} icon={Plus}>Stand açın</ButtonLink>
  <ButtonLink href="#salonlar" variant="secondary" iconEnd={ArrowDown}>Salonları gezin</ButtonLink>
</ButtonGroup>

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
  kenar boşluğu (`mt-4`, `-ml-2`) veya bir duruma bağlı varyant (`aria-expanded:bg-graphite-800`).
- Görünürlük (`hidden`), konum (`absolute`), renk, yükseklik ve iç boşluk değişiklikleri bir
  kapsayıcıya verilir:

  ```tsx
  <div className="hidden lg:block">
    <ButtonLink href={routes.postListing()} size="sm" icon={Plus}>İlan ver</ButtonLink>
  </div>
  ```

- Yeni bir görünüm gerekiyorsa `styles.ts`'e yeni bir tür veya seçenek eklenir.
- `styles.test.ts` tüm tür/boyut/genişlik bileşimlerini çakışmaya karşı denetler; ayrıca bileşenlerde
  elle yazılmış birincil düğme rengi (`hover:bg-copper-700`) bulunursa test başarısız olur.

## Form alanları

- Metin kutusu ve çok satırlı alan: `inputClasses({ size, tone, invalid })`; açılır liste: `Select`.
- Odakta kenarlık bakıra döner ve kalınlaşır, çevresinde hafif bir hale belirir. Yüksek kontrast
  modunda gölgeler çizilmediği için saydam dış çizgi odak çerçevesi olarak görünür.
- Hatalı alan: kırmızı kenarlık + `aria-invalid` + alanın altındaki hata metni; hata yalnızca renkle
  bildirilmez.
- Yükseklikler: başvuru formları 48 px, liste süzgeçleri 44 px, büyük arama kutuları 56 px.
- Yazı boyutu 16 px'ten küçük değildir (iOS, odaklanınca sayfayı yakınlaştırmaz).
- Açılır listede tarayıcının küçük oku yerine ortak ok simgesi kullanılır; yüksek kontrast modunda
  tarayıcının kendi görünümüne dönülür.

## Çipler

`chipClasses({ selected, tone })`: popüler aramalar, salon ve kategori bağlantıları, arama sayfasındaki
tür sekmeleri. Sekme olarak kullanılan çipler `<button aria-pressed>`'dir; seçili çip yalnızca renkle
değil koyu zeminle de ayrışır. Koyu zeminde `tone: 'inverse'` kullanılır.

## Kartlar ve kutucuklar

- **Kart** (`cardFrame`, `cardBase`): başlıktaki bağlantı `stretchedLink` ile kartın tamamını kaplar;
  kart içindeki diğer bağlantılar ayrıca tıklanabilir kalır.
- **Kutucuk** (`tileClasses({ surface, align, size })`): kutunun tamamı tek bir bağlantıdır (kategori,
  salon, bölüm kısayolları); sağdaki ok yönlendirme olduğunu gösterir.
- Üzerine gelince kenarlık bakıra döner ve gölge hafifçe derinleşir; klavye odağında kartın tamamı
  çerçevelenir.

## Mobil eylem çubuğu ve mobil süzgeçler

- **Eylem çubuğu** (`MobileActionBar`): iş ilanı, market ilanı, fuar standı ve aday profili
  sayfalarında, mobilde ekranın altında sabit durur ve tek dokunuşla başvuru/iletişim kutusuna iner.
  Geniş ekranda (≥ 1024 px) kutu yan sütunda göründüğü için gizlenir. Süresi dolan ilanda iletişim
  kutularıyla birlikte gizlenir. Klavyeyle odaklanan öğeler çubuğun arkasında kalmaz
  (`scroll-padding-bottom`, WCAG 2.4.11); altbilgi çubuk yüksekliği kadar uzar.
- **Süzgeçler**: liste sayfalarındaki açılır listeler mobilde "Süzgeçler" düğmesinin arkasında durur;
  düğme etkin süzgeç sayısını gösterir. Bağlantıda süzgeç varsa (ör. `?il=Ankara`) panel açık başlar.

## Yeni arayüz öğesi eklerken kontrol listesi

- [ ] Ortak bileşenler kullanıldı: `Button`, `ButtonLink`, `IconButton`, `ArrowLink`, `Select`,
      `inputClasses`, `chipClasses`, `tileClasses`.
- [ ] Ekranda tek birincil düğme var; diğerleri `secondary` veya `ghost`.
- [ ] Etiket eylemi anlatıyor; simge düğmesinde `label` verildi.
- [ ] Bağlantı ile düğme doğru seçildi (götürüyor mu, yapıyor mu?).
- [ ] Dokunmatik ekranda ≥ 44 px; 390 px genişlikte yatay taşma yok.
- [ ] Klavyeyle ulaşılıyor ve odak görünüyor.
- [ ] Renkler paletten (`graphite`, `copper`, `stone`); elle renk değeri yazılmadı.
- [ ] Fotoğraflı başlığa konan öğeler koyu zemin için (beyaz, `graphite-100/200`, `copper-300`
      yazı; `inverse` düğme).
- [ ] Yeni veya değişen fotoğraf için `npm run generate:images` çalıştırıldı, kaynak ve
      `public/gorseller/` birlikte commit edildi.
- [ ] `npm run check` geçti (`styles.test.ts`, `palette.test.ts`, `photos.test.ts` dahil).

## Doğrulama (16 Ekim 2026)

- `styles.test.ts`: 175 test (tüm bileşimlerde sınıf çakışması yok, dokunma alanı, yüksek kontrast
  kenarlığı, bileşenlerde elle yazılmış düğme rengi yok).
- Tarayıcı testleri (390 px dokunmatik ve 1366 px), 27 yeni denetim: 18 sayfada yatay taşma 0 px;
  mobilde ölçülen 34 düğme ve çipin tamamı ≥ 44 × 44 px; basılı durum ve klavye odağı; "Süzgeçler"
  düğmesi; arama kutusunu temizleme; mobil eylem çubuğu (dört ilan türü); menü düğmesi; "Metni
  kopyala" geri bildirimi. Önceki 33 etkileşim testi de geçti.
- axe-core: önizlemede 26 sayfa × 2 genişlik, üretim derlemesinde boş liste durumları ve kapalı
  formlar dahil 14 sayfa × 2 genişlik; ihlal yok.
- Başsız test tarayıcısında fare bulunmadığından (`hover: none`), üzerine gelme durumu CSS kuralı
  üzerinden doğrulandı (`@media (hover: hover)` içinde, devre dışı düğmeler hariç).

### Tema ve fotoğraf güncellemesi (16 Ekim 2026)

- Testler: 10 dosyada 388 test (`palette.test.ts` 30, `photos.test.ts` 65, `styles.test.ts` 178).
- Tarayıcı: önizleme derlemesinde 14 sayfa, üretim derlemesinde 5 sayfa, 390 ve 1366 px; yatay
  taşma 0 px.
- axe-core: önizlemede 15 sayfa × 2 genişlik, üretimde (kapalı formlar, boş listeler) 11 sayfa × 2
  genişlik; ihlal yok. axe, fotoğraf veya desen üzerindeki metnin kontrastını ölçemez ("incomplete"
  sayar); bu durum `photos.test.ts` ve `palette.test.ts` ile denetlenir.
- İndirilen görseller (ağ kaydı): ana sayfa telefonda 4 AVIF dosyası, 170 KB; dizüstünde 114 KB;
  Sanal Fuar 1 dosya, 80 KB; arama sayfası 0.
- Sayfa başına JavaScript değişmedi (ana sayfa 181,4 KB, liste sayfaları 191,6 KB gzip).
