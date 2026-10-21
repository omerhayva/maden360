# Uzman incelemesi: 10 bakış açısıyla hata taraması (22 Ekim 2026)

**İstek:** "Sitenin yapay zekâ ile yapıldığı çok belli." Sayfa tasarımı değişsin ve güzelleşsin; hatalar
10 uzman bakış açısıyla bulunsun; site kullanıcı gözünden yeniden hazırlansın. Fotoğraflar sorun
değil, kalıyor. Renklerde bakır kalıyor, zemin beyaz ve soğuk gri oluyor.

**Yöntem hakkında açık not:** Bu, on uzmanlık alanının kontrol listeleriyle yapılmış bir masa başı
incelemesidir (sezgisel değerlendirme). Gerçek kişilerle yapılmış bir kullanıcı testi değildir. Gerçek
kullanıcılarla kısa bir test önerisi en sonda.

- **İncelenen:** önizleme derlemesi (örnek ilanlarla) ve üretim derlemesi (ilansız, formlar kapalı),
  17 sayfa, 390 px telefon ve 1366 px dizüstü.
- **Araçlar:** ekran görüntüleri; ziyaretçinin ilk ilana ne kadar kaydırdığını ölçen betik; axe-core;
  kaynak kod taraması (noktalı virgül, uzun tire, orta nokta, büyük harfli etiket); tarayıcıda 19
  etkileşim denetimi.
- **Dayanak:** Anthropic'in tasarım rehberi ([anthropics/skills → frontend-design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md)),
  yapay zekâ ile üretilmiş sayfaların ortak özelliklerini sayar: krem zemin ve kiremit/bakır vurgu,
  koyu zeminde tek parlak vurgu, aynı yuvarlak köşeli kartlara bölünmüş içerik, her başlığın üstünde
  büyük harfli küçük etiket, orta noktayla birleştirilmiş bilgi satırları, "→" eklenmiş bağlantılar.
  Yazı kalıpları için [blader/humanizer](https://github.com/blader/humanizer) (Wikipedia'nın
  "Signs of AI writing" sayfasına dayanır): zorlama üçlemeler, uzun tire, slogan dili, metnin kendisini
  anlatması, süs için kalın yazı. Erişilebilirlik için WCAG 2.2.

## Ölçümler: önce ve sonra

| Ölçüm | Önce | Sonra |
|---|---|---|
| Telefon, ana sayfa: ilk iş ilanına uzaklık | 1.823 px (2,2 ekran) | 821 px (ilk ekranın sonu) |
| Telefon, ana sayfa: işverenin iş arayanlara bağlantısı | yok | 544 px (ilk ekran) |
| Telefon, ana sayfa uzunluğu | 9,5 ekran | 7,1 ekran |
| Telefon, Market: ilk ilan | 2.007 px | 700 px |
| Telefon, İş İlanları: ilk ilan | 1.033 px | 826 px |
| Telefon, Sanal Fuar: ilk firma | 3.113 px | 1.485 px |
| Dizüstü, ana sayfa: ilk ilan | 1.289 px (ekranın altında) | 646 px (ilk ekranda) |
| Dizüstü, Market: ilk ilan | 1.265 px | 717 px |
| Sayfa başına büyük harfli etiket | 3–10 | 0 |
| Ana sayfadaki simge sayısı | 41 | 5 |
| Telefon, ana sayfadaki koyu alan | 2.740 px | 403 px |
| Telefon (3× ekran), ana sayfa fotoğrafları | 170 KB | 50,5 KB |
| Yazı tipi (Türkçe metin için indirilen) | Inter, 130,2 KB | IBM Plex Sans, 109,6 KB |
| CSS (gzip) | 14,6 KB | 13,5 KB |
| JavaScript, ana sayfa (gzip) | 181,4 KB | 181,0 KB |
| axe-core ihlali | 0 | 0 (17 sayfa × 2 genişlik) |

