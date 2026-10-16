# Kabul kriterleri ve doğrulama

Ürün planındaki dokuz kabul kriterinin nasıl karşılandığı ve nasıl doğrulanacağı. Bilgi Merkezi, Sözlük
ve Hesaplamalar 16 Ekim 2026'da kaldırıldığı için 3. ve 5. kriterler kapsam dışında kaldı; 4. ve 6.
kriterler kalan bölümlere uyarlandı ([urun-plani.md §12](urun-plani.md#12-kapsam-güncellemesi-bilgi-merkezi-sözlük-ve-hesaplamalar-kaldırıldı)).

| # | Kriter | Nasıl karşılanıyor? | Doğrulama |
|---|---|---|---|
| 1 | Ana sayfa ve tüm temel sayfalar hatasız açılır | Tüm sayfalar derleme sırasında statik üretilir; derleme hatası olan sayfa yayına çıkamaz. Hata sayfaları: `not-found.tsx`, `error.tsx`, `global-error.tsx` | `npm run build` başarılı; `npm run site:check` tüm HTML sayfalarını tarar |
| 2 | Yerleşim telefonda ve masaüstünde çalışır | Mobil öncelikli Tailwind düzeni; tek sütunlu formlar; tablolar kendi içinde kayar; dokunmatik ekranda tüm düğme ve çipler ≥ 44 × 44 px; mobilde katlanan süzgeçler ve ilan sayfalarında sabit başvuru/iletişim çubuğu ([arayuz-rehberi.md](arayuz-rehberi.md)) | 390 px ve 1366 px genişlikte tarayıcı testleri: yatay taşma 0 px; mobilde düğme ve çip ölçümü; `src/components/ui/styles.test.ts` |
| 3 | ~~İlk dört hesaplayıcı beklenen sonuç testlerini geçer~~ | **Kapsam dışı:** hesaplamalar kaldırıldı | — |
| 4 | Geçersiz ve eksik girdiler ele alınır | Başvuru formlarında zorunlu alan, biçim (e-posta, telefon, web adresi, tarih) ve aralık denetimi; Türkçe sayı okuma (`2.450,50`, `45.000`) ve okunan değerin gösterimi; kategoriye göre zorunlu bölümler; bot tuzağı. Hesaplama kalmadığı için sıfıra bölme durumu yoktur | `src/lib/submissions/submissions.test.ts`, `src/lib/number.test.ts`; tarayıcı testlerinde boş gönderimde hata özeti ve `aria-invalid` |
| 5 | ~~Makalelerde kaynak ve inceleme bilgisi görünür~~ | **Kapsam dışı:** makaleler kaldırıldı. Yerine: her ilanda ilan numarası, yayın, editör onayı ve bitiş tarihi; mevzuata dayanan yasal notlarda resmî metin bağlantısı, madde ve son kontrol tarihi | `npm run content:check` yayımlanan ilanda onaylayan editörü ve tarihleri, yasal notlarda geçerli kontrol tarihini zorunlu tutar |
| 6 | Arama ve kategori gezinmesi çalışır | `/ara` (Türkçe karakter ve ek toleranslı; fuar, iş ve market sonuçları), market kategorileri, fuar salonları, şehir/tür süzgeçleri, bölümler arası bağlantılar (ilan → firma standı) | Tarayıcı etkileşim testleri; `npm run site:check` tüm site içi bağlantıları ve çapaları doğrular |
| 7 | Her içeriğin başlığı, açıklaması ve kanonik URL'si vardır | `pageMetadata` her sayfada title, description, canonical ve Open Graph üretir | `npm run site:check` eksik veya hatalı olanı hata olarak raporlar |
| 8 | Gizli yönetim alanı kimlik doğrulamayla korunur | v1'de site içinde yönetim alanı **yoktur**; yönetim (ilan onayı dahil) GitHub üzerinden yapılır (2FA, yetkiler, zorunlu inceleme). Önizleme ortamı arama motorlarına kapalıdır; erişim Cloudflare Access ile kısıtlanabilir | [yayinlama-ve-geri-alma.md](yayinlama-ve-geri-alma.md#githubda-önerilen-ayarlar) |
| 9 | Yayına alma ve geri alma adımları belgelenmiştir | Cloudflare Pages kurulumu, yayımlama adımları, panelden geri alma ve `git revert` | [yayinlama-ve-geri-alma.md](yayinlama-ve-geri-alma.md) |

## Sektör ağı (fuar, iş ilanları, market) için ek kontroller

| Kontrol | Nasıl karşılanıyor? | Doğrulama |
|---|---|---|
| Yalnızca onaylı ve süresi dolmamış ilanlar yayımlanır | `isListingVisible`: üretimde `published`, süresi geçmemiş, örnek olmayan; tarayıcıda da süre denetimi | `npm test` (görünürlük ve kural testleri); üretim derlemesinde örnek içerik bulunmadığı denetlendi |
| Yayın kuralları zorlanır | Onaylayan editör (`canModerate`), tarihler, süre üst sınırları, kategoriye özel zorunlu alanlar | `npm run content:check`; `src/lib/content/content.test.ts` |
| Aday kişisel verisi yayımlanmaz | İletişim alanı yok; metinde telefon/e-posta/web adresi denetimi; dosya adı = başvuru no; `noindex`, site haritası ve arama dizini dışı | İçerik ve form testleri; tarayıcı testinde arama dizini denetlendi |
| Formlar erişilebilir ve hatalı girdiye dayanıklı | Etiketli alanlar, hata özeti ve odak, `aria-invalid`/`aria-describedby`, Türkçe sayı okuma, bot tuzağı | `src/lib/submissions/submissions.test.ts`; tarayıcı etkileşim testleri; axe |
| Editöre giden taslak dosya şemaya uyar | Her form türü için üretilen taslak, içerik şemalarıyla doğrulanır; yayımlanmayacak bilgiler taslağa yazılmaz | `submissions.test.ts` (gidiş-dönüş testleri) |
| Mevzuata dayanan uyarılar resmî metne bağlıdır | Market kategori notlarında `references`: Resmî Gazete bağlantısı, madde ve son kontrol tarihi (Maden Yönetmeliği md. 79, 97, 101; Maden İSG Yönetmeliği md. 4) | `npm run content:check`: gelecek tarihli kontrol hata, 180 günden eski kontrol uyarı |
| Kaldırılan bölümlere bağlantı kalmaz | `/bilgi`, `/sozluk`, `/hesaplamalar`, `/konular`, `/rehber` rotaları yok; içerikteki bu bağlantılar kırık sayılır | `content.test.ts`; `npm run site:check` |

## Tek komutla tüm kontroller

```powershell
npm run check          # lint + tip denetimi + testler + içerik doğrulama
npm run build          # üretim derlemesi (yalnızca yayımlanmış içerik)
npm run site:check     # derleme çıktısında bağlantı ve SEO denetimi
```

Aynı adımlar GitHub Actions'ta (`.github/workflows/ci.yml`) her çekme isteğinde ve `main` dalına her
gönderimde çalışır; ayrıca önizleme derlemesi (taslaklar dahil) de üretilip denetlenir.

## Erişilebilirlik notları

- Tüm form alanları etiketli; hatalar `aria-describedby` ile alana bağlı, `aria-invalid` işaretli; boş
  veya hatalı gönderimde odak hata özetine taşınır.
- Arama ve ilan süzgeçlerinin sonuç sayısı ekran okuyuculara `role="status"` bölgesiyle duyurulur.
- Görünür odak halkası (bakır, 3 px), "İçeriğe geç" bağlantısı, anlamlı başlık hiyerarşisi.
- Düğmeler: bağlantı/düğme ayrımı; simge düğmelerinde erişilebilir ad; süzgeç sekmelerinde
  `aria-pressed`, menü ve süzgeç panelinde `aria-expanded` (etiket durumla değişmez); gönderim sürerken
  düğme odakta kalır (`aria-disabled`) ve durum ekran okuyucuya duyurulur; Windows yüksek kontrast
  modunda düğme kenarlıkları ve form alanı odakları görünür kalır. Ayrıntılar:
  [arayuz-rehberi.md](arayuz-rehberi.md).
- Renk kontrastları WCAG 2.2 AA'yı karşılar (renk belirteçlerindeki notlara bakın).
- Kapsam güncellemesinden sonra 26 sayfa (ana sayfa, fuar, iş, aday, market, dört başvuru formu hata
  durumuyla, arama, kurumsal ve politika sayfaları, 404) masaüstü ve mobil genişlikte axe-core ile
  denetlenmiş ve ihlal bulunmamıştır.
