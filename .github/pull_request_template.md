## Değişiklik

<!-- Ne değişti, neden? -->

## İçerik değişikliklerinde teknik inceleme kontrol listesi

- [ ] Her teknik iddia bir kaynağa bağlı (`[@kaynak-id]`) ve kaynak bu iddiayı gerçekten destekliyor.
- [ ] Kaynak önceliğine uyuldu: resmî kurum → akademik/teknik → mevzuat/standart → sektör.
- [ ] Formüller, birimler ve sayısal örnekler elle kontrol edildi.
- [ ] Mevzuat içeriğinde yürürlük tarihi, son değişiklik ve resmî metin bağlantısı güncel.
- [ ] Standart metinleri kopyalanmadı; yalnızca künye ve madde numarası verildi.
- [ ] Güvenlikle ilgili konularda (havalandırma, tahkimat, patlatma, İSG) uyarı notu var.
- [ ] Yapay zekâ destekli taslaksa (`aiAssisted: true`) tüm iddialar kaynağından tek tek doğrulandı.
- [ ] Yayımlanacaksa `status: published`, `publishedAt`, `reviewedAt` ve `reviewers` dolduruldu.

## Hesaplayıcı değişikliklerinde

- [ ] Bilinen örnek testleri eklendi/güncellendi (`npm test`).
- [ ] Formül veya doğrulama değiştiyse `version` artırıldı ve açıklama sayfasına düzeltme notu eklendi.

## İlan ve stand değişikliklerinde (fuar, iş, aday, market)

- [ ] Başvuru [ilan kurallarına](../docs/ilanlar-ve-fuar.md#kontrol-listesi) göre kontrol edildi (yanıltıcı bilgi, patlayıcı madde, ayrımcı ifade, ücret isteyen iş ilanı yok).
- [ ] Yayımlanacaksa `status: published`, `postedAt`, `expiresAt` (süre sınırı içinde), `moderatedBy`, `moderatedAt` dolduruldu.
- [ ] Aday profilinde ad, telefon, e-posta, adres veya firma adı yok; dosya adı başvuru numarası.
- [ ] Fuar standında doğrulama yöntemi (`verification`) yazıldı; saha/ruhsat ilanında yetki belgesi istendi.

## Kontroller

- [ ] `npm run check` yerelde geçti.
