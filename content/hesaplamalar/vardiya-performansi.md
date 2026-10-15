---
title: Vardiya Üretim Performansı ve Hedef Hesaplayıcı
shortTitle: Vardiya performansı
summary: Vardiya üretimlerinden günlük toplamı, hedef gerçekleşme oranını, duruş oranını ve saatlik üretimi; dönem hedefi için kalan vardiyalarda gereken ortalama üretimi hesaplar.
seoDescription: "Vardiya üretimlerinden günlük toplam, hedef gerçekleşme, duruş oranı ve saatlik üretimi; dönem hedefi için gereken vardiya üretimini hesaplayın."
category: uretim-planlama
tags: [planlama, verimlilik, ekipman]
keywords: [vardiya hedefi, günlük üretim, hedef gerçekleşme, duruş oranı, saatlik üretim, ton/saat, aylık hedef, kalan vardiya, shift production]
order: 4
relatedArticles: [vardiya-ve-ekipman-performansi]
relatedTerms: [vardiya, kullanilabilirlik]
status: review
authors: [maden360-editorluk]
aiAssisted: true
sources:
  - id: maden-yonetmeligi-2022
    locator: Madde 4 (ttt) — Vardiya
    note: Vardiyanın mevzuattaki tanımı.
  - id: gmg-zaman-siniflandirma-2020
    note: Takvim, kullanılabilir ve çalışma sürelerinin standart sınıflandırması.
  - id: hustrulid-2013
    note: Ekipman kullanılabilirliği ve kullanım oranı kavramları.
---

## Ne işe yarar?

Ocakta, kırma–eleme tesisinde veya nakliyatta günlük üretimin hedefe göre nasıl gittiğini hızlıca görmek için kullanılır. Vardiya üretimlerini toplar; hedef gerçekleşme oranını, duruş oranını ve saatlik üretimi hesaplar. Ay veya proje dönemi hedefi girilirse kalan vardiyalarda **ortalama ne kadar üretim gerektiğini** gösterir.

Mevzuatta vardiya, İş Kanunu'ndaki çalışma süresine uygun olarak yirmi dört saat içinde çalışmanın yapıldığı zaman dilimi olarak tanımlanır [@maden-yonetmeligi-2022]. Bu nedenle hesaplayıcı, vardiya sayısı ile vardiya süresinin çarpımının 24 saati aşmasına izin vermez.

## Nasıl kullanılır?

1. Günlük vardiya sayısını ve vardiya süresini girin, üretim birimini (t veya m³) seçin.
2. Üretimi vardiya vardiya veya günlük toplam olarak girin.
3. İsterseniz günlük hedefi ve gün içindeki toplam duruş süresini girin.
4. Dönem takibi için dönem hedefini, bugüne kadarki üretimi ve kalan vardiya sayısını birlikte girin.

## Çözümlü örnek

3 × 8 saat çalışan bir ocakta vardiyalar 1.450, 1.380 ve 1.170 t üretmiş; günlük hedef 4.500 t, toplam duruş 150 dakika olsun:

- Günlük üretim: **4.000 t**; hedef gerçekleşme: 4.000 / 4.500 = **%88,9** (500 t eksik)
- Duruş oranı: 2,5 saat / 24 saat = **%10,4**; net çalışma süresi 21,5 saat
- Saatlik üretim: planlı süreye göre 166,7 t/sa, net süreye göre 186,0 t/sa

Aylık hedef 120.000 t, bugüne kadar 78.400 t üretilmiş ve 30 vardiya kalmışsa, kalan her vardiyada ortalama **1.386,7 t** üretim gerekir; bu, bugünkü vardiya ortalamasının yaklaşık %104'üdür.

## Daha ayrıntılı analiz için

Bu araç günlük takip için basit oranlar üretir. Ekipman bazında kullanılabilirlik ve kullanım oranı gibi göstergeler, sürelerin standart bir sınıflandırmayla (bakım, arıza, bekleme, çalışma) kaydedilmesini gerektirir. Farklı işletmelerin göstergeleri ancak aynı tanımlar kullanıldığında karşılaştırılabilir [@gmg-zaman-siniflandirma-2020; @hustrulid-2013]. Ayrıntılar için [vardiya ve ekipman performansı makalesine](/bilgi/vardiya-ve-ekipman-performansi) bakabilirsiniz.