Önem: **Yüksek** ziyaretçiyi doğrudan engelliyor veya siteyi şablon gösteriyor; **Orta** zorlaştırıyor;
**Düşük** küçük pürüz. Durum: **Düzeltildi** veya **Sizde** (yalnızca sizin verebileceğiniz bilgi).

## 1. Kullanılabilirlik uzmanı

| No | Bulgu | Önem | Durum |
|---|---|---|---|
| K1 | İlanlar ilk ekranda yok. Ana sayfada önce büyük tanıtım alanı, üç kart ve ikon kutuları geliyor; ilk iş ilanı telefonda 1.823 px, dizüstünde 1.289 px aşağıda. | Yüksek | Düzeltildi: kısa giriş, "Ne arıyorsunuz?" girişleri, hemen ardından son ilanlar. |
| K2 | İşveren aday profillerini bulamıyor: ana sayfada iş arayanlara bağlantı yok, menüde de yok. | Orta | Düzeltildi: "Eleman arıyorum" girişi, yan sütunda "İş arayanlar" listesi, iş ilanları sayfasında sayılı sekmeler. |
| K3 | Bölüm sayfalarında içerik ikinci, üçüncü ekranda: Sanal Fuar'da 11 salon kutusu, Market'te 10 kategori kutusu ilanlardan önce. | Orta | Düzeltildi: salonlar kat planına dönüştü, market kategorileri ilanların altına indi, başlıklar kısaldı. |
| K4 | Belirsiz bağlantı adları: "Fuarı gezin →", "İlanlara göz atın →", "Market'e gidin →". | Düşük | Düzeltildi: "Tüm iş ilanları (4)" gibi nereye gidildiğini ve kaç kayıt olduğunu söyleyen adlar. |
| K5 | Ana sayfanın sonunda, altbilgiden önce boş bir şerit. | Düşük | Düzeltildi. |
| K6 | 21 kutuda "İlan bekleniyor / Stand bekleniyor". Yayındaki sitede hepsi boş görünüyor; site yarım kalmış gibi. | Orta | Düzeltildi: sıfır sayılar yazılmıyor, boş liste tek satırlık açık bir notla anlatılıyor. |

## 2. Görsel tasarımcı

