# Yayına alma ve geri alma

Site statik olarak üretildiği için `out/` klasörünü sunabilen her hizmette çalışır. Önerilen kurulum,
ücretsiz katmanı geniş olan **Cloudflare Pages**'tir; alternatifler aşağıdadır.

## Yayın öncesi kontrol listesi

- [ ] `src/config/site.ts` içindeki `contactEmail` ve `listingsEmail` gerçek adreslerle değiştirildi
  (şu an `iletisim@maden360.example` ve `ilan@maden360.example`).
- [ ] Alan adı alındı; barındırma hizmetinde `SITE_URL` ortam değişkeni bu adresle ayarlandı.
- [ ] Gerekirse site adı (`name`) ve paylaşım görseli güncellendi (`node scripts/generate-og-image.mjs`).
- [ ] En az bir ilan editörü (`canModerate: true`) `content/kisiler.yaml` dosyasına eklendi.
- [ ] `content/sayfalar/kvkk.md` dolduruldu, hukuki kontrolden geçti ve `content/sayfalar/ilan-kurallari.md`
  ile birlikte yayımlandı (başvuru formları bu iki sayfa yayımlanınca açılır).
- [ ] Günlük yeniden derleme için `DEPLOY_HOOK_URL` gizli değişkeni eklendi; süresi dolan ilanlar böylece
  her gece siteden kalkar (bkz. [ilanlar-ve-fuar.md](ilanlar-ve-fuar.md#yayına-almadan-önce-bir-kez)).
- [ ] Yerelde tüm kontroller geçiyor:

```powershell
npm run check                                     # lint + tip denetimi + testler + içerik doğrulama
$env:SITE_URL="https://www.alanadiniz.com.tr"     # PowerShell'de ortam değişkeni
npm run build
npm run site:check                                # kırık bağlantı ve SEO denetimi
npm start                                         # http://localhost:3000 adresinde son kontrol
```

macOS/Linux'ta ortam değişkeni: `SITE_URL=https://www.alanadiniz.com.tr npm run build`.

## Cloudflare Pages kurulumu (bir kez)

1. Cloudflare hesabında **Workers & Pages → Create → Pages → Connect to Git** ile bu depoyu bağlayın.
2. Derleme ayarları:

   | Ayar | Değer |
   |---|---|
   | Production branch | `main` |
   | Build command | `npm run build` |
   | Build output directory | `out` |
   | Ortam değişkenleri (Production) | `SITE_URL` = `https://www.alanadiniz.com.tr`, `NODE_VERSION` = `22`; isteğe bağlı `NEXT_PUBLIC_FORM_ENDPOINT` (ilan formları için form hizmeti) |

3. **Önizleme ortamı (isteğe bağlı):** Preview ortamı için build command olarak `npm run build:onizleme`
   kullanılırsa her dal ve çekme isteği için taslakların da göründüğü, arama motorlarına kapalı bir
   önizleme adresi oluşur. Bu adresi yalnızca editörlerle paylaşın. Önizleme adreslerine erişimi
   kısıtlamak için Cloudflare Access (ücretsiz katman) kullanılabilir.
4. **Custom domains** bölümünden alan adını bağlayın; HTTPS sertifikası otomatik verilir.

Bundan sonra `main` dalına her birleştirme siteyi otomatik olarak yeniden derler ve yayımlar.

### Alternatifler

| Hizmet | Ayarlar |
|---|---|
| Netlify | Build command `npm run build`, publish directory `out`, `SITE_URL` ortam değişkeni |
| Vercel | Framework: Next.js; statik dışa aktarma otomatik algılanır; `SITE_URL` ortam değişkeni |
| GitHub Pages | GitHub Actions ile `npm run build` çıktısı (`out/`) yayımlanır; alt dizinde yayın için `basePath` ayarı gerekir |

## Yayımlama adımları (her ilan için)

1. Başvurudan ilan dosyasını oluşturun: formun ürettiği taslak dosyayı `content/` altına kaydedin veya
   `npm run new -- market "Başlık"` ile şablondan başlayın. `npm run content:check` ile doğrulayın.
2. Çekme isteği açın; CI kontrollerinin geçmesini bekleyin.
3. Editör, başvuruyu [kontrol listesine](ilanlar-ve-fuar.md#kontrol-listesi) göre inceleyip `status: published`,
   `moderatedBy` ve `moderatedAt` alanlarını doldursun.
4. Çekme isteğini `main` dalına birleştirin. Cloudflare Pages birkaç dakika içinde yeni sürümü yayımlar.
5. Yayındaki sayfayı kontrol edin.

## GitHub'da önerilen ayarlar

**Settings → Branches → Branch protection rule (`main`):**

- Require a pull request before merging (en az 1 onay)
- Require status checks to pass: **CI / kalite**
- Do not allow bypassing the above settings

Böylece hiçbir ilan veya sayfa değişikliği editör onayı ve otomatik kontroller olmadan yayına çıkamaz.
Editör hesaplarında iki adımlı doğrulamayı (2FA) zorunlu tutun.

## Geri alma

Bir sorun fark edildiğinde iki yol vardır:

**1. Hızlı geri alma (dakikalar içinde):** Cloudflare Pages panelinde proje → **Deployments** →
sorunsuz çalışan önceki dağıtımın menüsünden **Rollback to this deployment**. Site anında önceki
sürüme döner; depo değişmez.

**2. Kalıcı düzeltme:** Hatalı değişikliği Git'te geri alın ve yeniden yayımlayın:

```powershell
git log --oneline -10            # hatalı birleştirmeyi bulun
git revert <commit-kimliği>      # birleştirme commit'i ise: git revert -m 1 <commit-kimliği>
git push origin main             # CI geçer ve site otomatik yeniden yayımlanır
```

Tek bir ilanı veya sayfayı hızlıca yayından kaldırmak için ilgili dosyada `status: review` yapıp
birleştirmek yeterlidir; sayfa bir sonraki derlemede siteden ve site haritasından kalkar. Yayımlanmış
bir ilan düzeltildiğinde `updatedAt` alanını güncelleyin.

**İlanlar (fuar standı, iş ilanı, aday profili, market):** Şikâyet veya kaldırma talebinde dosyayı silin
(ya da `status: draft` yapın) ve `main` dalına gönderin. Kişisel veri içeren bir ilanı kaldırırken
panelden, o ilanı içeren eski bir dağıtıma **geri dönmeyin**. Süresi dolan ilanlar her gece
`.github/workflows/gunluk-derleme.yml` ile tetiklenen derlemede kendiliğinden kalkar. Git geçmişi ve
kişisel veri talepleri için: [ilanlar-ve-fuar.md](ilanlar-ve-fuar.md#kişisel-veriler-ve-kaldırma-talepleri).

## Yedekleme

- **Asıl yedek Git'tir:** Tüm içerik, kod ve geçmiş GitHub'da tutulur. Her geliştiricinin bilgisayarındaki
  klon da tam bir yedektir.
- Ek güvence için periyodik olarak yerel kopya alın:

```powershell
git clone --mirror https://github.com/omerhayva/maden360.git maden360-yedek.git
```

- Veritabanı olmadığı için ayrıca veri yedeği gerekmez. İleride veritabanı eklenirse otomatik yedekleme
  (ör. Supabase günlük yedekleri) bu belgeye eklenmelidir.

## Hata günlükleri ve izleme

- **Derleme hataları:** Cloudflare Pages → Deployments → ilgili dağıtım → Build log. CI hataları
  GitHub → Actions sekmesinde görünür; içerik hataları çekme isteğinde dosya bazında açıklama olarak çıkar.
- **Tarayıcı hataları:** Beklenmeyen hatalar `src/app/error.tsx` tarafından yakalanır ve konsola yazılır.
  Kullanıcı sayısı arttığında ücretsiz katmanlı bir hata izleme servisi (ör. Sentry) bu dosyaya bağlanabilir.
- **Erişilebilirlik ve trafik:** Çerez kullanmayan Cloudflare Web Analytics, panelden tek tıkla
  açılabilir (Faz 6 — analitik).
- **Kırık bağlantılar:** `npm run site:check` her CI çalışmasında site içi bağlantıları denetler.
- **Mevzuat atıfları:** Market kategori notlarındaki resmî metinler (`content/market-kategorileri.yaml` →
  `references`) altı ayda bir güncel metinle karşılaştırılmalı ve `checkedAt` yenilenmelidir;
  `npm run content:check` kontrol tarihi 180 günü geçen atıf için uyarı verir.

## Faz 5 kalite kontrol listesi

| Kontrol | Nasıl? |
|---|---|
| Mobil uyum | Telefon genişliğinde (390 px) her bölümü gezin; yatay kaydırma olmamalı |
| Erişilebilirlik | Yalnızca klavyeyle (Tab, Shift+Tab, Enter, ok tuşları) bir başvuru formunu doldurup gönderin; tarayıcıda Lighthouse/axe denetimi |
| Performans | Lighthouse (mobil) ile ana sayfa ve bir market ilanı sayfası |
| Kırık bağlantılar | `npm run site:check` |
| SEO | `npm run site:check` (başlık, açıklama, kanonik URL, tek h1, site haritası) |
| İlan kuralları ve yasal notlar | Editör kontrol listesi + `npm run content:check` |
| Yedekleme | Git + periyodik `git clone --mirror` |
| Hata günlükleri | Cloudflare build log, GitHub Actions, tarayıcı konsolu |
