---
# ŞABLON — "npm run new -- is-ilani \"İlan başlığı\"" komutu bu dosyayı kopyalar.
# Yayımlarken: status: published, moderatedBy, moderatedAt ekleyin (kurallar: docs/ilanlar-ve-fuar.md).
status: review
ref: {{ref}}
title: "{{title}}"
summary: "İlan kartında görünecek kısa özet (30-220 karakter)."
position: maden-muhendisi # content/meslekler.yaml
employer:
  name: Firma adı
  # stand: firma-standi-slug # firmanın sanal fuar standı varsa
  # website: https://www.firma-adi.com.tr
city: Ankara
# district: İlçe
siteType: acik-ocak # acik-ocak | yeralti | tesis | saha | ofis | karma
employmentType: tam-zamanli # tam-zamanli | yari-zamanli | sozlesmeli | proje | sezonluk | staj
# shift: "3 vardiya, 8 saat"
openings: 1
# experienceYears: 3
# education: Maden Mühendisliği lisans
requirements: []
certificates: []
benefits: []
# salary:
#   min: 60000
#   max: 80000
#   currency: TRY
#   period: aylik
#   basis: net
apply:
  method: eposta # eposta | url | telefon
  value: ik@firma-adi.com.tr
keywords: []
postedAt: {{date}}
expiresAt: {{expires}} # en fazla 60 gün
---

İş tanımı, görev ve sorumluluklar, çalışma koşulları.