| No | Bulgu | Önem | Durum |
|---|---|---|---|
| G1 | Hazır şablon görünümü: büyük harfli üst etiketler, başlık üstü bakır çizgiler, degrade ikon kutuları, bulanık bakır parlama, dalgalı kontur zemin, degrade numara daireleri, oklu bağlantılar, orta noktalı bilgi satırları. Anthropic rehberinin saydığı özelliklerin çoğu. | Yüksek | Düzeltildi. `styles.test.ts` içindeki "şablon izleri" testi geri gelmelerini engelliyor. |
| G2 | Renk düzeni krem zemin (#f6f2ec), turuncu bakır (#db6b19) ve lacivert-siyah alanlar: rehberde ilk sırada geçen yapay zekâ paleti. | Yüksek | Düzeltildi: beyaz ve soğuk taş grisi zemin; bakır koyulaştı (#933d08) ve yalnızca bağlantı, ana düğme, etkin menü ve salon harflerinde. |
| G3 | Yazı tipi Inter (yapay zekâ araçlarının varsayılanı); başlıklarda sıkıştırılmış harf aralığı. | Orta | Düzeltildi: IBM Plex Sans; başlıklar yarı dar kesim. |
| G4 | Her şey aynı yuvarlak köşeli, gölgeli beyaz kart; hiyerarşi yok. | Orta | Düzeltildi: ilanlar tek panelde satır satır; küçük köşe, gölge yok. Kart yalnızca ayrı duran içerikte. |
| G5 | Logo: turuncu kare içinde dağ çizgisi, "360" ayrı renkte. | Orta | Düzeltildi: haritalarda maden ocağını gösteren çapraz çekiç işareti, tek renkli yazı. |
| G6 | Sayfada akılda kalan, bu siteye özgü bir öğe yok. | Orta | Düzeltildi: Sanal Fuar salon planı. A–K harfli kat planı; salon sayfasında, fuar haritalarındaki gibi "Buradasınız". |

## 3. Türkçe metin editörü

| No | Bulgu | Önem | Durum |
|---|---|---|---|
| M1 | Slogan ve kalıp ifadeler: "Madenciliğin fuarı, iş ilanları ve marketi", "… tek yerde", "Güven ilkelerimiz", "… için üç bölüm", "Açık pozisyonunuzu … buluşturun", "sektörle paylaşın". | Yüksek | Düzeltildi: "Madencilik sektörünün ilan panosu", "Eleman arayan ocak, tesis ve firmalar için." |
| M2 | Noktalı virgül yoğunluğu: arayüz metinlerinde 25 kadar, görünür içerikte onlarca. Türkçe web metninde nadirdir. | Orta | Düzeltildi: cümleler bölündü. Hukuki metinler (ilan kuralları, KVKK) olduğu gibi bırakıldı. |
| M3 | Uzun tire: "Maden360 — …", "Önizleme … — Taslak", "Gönderilemedi — …". | Düşük | Düzeltildi; testle denetleniyor. |
| M4 | Metnin kendisini anlatması ve başlığı tekrar etmesi: "Market kategorileri / Ekipmandan sahaya, ilanları kategoriye göre inceleyin." | Düşük | Düzeltildi. |
| M5 | Soru kalıbıyla açılan kısa metinler: "İşçi mi arıyorsunuz?", "Tedarikçi misiniz?" | Düşük | Düzeltildi. |
| M6 | Metin içinde süs amaçlı kalın yazı (Hakkımızda, İletişim). | Düşük | Düzeltildi; iki sayfa yalın bir dille yeniden yazıldı. |

## 4. Erişilebilirlik uzmanı

| No | Bulgu | Önem | Durum |
|---|---|---|---|
| E1 | Form alanı kenarlığı beyaz zeminde 1,97:1 (graphite-300). WCAG 1.4.11 arayüz sınırları için 3:1 ister; beyaz formda alanlar zor seçiliyor. | Orta | Düzeltildi: graphite-500, 5,2:1. Test eklendi. |
| E2 | Odak çerçevesi (copper-500) krem zeminde 3,07:1, sınırda. | Düşük | Düzeltildi: copper-700 (beyazda 7,2:1, gri zeminde 6,6:1); fotoğraflı başlıkta copper-300 (10,4:1). |
| E3 | Telefonda logo bağlantısı 28–36 px, yol gösterici bağlantılar 28 px, market ilanındaki kategori bağlantısı 20 px. WCAG 2.5.8'in 24 px asgarisini karşılıyor ama sitenin 44 px dokunma kuralının altında. | Düşük | Düzeltildi: dokunmatik ekranda 44 px, görünüm aynı. |
| E4 | axe-core ihlali önce de sonra da 0. Fotoğraf üzerindeki metni axe ölçemiyor; `photos.test.ts` denetliyor. | Bilgi | Korundu. |

## 5. Mobil ve performans uzmanı

| No | Bulgu | Önem | Durum |
|---|---|---|---|
| P1 | Telefonda ana sayfa 9,5 ekran; ilk ekranı tamamen tanıtım alanı kaplıyor. | Yüksek | Düzeltildi: 7,1 ekran; ilk ekranda arama, dört giriş ve ilk ilanın başı. |
| P2 | Ana sayfa telefonda 170 KB fotoğraf indiriyor (giriş ve üç dekoratif kart şeridi). | Orta | Düzeltildi: kart şeritleri kalktı, 50,5 KB. Bölüm başlıklarındaki fotoğraflar duruyor. |
| P3 | Telefonda kesilen yer tutucular: "Ör. Maden Mühendisi (Açık Ocak Planl…", "Meslek, makine, firma veya i…". | Düşük | Düzeltildi. |
| P4 | JavaScript bu tür statik bir site için yüksek (ana sayfa 181 KB gzip); Next.js çalışma zamanından geliyor. | Düşük | Açık: ayrı bir iş, bu güncellemede değişmedi. |

## 6. Maden mühendisi (sektör uzmanı)

| No | Bulgu | Önem | Durum |
|---|---|---|---|
| S1 | Fiyat yazımı "$210 / ton", "₺85.000 / takım". İlan sitelerinde "210 USD/ton", "85.000 TL" yazılır. | Orta | Düzeltildi; ücretler de "70.000–90.000 TL net, aylık". |
| S2 | "Sanal Fuar" adı ilk kez gelen biri için belirsiz (bir etkinlik mi?). | Orta | Düzeltildi: salon planı ve "Tedarikçi arıyorum" girişi ne olduğunu gösteriyor. |
| S3 | Meslek adları ve terimler doğru (daimi nezaretçi, ateşleyici, rödövans, IV(c) grubu, karotlu sondaj); ruhsat ve rödövans notları mevzuata dayanıyor. | Bilgi | Değişiklik gerekmedi. |
| S4 | Salon ve kategori açıklamalarında birleşik sözcüklerde "–" (kaynak–rezerv, harita–ölçüm). | Düşük | Düzeltildi: kısa çizgi. |

## 7. İşveren ve insan kaynakları uzmanı

| No | Bulgu | Önem | Durum |
|---|---|---|---|
| I1 | Aday profillerine yol yok (K2). | Orta | Düzeltildi. |
| I2 | İlan verme süreci ana sayfada tanıtım bloğu olarak anlatılıyor; ilan veren bunu "İlan ver" sayfasında arar. | Orta | Düzeltildi: "İlan ver" sayfasında numaralı dört adım; ana sayfada kısa bir kutu ve doğrudan form bağlantıları. |
| I3 | Yayındaki sitede formlar kapalıyken (ilan kuralları ve KVKK metni yayımlanmadan) "İlan ver" kapalı bir forma götürüyor. | Düşük | Düzeltildi: ana sayfa kutusu "İlan verme yakında açılıyor" diyor ve "Bize yazın" sunuyor. Kalıcı çözüm iki metnin yayımlanması (Sizde). |

## 8. İş arayan (operatör, mühendis)

| No | Bulgu | Önem | Durum |
|---|---|---|---|
| A1 | Telefonda iş ilanları görünmüyor (K1). | Yüksek | Düzeltildi. |
| A2 | Yan haklar (servis, yemek, lojman) listede görünmüyor, yalnızca ilan sayfasında. Saha çalışanı için karar verdiren bilgi. | Orta | Düzeltildi: liste satırında "Yan haklar: Servis, Yemek, Lojman"; ücret satırın sağında. |
| A3 | Meslek adı başlığın üstünde büyük harflerle tekrar ediliyor ("İŞ MAKİNESİ OPERATÖRÜ"). | Düşük | Düzeltildi: ilan sayfasında "Meslek: …" satırı. |

## 9. Ekipman alıcısı ve satıcısı

| No | Bulgu | Önem | Durum |
|---|---|---|---|
| B1 | Market kartlarında fiyat, il, model yılı ve çalışma saati dağınık; fotoğrafsız ilanda süs simgesi kutusu. | Orta | Düzeltildi: başlık ile fiyat aynı hizada; tür etiketi, kategori ve il bir satırda; yıl, saat ve durum ayrı satırda. |
| B2 | "Fiyat için iletişime geçin" uzun, fiyat sütununda yer kaplıyor. | Düşük | Düzeltildi: "Fiyat sorunuz". |
| B3 | Güvenli alışveriş uyarısı ("Ürünü görmeden kapora göndermeyin") ve ilan bildirme bağlantısı var. | Bilgi | Korundu. |

## 10. Güven ve güvenlik uzmanı (dolandırıcılık, KVKK)

| No | Bulgu | Önem | Durum |
|---|---|---|---|
| T1 | Gerçek kurum bilgisi yok: işletme unvanı, adres, telefon, gerçek alan adı ve e-posta (şu an `.example`). "Bu site kimin?" sorusunun cevabı olmadan hiçbir tasarım güven vermez. | Yüksek | Sizde |
| T2 | Hakkımızda kimin yaptığını anlatmıyor, yalnızca kuralları sayıyor. | Orta | Metin sadeleşti; kim olduğunuzu anlatan paragraf Sizde. |
| T3 | İş ilanlarında "ücret, depozito, eğitim bedeli isteyen ilanları bildirin", market ilanlarında "kapora göndermeyin" uyarıları, aday bilgilerinin gizliliği ve "İlanı bildirin" bağlantısı var. | Bilgi | Korundu. |
| T4 | İlan kuralları ve KVKK aydınlatma metni hâlâ "incelemede"; yayındaki sitede formlar bu yüzden kapalı. | Orta | Sizde (onay). |

## Kullanıcı gözünden beş görev

| Görev | Önce | Sonra |
|---|---|---|
| Balıkesir'de operatör ilanı arayan saha çalışanı, telefonda | Ana sayfada 2,2 ekran kaydırma, sonra "İş İlanları" kartı | Son ilanlar ilk ekranda; "İş arıyorum" ile tek dokunuşta liste ve il süzgeci |
| Ocağına daimi nezaretçi arayan işveren | Ana sayfada adaylara bağlantı yok; İş İlanları'na girip sekmeyi bulmak gerekiyor | "Eleman arıyorum" ilk ekranda; ilan vermek için yan sütundaki kutu |
| Kırıcı yedek parçası arayan ocak sahibi | Sanal Fuar'da 11 kutu, firmalar 3,7 ekran aşağıda | "Tedarikçi arıyorum", salon planında "I: Yedek Parça", firmalar (iki dokunuş) veya arama |
| İkinci el ekskavatör satan bayi | "İlan ver" ile form | Aynı yol; fiyat listede "4.750.000 TL + KDV" diye görünüyor |
| İlk kez gelen ziyaretçi ("bu site ne?") | Slogan ve üç tanıtım bloğu | Tek cümlelik tanım, altbilgide "taraf değiliz, ödeme almayız" notu, sade Hakkımızda |

## Sizden gerekenler

Bunları yalnızca siz verebilirsiniz. Siteyi en çok "gerçek" gösterecek olan da bunlar:

1. **Kurum bilgileri:** işletme unvanı, adres, telefon, alan adı ve e-posta
   (`src/config/site.ts` ve `content/sayfalar/iletisim.md`).
2. **Hakkımızda'ya kendi ağzınızdan bir paragraf:** kimsiniz, bu siteyi neden kuruyorsunuz.
3. **İlk gerçek ilanlar ve firmalar:** örnek içerik yalnızca önizlemede görünür; yayındaki site
   ilansız açılır.
4. **İlan kuralları ve KVKK metninin onayı:** formlar ancak o zaman açılır.
5. **Fotoğraflar:** sorun olmadığını söylediniz. Yine de kendi sahanızdan birkaç gerçek fotoğraf siteye
   en çok güven katacak şey olur ([değiştirme rehberi](../assets/gorseller/README.md)).

## Önerilen sonraki adım: beş kişiyle kısa test

Bir operatör, bir maden mühendisi, bir ocak sahibi, bir makine satıcısı ve bir insan kaynakları
sorumlusuna yukarıdaki görevleri kendi telefonlarında yaptırın. Nerede durakladıklarını ve neyi
aradıklarını not edin; kişi başı on beş dakika yeterli. Bu inceleme masa başında yapıldı; gerçek
kullanıcıların takıldığı yerleri ancak böyle bir test gösterir.
