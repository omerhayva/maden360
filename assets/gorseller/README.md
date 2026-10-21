# Arka plan fotoğrafları (kaynak dosyalar)

Bu klasördeki dosyalar sitedeki fotoğrafların **kaynaklarıdır**; site bunları doğrudan kullanmaz.
`npm run generate:images` her kaynağı sitenin renklerine göre tonlar (gölgeler grafit, açık tonlar
bakır) ve `public/gorseller/` klasörüne üç genişlikte (640, 960, 1376 px) AVIF ve WebP kopyalar
yazar. Ayrıntılar: [docs/arayuz-rehberi.md → Fotoğraflı başlıklar](../../docs/arayuz-rehberi.md#fotoğraflı-başlıklar).

| Dosya | Nerede görünür | İçerik |
|---|---|---|
| `ana-sayfa.jpg` | Ana sayfa girişi, sosyal medya paylaşım görseli | Gün batımında açık ocak, rampada maden kamyonu |
| `fuar.jpg` | Sanal Fuar, salon sayfaları | Fuar salonunda sondaj makinesi, mobil kırıcı, ekskavatör |
| `is-ilanlari.jpg` | İş İlanları | Açık ocağı izleyen, baretli ve yelekli iki mühendis (arkadan) |
| `is-arayanlar.jpg` | İş Arayanlar | Lamba odasında baretler ve kask lambaları |
| `market.jpg` | Market, kategori sayfaları | Kırma-eleme tesisi, stok yığınları, yükleyici |
| `ilan-ver.jpg` | İlan ver ve başvuru formu sayfaları | Saha ofisinde baret, tablet, maden planları, karot sandığı |

Mevcut altı fotoğraf **yapay zekâ ile üretilmiştir** (16 Ekim 2026); gerçek bir yeri, firmayı veya
kişiyi göstermez ve lisans gerektirmez. `ilan-ver.jpg` içindeki tabletin ekranı, anlamsız yapay
yazı okunmasın diye bulanıklaştırılmıştır. Gerçek saha fotoğraflarınız olduğunda aşağıdaki adımlarla
değiştirebilirsiniz.

## Kendi fotoğrafınızı kullanmak

1. Fotoğrafı **aynı adla** bu klasöre koyun ve eskisini silin (ör. `market.jpg`). `.jpeg`, `.png`
   veya `.webp` de olur; aynı adla birden fazla dosya bırakmayın.
2. Fotoğraf yatay olmalı ve **en az 1376 px genişliğinde** olmalı (önerilen 1920–2400 px).
   - Geniş ekranda başlık metni solda durur ve fotoğrafın sol tarafı koyulaşır: asıl konu sağ
     yarıda olan kareler en iyi sonucu verir.
   - Telefonda fotoğrafın yalnızca dar bir şeridi görünür. Görünecek yeri
     `src/config/photos.ts` → `focus` değeriyle ayarlayın (ör. `'70% 50%'`: soldan %70, yukarıdan %50).
3. Görselleri üretin (PowerShell, macOS ve Linux'ta aynı komut):

   ```
   npm run generate:images -- market
   ```

   Adı vermeden çalıştırırsanız (`npm run generate:images`) tüm görseller yeniden üretilir.
   Koyu fotoğrafların orta tonları otomatik olarak biraz aydınlatılır; bu, yazıların okunurluğunu
   etkilemez.
4. Ana sayfa fotoğrafını değiştirdiyseniz paylaşım görselini de yenileyin: `npm run generate:brand`
5. `npm run check` çalıştırın. Testler yeni dosyaların varlığını, genişliklerini ve fotoğraf
   üzerindeki yazıların en kötü durumda bile okunur kaldığını (WCAG AA, 4,5:1) denetler.
6. `npm run build:onizleme` ve `npm start` ile http://localhost:3000 adresinde kontrol edin.
   Kaynak dosyayı ve `public/gorseller/` altındaki yeni dosyaları **birlikte** commit edin.

## Fotoğraf seçerken

- Yalnızca kullanma hakkınız olan fotoğrafları kullanın: kendi çekiminiz veya lisansı web sitesinde
  kullanıma açıkça izin veren görseller.
- Tanınabilir kişiler, araç plakaları, firma logoları veya okunabilir belge ve ekranlar varsa izin
  alın ya da bulanıklaştırın (KVKK).
- Kişisel koruyucu donanımı (baret, yelek, gözlük vb.) eksik çalışan veya güvensiz çalışma gösteren
  fotoğraflardan kaçının; sektör sitesi olarak örnek olunmalıdır.
- Patlatma anı, kaza veya acil durum görüntüleri kullanmayın.

## Yeni bir sayfaya fotoğraf eklemek

1. `src/config/photos.ts` → `photos` listesine yeni anahtar ekleyin (ör. `'hakkimizda'`), içeriğini
   ve odak noktasını yazın.
2. Kaynağı bu klasöre `<anahtar>.jpg` adıyla koyun ve `npm run generate:images -- <anahtar>` çalıştırın.
3. Sayfada başlığa `photo` özelliğini verin: `<PageHeader photo="hakkimizda" … />`. Başlığın
   içindeki düğmeler koyu zemin içindir (`variant="inverse"`).
