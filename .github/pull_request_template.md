## Değişiklik

<!-- Ne değişti, neden? -->

## İlan ve stand değişikliklerinde (fuar, iş, aday, market)

- [ ] Başvuru [ilan kurallarına](../docs/ilanlar-ve-fuar.md#kontrol-listesi) göre kontrol edildi (yanıltıcı bilgi, patlayıcı madde, ayrımcı ifade, ücret isteyen iş ilanı yok).
- [ ] Yayımlanacaksa `status: published`, `postedAt`, `expiresAt` (süre sınırı içinde), `moderatedBy`, `moderatedAt` dolduruldu.
- [ ] Aday profilinde ad, telefon, e-posta, adres veya firma adı yok; dosya adı başvuru numarası.
- [ ] Fuar standında doğrulama yöntemi (`verification`) yazıldı; saha/ruhsat ilanında yetki belgesi istendi.

## Sayfa ve yasal not değişikliklerinde

- [ ] Mevzuata dayanan cümleler güncel resmî metinle karşılaştırıldı; `references` içindeki madde ve `checkedAt` güncellendi.
- [ ] Kaynak önceliğine uyuldu: resmî kurum → akademik/teknik → mevzuat/standart → sektör.
- [ ] Standart metinleri kopyalanmadı; yalnızca künye ve madde numarası verildi.
- [ ] Yapay zekâ desteğiyle yazılan metin, yayımlanmadan önce kaynağından tek tek doğrulandı.
- [ ] İlan kuralları veya KVKK aydınlatma metni değiştiyse hukuki kontrol yapıldı.

## Kontroller

- [ ] `npm run check` yerelde geçti.
