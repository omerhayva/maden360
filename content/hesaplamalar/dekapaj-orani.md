---
title: Dekapaj Oranı Hesaplayıcı
shortTitle: Dekapaj oranı
summary: Pasa ve cevher miktarlarından dekapaj (örtü kazı) oranını ağırlık (t/t) ve hacim (m³/m³) bazında ayrı ayrı hesaplar; farklı birimleri yoğunlukla açıkça dönüştürür.
seoDescription: "Pasa ve cevher miktarlarından dekapaj oranını ağırlık (t/t) ve hacim (m³/m³) bazında hesaplayın; farklı birimler yoğunlukla dönüştürülür."
category: uretim-planlama
tags: [acik-ocak, planlama, birim-donusumu]
keywords: [dekapaj oranı hesaplama, örtü kazı oranı, stripping ratio, pasa cevher oranı, t/t, m3/m3, açık ocak planlama]
order: 2
relatedArticles: [dekapaj-orani-nedir, tonaj-hacim-ve-yogunluk]
relatedTerms: [dekapaj, dekapaj-orani, pasa, yerinde-yogunluk]
status: review
authors: [maden360-editorluk]
aiAssisted: true
sources:
  - id: hustrulid-2013
    note: Dekapaj oranının tanımı ve açık ocak planlamasındaki kullanımı.
  - id: sme-handbook-2011
    note: Açık ocak madenciliğinde örtü kazısı ve dekapaj oranı.
  - id: maden-yonetmeligi-2022
    locator: Madde 4 (aaa) — Pasa
    note: Pasanın mevzuattaki tanımı.
---

## Ne işe yarar?

Dekapaj oranı, bir birim cevher üretmek için kaldırılması gereken pasa (örtü ve ara kesme) miktarıdır. Açık ocak projelerinin değerlendirilmesinde, üretim planlarının karşılaştırılmasında ve dönemsel performans takibinde kullanılan temel göstergelerden biridir [@hustrulid-2013].

Bu hesaplayıcı oranı **iki ayrı bazda** verir: ağırlık bazında (t/t) ve yerinde hacim bazında (m³/m³). Pasa ile cevherin yoğunlukları genellikle farklı olduğundan bu iki oran birbirinden farklıdır; hangisinin raporlandığı mutlaka belirtilmelidir.

## Nasıl kullanılır?

1. Pasa ve cevher miktarlarını girin; her biri için birimi (t veya m³) seçin.
2. İki miktar aynı birimdeyse oran doğrudan hesaplanır.
3. Farklı birimlerdeyse dönüşüm için yerinde yoğunluk gerekir: pasa m³ ise pasa yoğunluğu, cevher m³ ise cevher yoğunluğu.
4. Her iki yoğunluğu da girerseniz oran her iki bazda birden gösterilir.

## Çözümlü örnek

Bir dönemde 1.800.000 m³ (yerinde) pasa kaldırılıp 900.000 t cevher üretilmiş olsun. Pasa yerinde yoğunluğu 2,5 t/m³, cevherinki 3,0 t/m³:

- Pasa kütlesi: 1.800.000 × 2,5 = 4.500.000 t → **ağırlık bazında oran 5,0 t/t**
- Cevher hacmi: 900.000 / 3,0 = 300.000 m³ → **hacim bazında oran 6,0 m³/m³**

Aynı ocak için iki farklı sayı elde edilir. Bu nedenle "dekapaj oranı 5" gibi bazı belirtilmemiş bir ifade, karşılaştırma yapılırken yanıltıcı olabilir.

## Sık yapılan hatalar

- **Farklı bazları karıştırmak:** Pasayı m³, cevheri ton olarak alıp doğrudan bölmek, ne ağırlık ne de hacim bazında anlamlı bir oran verir. Bazı raporlarda oran m³/t gibi karma birimle verilebilir; bu durumda birim açıkça yazılmalı ve başka bazdaki oranlarla doğrudan karşılaştırılmamalıdır.
- **Gevşek ve yerinde hacmi karıştırmak:** Kamyon sayımından elde edilen gevşek hacim, kabarma düzeltmesi yapılmadan yerinde hacimle karşılaştırılmamalıdır.
- **Kapsam farkı:** Pasa ve cevher miktarları aynı alanı ve aynı dönemi kapsamalıdır.

Mevzuatta pasa; mevcut ekonomik ve teknik şartlara göre işletilmesi mümkün olmayan, ancak işletme gereği istihsal edilen madde olarak tanımlanır [@maden-yonetmeligi-2022]. Ekonomik sınır analizi ve başa baş dekapaj oranı gibi kavramlar için [dekapaj oranı makalesine](/bilgi/dekapaj-orani-nedir) bakabilirsiniz [@sme-handbook-2011].
