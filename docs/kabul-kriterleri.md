# Kabul kriterleri ve doğrulama

Ürün planındaki dokuz kabul kriterinin nasıl karşılandığı ve nasıl doğrulanacağı.

| # | Kriter | Nasıl karşılanıyor? | Doğrulama |
|---|---|---|---|
| 1 | Ana sayfa ve tüm temel sayfalar hatasız açılır | Tüm sayfalar derleme sırasında statik üretilir; derleme hatası olan sayfa yayına çıkamaz. Hata sayfaları: `not-found.tsx`, `error.tsx`, `global-error.tsx` | `npm run build` başarılı; `npm run site:check` tüm HTML sayfalarını tarar |
| 2 | Yerleşim telefonda ve masaüstünde çalışır | Mobil öncelikli Tailwind düzeni; tek sütunlu formlar; tablolar ve formüller kendi içinde kayar; ≥ 44 px dokunma alanları | 390 px ve 1366 px genişlikte tarayıcı testleri: yatay taşma 0 px |
| 3 | İlk dört hesaplayıcı beklenen sonuç testlerini geçer | Tonaj–hacim, dekapaj oranı, kütle verimi/kazanım, vardiya performansı; elle doğrulanmış örnekler | `npm test` (hesap motorları için 131 test dahil toplam 218 test) |
| 4 | Geçersiz, eksik ve sıfıra bölme girdileri ele alınır | `readInputs` alan kuralları + her motorda alanlar arası kontroller; `compute` hiçbir girdide istisna fırlatmaz | `npm test` — her motor 400 rastgele/hatalı girdiyle sınanır; arayüzde hata özeti ve ilk hatalı alana odak |
| 5 | Makalelerde kaynak ve inceleme bilgisi görünür | Numaralı atıflar, kaynak listesi (yayıncı, belge ve erişim tarihi, tür), inceleme ve sürüm kutusu, düzeltme geçmişi, mevzuat bilgi kutusu | Herhangi bir makale sayfası; `npm run content:check` yayımlanan içerikte kaynak ve inceleyiciyi zorunlu tutar |
| 6 | Arama, kategori gezinmesi ve sözlük bağlantıları çalışır | `/ara` (Türkçe karakter ve ek toleranslı), `/konular/[slug]`, harf dizinli ve süzgeçli `/sozluk`, içerikler arası ilgili bağlantılar | Tarayıcı testleri; `npm run site:check` tüm site içi bağlantıları ve çapaları doğrular |
| 7 | Her içeriğin başlığı, açıklaması ve kanonik URL'si vardır | `pageMetadata` her sayfada title, description, canonical ve Open Graph üretir | `npm run site:check` eksik veya hatalı olanı hata olarak raporlar |
| 8 | Gizli yönetim alanı kimlik doğrulamayla korunur | v1'de site içinde yönetim alanı **yoktur**; yönetim (ilan onayı dahil) GitHub üzerinden yapılır (2FA, yetkiler, zorunlu inceleme). Önizleme ortamı arama motorlarına kapalıdır; erişim Cloudflare Access ile kısıtlanabilir | [icerik-is-akisi.md](icerik-is-akisi.md#githubda-önerilen-ayarlar) |
| 9 | Yayına alma ve geri alma adımları belgelenmiştir | Cloudflare Pages kurulumu, yayımlama adımları, panelden geri alma ve `git revert` | [yayinlama-ve-geri-alma.md](yayinlama-ve-geri-alma.md) |

## Sektör ağı (fuar, iş ilanları, market) için ek kontroller

| Kontrol | Nasıl karşılanıyor? | Doğrulama |
|---|---|---|
| Yalnızca onaylı ve süresi dolmamış ilanlar yayımlanır | `isListingVisible`: üretimde `published`, süresi geçmemiş, örnek olmayan; tarayıcıda da süre denetimi | `npm test` (görünürlük ve kural testleri); üretim derlemesinde örnek içerik bulunmadığı denetlendi |
| Yayın kuralları zorlanır | Onaylayan editör (`canModerate`), tarihler, süre üst sınırları, kategoriye özel zorunlu alanlar | `npm run content:check`; `src/lib/content/content.test.ts` |
| Aday kişisel verisi yayımlanmaz | İletişim alanı yok; metinde telefon/e-posta/web adresi denetimi; dosya adı = başvuru no; `noindex`, site haritası ve arama dizini dışı | İçerik ve form testleri; tarayıcı testinde arama dizini denetlendi |
| Formlar erişilebilir ve hatalı girdiye dayanıklı | Etiketli alanlar, hata özeti ve odak, `aria-invalid`/`aria-describedby`, Türkçe sayı okuma, bot tuzağı | `src/lib/submissions/submissions.test.ts`; tarayıcı etkileşim testleri; axe |
| Editöre giden taslak dosya şemaya uyar | Her form türü için üretilen taslak, içerik şemalarıyla doğrulanır; yayımlanmayacak bilgiler taslağa yazılmaz | `submissions.test.ts` (gidiş-dönüş testleri) |
| Mevzuata dayanan uyarılar kaynaklıdır | Market kategori notları `sources` ile Maden Yönetmeliği ve İSG Yönetmeliği maddelerine bağlı | `npm run content:check` (tanımsız kaynak hatası) |

## Tek komutla tüm kontroller

```powershell
npm run check          # lint + tip denetimi + testler + içerik doğrulama
npm run build          # üretim derlemesi (yalnızca yayımlanmış içerik)
npm run site:check     # derleme çıktısında bağlantı ve SEO denetimi
```

Aynı adımlar GitHub Actions'ta (`.github/workflows/ci.yml`) her çekme isteğinde ve `main` dalına her
gönderimde çalışır; ayrıca önizleme derlemesi (taslaklar dahil) de üretilip denetlenir.

## Erişilebilirlik notları

- Tüm form alanları etiketli; hatalar `aria-describedby` ile alana bağlı, `aria-invalid` işaretli.
- Hesaplama sonucu ekran okuyuculara `role="status"` bölgesiyle duyurulur; hata durumunda odak ilk
  hatalı alana taşınır.
- Görünür odak halkası (bakır, 3 px), "İçeriğe geç" bağlantısı, anlamlı başlık hiyerarşisi.
- Renk kontrastları WCAG 2.2 AA'yı karşılar (renk belirteçlerindeki notlara bakın).
- Geliştirme sırasında axe-core ile 14 sayfa; sektör ağı eklendikten sonra fuar, iş, market, form (hata
  durumu dahil) ve politika sayfalarıyla birlikte 24 sayfa, masaüstü ve mobil genişlikte denetlenmiş ve
  ihlal bulunmamıştır.
