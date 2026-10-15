---
title: Tonaj, Hacim ve Yoğunluk Hesaplayıcı
shortTitle: Tonaj – hacim
summary: Hacim ve yoğunluktan tonajı hesaplar; prizma, konik yığın, uzun yığın ve silindir hacimlerini, kabarma ve nem düzeltmelerini birim dönüşümüyle birlikte yapar.
category: uretim-planlama
tags: [birim-donusumu, planlama, temel-kavramlar]
keywords: [tonaj hesabı, hacim hesabı, yoğunluk, stok yığını hacmi, kabarma, swell factor, gevşek hacim, yerinde hacim, kuru tonaj, bank cubic meter]
order: 1
relatedArticles: [tonaj-hacim-ve-yogunluk, dekapaj-orani-nedir]
relatedTerms: [yerinde-yogunluk, kabarma-faktoru, tuvenan]
status: review
authors: [maden360-editorluk]
aiAssisted: true
sources:
  - id: hustrulid-2013
    note: Yerinde ve gevşek hacim, kabarma ve malzeme yoğunluğu kavramları.
  - id: sme-handbook-2011
    note: Malzeme özellikleri ve hacim–kütle dönüşümleri.
  - id: agi-sozluk-1997
    note: Kabarma (swell) ve yerinde hacim terimlerinin tanımları.
---

## Ne işe yarar?

Bir stok yığınının, kazılacak bir basamak diliminin veya bir silonun **kaç ton** malzeme içerdiğini hesaplar. Temel ilişki basittir: kütle, hacim ile yoğunluğun çarpımıdır. Hesabın güvenilirliği ise iki noktaya bağlıdır: hacmin doğru belirlenmesi ve yoğunluğun hacimle **aynı bazda** seçilmesi [@hustrulid-2013].

## Nasıl kullanılır?

1. Hacmi biliyorsanız doğrudan girin; bilmiyorsanız yığına veya kazıya en yakın geometrik şekli seçip ölçüleri girin.
2. Hacmin **yerinde** (kazılmamış) mı yoksa **gevşek** (kazılmış, yığılmış) mı olduğunu seçin.
3. Bu baza karşılık gelen yoğunluğu girin ve birimini seçin (t/m³, g/cm³ veya kg/m³).
4. İsterseniz kabarma oranını girerek diğer bazdaki hacmi, nem oranını girerek kuru tonajı da hesaplayın.

## Çözümlü örnek

120 m uzunluğunda, 40 m genişliğinde ve 10 m yüksekliğinde bir basamak dilimi kazılacak. Yerinde yoğunluk 2,65 t/m³, kabarma oranı %40 ölçülmüş olsun:

- Hacim: 120 × 40 × 10 = **48.000 m³** (yerinde)
- Tonaj: 48.000 × 2,65 = **127.200 t**
- Gevşek hacim: 48.000 × 1,40 = **67.200 m³**

Kazılan malzemenin kütlesi değişmez; ancak kamyon, bunker ve döküm alanında 67.200 m³ hacim kaplar. Bu nedenle nakliyat planlamasında gevşek hacim, satış ve üretim raporlamasında tonaj kullanılır.

## Sık yapılan hatalar

- **Baz karıştırmak:** Gevşek hacmi yerinde yoğunlukla çarpmak tonajı olduğundan büyük çıkarır.
- **Birim hatası:** 2.650 kg/m³ yoğunluğu t/m³ seçiliyken girmek sonucu bin kat büyütür. Hesaplayıcı bu tür fiziksel olarak mümkün olmayan değerleri durdurur.
- **Binlik ayırıcı:** "2.700" yazımı 2,7 olarak okunur. Hesaplayıcı okunan değeri alanın altında gösterir; değerleri binlik ayırıcı kullanmadan girin.
- **Nem:** Yaş (nemli) malzemenin yoğunluğu ile hesaplanan tonaj, kuru tonaj değildir. Kuru tonaj için nem oranını yaş baza göre girin.

## Ne zaman yeterli değildir?

Düzensiz yığınlar ve karmaşık kazı geometrileri basit şekillerle ancak yaklaşık olarak temsil edilebilir. Envanter, hakediş veya satış gibi kesinlik gerektiren durumlarda topoğrafik ölçüme dayalı hacim hesabı ve temsilî numunelerle belirlenmiş yoğunluk kullanılmalıdır [@sme-handbook-2011].
