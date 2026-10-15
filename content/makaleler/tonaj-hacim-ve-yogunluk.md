---
title: "Tonaj, hacim ve yoğunluk: yerinde ve gevşek baz"
summary: Hacimden tonaja geçişte yerinde ve gevşek yoğunluk, kabarma oranı ve nem düzeltmesi; stok yığını ve kazı hacimlerinin yaklaşık hesabı.
category: uretim-planlama
tags: [birim-donusumu, planlama, temel-kavramlar]
keywords: [tonaj hesabı, yoğunluk, yerinde yoğunluk, gevşek yoğunluk, kabarma, swell factor, kabarma faktörü, kuru tonaj, nem, bank cubic meter, loose cubic meter]
relatedCalculators: [tonaj-hacim, dekapaj-orani]
relatedTerms: [yerinde-yogunluk, kabarma-faktoru, tuvenan, pasa]
relatedArticles: [dekapaj-orani-nedir]
status: review
authors: [maden360-editorluk]
aiAssisted: true
sources:
  - id: hustrulid-2013
    note: Yerinde ve gevşek hacim, kabarma ve yükleme–nakliyat hesaplarında malzeme özellikleri.
  - id: sme-handbook-2011
    note: Malzeme yoğunluğu, kabarma ve hacim–kütle dönüşümleri.
  - id: agi-sozluk-1997
    note: Kabarma (swell) ve yerinde (in-place / bank) hacim terimlerinin tanımları.
  - id: wills-finch-2016
    note: Nem içeriği ve kuru kütle esasına göre hesaplama.
---

Madencilikte miktarlar kimi zaman hacim (m³), kimi zaman kütle (ton) olarak ölçülür. Kazı ve nakliyat planlaması çoğunlukla hacimle, üretim ve satış raporlaması ise tonajla yapılır. İkisi arasındaki köprü yoğunluktur; ancak aynı malzemenin yoğunluğu kazılmadan önce ve sonra farklıdır [@hustrulid-2013].

## Temel ilişki

$$
T = V \times \rho
$$

Burada T kütle (t), V hacim (m³), ρ yoğunluktur (t/m³). Yoğunluk birimleri arasında şu eşitlikler geçerlidir: 1 t/m³ = 1 g/cm³ = 1.000 kg/m³.

## Yerinde ve gevşek baz

- **Yerinde (sağlam) hacim:** Malzemenin kazılmadan önce doğal konumunda kapladığı hacim. Literatürde "bank" veya "in-place" hacim olarak da geçer [@agi-sozluk-1997].
- **Gevşek hacim:** Kazılıp yüklendikten veya yığıldıktan sonra kapladığı hacim. Parçalar arasındaki boşluklar nedeniyle yerinde hacimden büyüktür.

Kazı sonucu hacimdeki bu artışa **kabarma** denir. Kabarma oranı s (%) ve kabarma faktörü K_F ile ifade edilir [@sme-handbook-2011]:

$$
V_{g} = V_{y} \times \left(1 + \frac{s}{100}\right) \qquad K_F = 1 + \frac{s}{100}
$$

Kütle kazı sırasında değişmez. Bu nedenle yerinde yoğunluk, gevşek yoğunluğun kabarma faktörüyle çarpımına eşittir: ρ_y = ρ_g × K_F. Kabarma oranı malzemenin türüne, kazı yöntemine ve parça boyu dağılımına bağlıdır; planlamada ölçüm veya deneyle belirlenmiş değerler kullanılmalıdır.

| Kullanım | Uygun baz |
|---|---|
| Rezerv ve üretim tonajı, dekapaj oranı | Yerinde hacim × yerinde yoğunluk |
| Kamyon kasası, bunker, döküm alanı kapasitesi | Gevşek hacim |
| Stok yığını tonajı | Gevşek hacim × gevşek (yığın) yoğunluk |

## Nem ve kuru tonaj

Doğal malzeme su içerir. Tartımla ölçülen veya doğal yoğunlukla hesaplanan tonaj **yaş tonajdır**. Cevher hazırlamada kütle dengesi ve metal muhasebesi kuru kütle esasına göre yapılır [@wills-finch-2016]. Nem oranı w yaş baza göre (suyun kütlesi / nemli malzemenin kütlesi) verilmişse:

$$
T_{\text{kuru}} = T \times \left(1 - \frac{w}{100}\right)
$$

## Stok yığını ve kazı hacimlerinin yaklaşık hesabı

Düzenli şekillere benzeyen hacimler basit formüllerle yaklaşık hesaplanabilir:

- Dikdörtgen prizma (blok, basamak dilimi): V = L × W × H
- Konik yığın: V = π × D² × H / 12
- Üçgen kesitli uzun yığın: V = ½ × b × H × L
- Silindir (silo, bunker): V = π × D² × H / 4

Gerçek yığınlar ve kazılar bu şekillerden sapar. Envanter ve hakediş gibi kesinlik gerektiren durumlarda topoğrafik ölçüme dayalı hacim hesabı kullanılmalıdır [@sme-handbook-2011].

## Sık yapılan hatalar

1. Gevşek hacmi yerinde yoğunlukla çarpmak (tonaj olduğundan büyük çıkar).
2. kg/m³ ile t/m³ birimlerini karıştırmak (sonuç bin kat hatalı olur).
3. Yaş tonajı kuru tonaj gibi raporlamak.
4. Tek bir yoğunluk değerini, farklı kayaç türlerinden oluşan bir hacmin tamamına uygulamak.

Bu dönüşümleri adım adım görmek için [tonaj–hacim hesaplayıcısını](/hesaplamalar/tonaj-hacim) kullanabilirsiniz.
