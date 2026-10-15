---
title: Kütle Verimi ve Metal Kazanımı Hesaplayıcı
shortTitle: Kütle verimi ve kazanım
summary: Besleme, konsantre ve artık tenörleri ile kütlelerden kütle verimini, metal kazanımını, zenginleştirme ve konsantrasyon oranını hesaplar; kütleler bilinmiyorsa iki ürün formülünü kullanır.
seoDescription: "Besleme, konsantre ve artık tenörlerinden kütle verimi, metal kazanımı ve zenginleştirme oranını hesaplayın; iki ürün formülü desteklenir."
category: cevher-hazirlama
tags: [kutle-dengesi, verimlilik, flotasyon, metalik-madenler]
keywords: [metal kazanımı hesaplama, recovery, kütle verimi, mass pull, iki ürün formülü, two product formula, tenör, konsantre, artık tenörü, zenginleştirme oranı, konsantrasyon oranı]
order: 3
relatedArticles: [kutle-verimi-ve-metal-kazanimi]
relatedTerms: [metal-kazanimi, kutle-verimi, tenor, konsantre, artik, flotasyon, tuvenan]
status: review
authors: [maden360-editorluk]
aiAssisted: true
sources:
  - id: wills-finch-2016
    note: Kütle verimi, kazanım, zenginleştirme oranı, konsantrasyon oranı ve iki ürün formülü; metalurjik muhasebe ve kütle dengesi.
  - id: maden-yonetmeligi-2022
    locator: Madde 4 (nnn) — Tenör/Kalite
    note: Tenörün mevzuattaki tanımı.
---

## Ne işe yarar?

Bir zenginleştirme devresinin (ör. flotasyon, gravite veya manyetik ayırma) ne kadar iyi çalıştığını iki temel göstergeyle ölçer: beslemenin ne kadarının konsantreye gittiği (**kütle verimi**) ve beslemedeki değerli bileşenin ne kadarının konsantrede toplandığı (**metal kazanımı**) [@wills-finch-2016].

İki hesaplama yolu vardır:

- **Ölçülmüş kütlelerle:** Besleme ve konsantre miktarları tartım veya bant kantarıyla biliniyorsa en güvenilir yoldur. Artık tenörü girilirse kütle dengesinden hesaplanan değerle karşılaştırılır.
- **Yalnızca tenörlerle (iki ürün formülü):** Kütleler bilinmiyorsa besleme, konsantre ve artık tenörlerinden kütle oranı hesaplanır. Bu yöntem tek besleme, tek konsantre ve tek artıklı devreler için geçerlidir ve tenörlerin c > f > t sıralamasında olmasını gerektirir.

## Çözümlü örnek

Bir bakır flotasyon devresinde bir günde 10.000 t cevher işlenmiş, %0,80 Cu tenörlü beslemeden %24,5 Cu tenörlü 280 t konsantre üretilmiş olsun:

- Kütle verimi: 280 / 10.000 = **%2,8**
- Metal kazanımı: (280 × 24,5) / (10.000 × 0,80) = 6.860 / 8.000 = **%85,75**
- Artık miktarı: 10.000 − 280 = 9.720 t; kütle dengesinden artık tenörü ≈ %0,117 Cu
- Zenginleştirme oranı: 24,5 / 0,80 ≈ 30,6; konsantrasyon oranı: 10.000 / 280 ≈ 35,7

Yani beslemedeki bakırın yaklaşık %86'sı konsantrede kazanılmış, %14'ü artıkla kaybedilmiştir.

## Sonucu yorumlama

Tenör ile kazanım arasında genellikle bir **ödünleşim** vardır: daha temiz (yüksek tenörlü) konsantre üretmek için kazanımdan, daha yüksek kazanım için konsantre tenöründen ödün vermek gerekebilir. Bu nedenle iki gösterge her zaman birlikte değerlendirilmelidir [@wills-finch-2016].

## Sık yapılan hatalar

- **Yaş kütle kullanmak:** Kütle verimi ve kazanım kuru kütleyle hesaplanır.
- **Farklı bileşen veya birim:** Tenörlerin üçü de aynı bileşen (ör. Cu) ve aynı birim (% veya g/t) olmalıdır. Mevzuatta tenör, malzemenin fiziksel, kimyasal ve jeokimyasal özelliklerine göre değerlendirilebilme ölçütü olarak geniş tanımlanır [@maden-yonetmeligi-2022].
- **İki ürün formülüne aşırı güven:** Tenörler birbirine yakınsa küçük analiz hataları sonucu büyük ölçüde değiştirir; hesaplayıcı bu durumda uyarı verir.
- **Kazanımın %100'ü aşması:** Fiziksel olarak mümkün değildir; genellikle kütle veya tenör ölçümünde hata olduğunu gösterir.
