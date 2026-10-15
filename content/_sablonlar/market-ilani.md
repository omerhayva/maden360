---
# ŞABLON — "npm run new -- market \"İlan başlığı\"" komutu bu dosyayı kopyalar.
# Yayımlarken: status: published, moderatedBy, moderatedAt ekleyin (kurallar: docs/ilanlar-ve-fuar.md).
status: review
ref: {{ref}}
title: "{{title}}"
summary: "İlan kartında görünecek kısa özet (30-220 karakter)."
category: is-makineleri # content/market-kategorileri.yaml
type: satilik # satilik | kiralik | aranan | hizmet
# condition: ikinci-el # yeni | ikinci-el | yenilenmis (ekipman ve parça)
# brand: Marka
# model: Model
# year: 2018
# hours: 9500
specs: []
# price:
#   amount: 1000000
#   currency: TRY
#   per: ton # birim fiyatlarda
#   vat: haric # dahil | haric
city: Ankara
seller:
  name: Firma veya satıcı adı
  kind: firma # firma | kisi
contact:
  mode: aracili # aracili: iletişim bilgisi bu dosyaya YAZILMAZ | dogrudan
  # phone: "0312 000 00 00"
  # email: satis@firma-adi.com.tr
  # website: https://www.firma-adi.com.tr
# Cevher ve ürün kategorisinde zorunlu:
# ore:
#   mineral: Krom cevheri
#   grade: "%38-40 Cr2O3"
#   analysis: laboratuvar # akredite-laboratuvar | laboratuvar | beyan | yok
#   delivery: Ocak başı
# Saha ve ruhsat kategorisinde zorunlu:
# license:
#   group: IV(c)
#   kind: isletme # arama | isletme
#   offer: rodovans # devir | rodovans | ortaklik
#   areaHectares: 100
#   reserve: umrek-raporu # umrek-raporu | teknik-rapor | yok
images: [] # public/market/ altındaki WebP görseller: - src: /market/dosya.webp, alt: Açıklama
keywords: []
postedAt: {{date}}
expiresAt: {{expires}} # en fazla 90 gün
---

Açıklama: durum, bakım geçmişi, teslim koşulları, belgeler.
