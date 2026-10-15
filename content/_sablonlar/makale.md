---
# ŞABLON — "npm run new -- makale \"Başlık\"" komutu bu dosyayı kopyalar.
# Alan açıklamaları için: docs/icerik-is-akisi.md
title: "{{title}}"
summary: "Bir-iki cümlelik özet (40-280 karakter). Kartlarda ve arama sonuçlarında görünür; 160 karakteri aşarsa seoDescription ekleyin."
category: uretim-planlama # content/konular.yaml içindeki slug'lardan biri
tags: [] # content/etiketler.yaml içindeki slug'lar
keywords: [] # aramada eşleşmesi istenen eş anlamlılar, İngilizce karşılıklar
relatedCalculators: []
relatedTerms: []
relatedArticles: []
status: draft # draft → review → published
authors: [maden360-editorluk] # content/kisiler.yaml
reviewers: [] # yayın için zorunlu: canReview: true olan kişi
# publishedAt: {{date}}  # yayımlarken açın
# reviewedAt: {{date}}   # teknik inceleme tarihi
aiAssisted: false # taslak yapay zekâ desteğiyle hazırlandıysa true
sources:
  - id: kaynak-kimligi # content/kaynaklar.yaml içindeki id
    note: Bu kaynağın desteklediği bilgi
# Mevzuat konusundaki makalelerde zorunlu:
# legal:
#   - instrument: 3213 sayılı Maden Kanunu
#     publication: "Resmî Gazete: 15.06.1985, Sayı 18785"
#     effectiveDate: 1985-06-15
#     officialUrl: https://www.mevzuat.gov.tr/...
#     checkedAt: {{date}}
---

Giriş paragrafı: konunun ne olduğu ve neden önemli olduğu.

## Ana başlık

Her teknik iddiadan sonra kaynağı belirtin [@kaynak-kimligi]. Birden fazla kaynak için [@kaynak-1; @kaynak-2] yazın.

Formüller için KaTeX kullanılır:

$$
DO = \frac{P}{C}
$$

## Sık yapılan hatalar

1. ...
