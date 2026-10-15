---
title: Kütle verimi, tenör ve metal kazanımı
summary: Cevher zenginleştirmede besleme, konsantre ve artık kavramları; kütle verimi, kazanım, zenginleştirme oranı ve iki ürün formülünün kullanımı.
category: cevher-hazirlama
tags: [kutle-dengesi, verimlilik, flotasyon, metalik-madenler]
keywords: [metal kazanımı, recovery, kütle verimi, mass pull, yield, iki ürün formülü, tenör kazanım eğrisi, zenginleştirme oranı, konsantrasyon oranı, metalurjik muhasebe]
relatedCalculators: [kutle-verimi-ve-kazanim]
relatedTerms: [metal-kazanimi, kutle-verimi, tenor, konsantre, artik, flotasyon, tuvenan]
relatedArticles: [cevher-tenor-kaynak-ve-rezerv]
featured: true
status: review
authors: [maden360-editorluk]
aiAssisted: true
sources:
  - id: wills-finch-2016
    note: Besleme, konsantre ve artık; kazanım, tenör, zenginleştirme ve konsantrasyon oranı; iki ürün formülü ve metalurjik muhasebe.
  - id: maden-yonetmeligi-2022
    locator: Madde 4 (b) ve (nnn)
    note: Ara ve uç ürün ile tenör/kalite tanımları.
  - id: sme-handbook-2011
    note: Cevher hazırlama ve zenginleştirme süreçlerinin madencilik içindeki yeri.
---

Ocaktan çıkan **tüvenan** cevher, çoğu zaman doğrudan satılabilecek nitelikte değildir. Cevher hazırlama ve zenginleştirme işlemleriyle değerli mineraller ayrılarak daha yüksek tenörlü bir ürün elde edilir. Maden Yönetmeliği bu ürünleri, tüvenan madenin zenginleştirme işlemlerine tabi tutulması sonucu elde edilen ve tüvenan hâline göre daha ekonomik ve kullanım açısından daha elverişli olan **ara ve uç ürün** olarak tanımlar [@maden-yonetmeligi-2022].

## Akımlar ve semboller

Basit bir ayırma işleminde tek bir besleme iki ürüne ayrılır [@wills-finch-2016]:

| Akım | Kütle | Tenör | Açıklama |
|---|---|---|---|
| Besleme | F | f | Devreye giren malzeme |
| Konsantre | C | c | Değerli mineralce zenginleşmiş ürün |
| Artık | T | t | Değerli minerali büyük ölçüde alınmış kısım |

Kütle ve metal korunduğu için iki denge yazılabilir:

$$
F = C + T \qquad F\,f = C\,c + T\,t
$$

## Temel göstergeler

**Kütle verimi** (Y), beslemenin ne kadarının konsantreye gittiğini; **metal kazanımı** (R), beslemedeki değerli bileşenin ne kadarının konsantrede toplandığını gösterir [@wills-finch-2016]:

$$
Y = \frac{C}{F} \times 100 \qquad R = \frac{C\,c}{F\,f} \times 100
$$

Bunlara ek olarak **zenginleştirme oranı** (c/f) konsantre tenörünün besleme tenörüne oranını, **konsantrasyon oranı** (F/C) ise bir birim konsantre için gereken besleme miktarını gösterir.

## İki ürün formülü

Kütleler ölçülemiyorsa ama üç akımın tenörleri biliniyorsa, iki denge denklemi birlikte çözülerek kütle oranı bulunabilir [@wills-finch-2016]:

$$
\frac{C}{F} = \frac{f - t}{c - t} \qquad R = \frac{c\,(f - t)}{f\,(c - t)} \times 100
$$

Bu formülün geçerli olması için tenörlerin **c > f > t** sıralamasında olması gerekir. Örneğin f = %0,8, c = %25 ve t = %0,15 için C/F ≈ 0,0262 (kütle verimi ≈ %2,62) ve kazanım ≈ %81,7 bulunur.

İki ürün formülü kullanışlıdır ancak **analiz hatalarına çok duyarlıdır**. Özellikle besleme ve artık tenörleri birbirine yakınsa, tenördeki küçük bir hata kütle oranını ve kazanımı büyük ölçüde değiştirebilir. Bu nedenle kesin metalurjik muhasebede ölçülmüş kütleler ve kütle dengesi uzlaştırması kullanılır [@wills-finch-2016].

## Tenör ile kazanım arasındaki ödünleşim

Bir zenginleştirme devresinde genellikle konsantre tenörü yükseldikçe kazanım düşer, kazanım yükseldikçe konsantre tenörü düşer. Bu ilişki tenör–kazanım eğrisiyle gösterilir. En uygun çalışma noktası; konsantrenin satış koşulları, metal fiyatı ve işletme maliyetleri birlikte değerlendirilerek belirlenir [@wills-finch-2016; @sme-handbook-2011].

## Tenör kavramı hakkında

Teknik literatürde tenör genellikle bir bileşenin kütlece oranıdır (% veya g/t). Mevzuattaki tanım daha geniştir: tenör/kalite; tetkik, gözlem, analiz, teknolojik test ve ölçüm sonucunda ortaya konan kalorifik değer, konsantrasyon, karat/ayar gibi fiziksel, kimyasal ve jeokimyasal özelliklere göre değerlendirilebilme ölçütlerini kapsar [@maden-yonetmeligi-2022].

Hesapları adım adım görmek için [kütle verimi ve kazanım hesaplayıcısını](/hesaplamalar/kutle-verimi-ve-kazanim) kullanabilirsiniz.
