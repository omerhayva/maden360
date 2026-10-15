---
title: Vardiya üretimi ve ekipman performans göstergeleri
summary: Vardiya bazlı üretim takibi, hedef gerçekleşme ve duruş oranı ile ekipman kullanılabilirliği ve kullanım oranı gibi göstergelerin doğru tanımlanması.
category: uretim-planlama
tags: [planlama, verimlilik, ekipman]
keywords: [vardiya, vardiya hedefi, kullanılabilirlik, availability, kullanım oranı, utilization, duruş, zaman sınıflandırması, KPI, performans göstergesi]
relatedCalculators: [vardiya-performansi]
relatedTerms: [vardiya, kullanilabilirlik]
relatedArticles: [bant-konveyor-kapasitesi, dekapaj-orani-nedir]
status: review
authors: [maden360-editorluk]
aiAssisted: true
sources:
  - id: maden-yonetmeligi-2022
    locator: Madde 4 (ttt)
    note: Vardiyanın mevzuattaki tanımı.
  - id: gmg-zaman-siniflandirma-2020
    note: Yüzey madenciliğinde mobil ekipman için standart zaman sınıflandırması ve performans göstergeleri.
  - id: hustrulid-2013
    note: Makine kullanılabilirliği ve kullanım oranı kavramları.
  - id: sme-handbook-2011
    note: Ekipman seçimi ve üretim planlamasında verimlilik kavramları.
---

Üretimin hedefe göre nasıl gittiğini izlemek, madencilikte günlük yönetimin temelidir. Basit görünen "bugün kaç ton ürettik?" sorusu, hedeflerle, çalışma süreleriyle ve ekipman durumuyla birlikte değerlendirildiğinde anlam kazanır.

## Vardiya

Maden Yönetmeliği vardiyayı, İş Kanunu'nda yer alan çalışma süresine uygun olarak **yirmi dört saat içerisinde çalışmanın yapıldığı zaman dilimi** olarak tanımlar [@maden-yonetmeligi-2022]. Günlük planlı çalışma süresi, vardiya sayısı ile vardiya süresinin çarpımıdır ve 24 saati aşamaz.

## Günlük takip göstergeleri

| Gösterge | Hesap | Ne anlatır? |
|---|---|---|
| Günlük üretim | Vardiya üretimlerinin toplamı | Gün içinde üretilen toplam miktar |
| Hedef gerçekleşme | Üretim / hedef × 100 | Hedefin ne kadarının karşılandığı |
| Duruş oranı | Duruş süresi / planlı süre × 100 | Planlı sürenin ne kadarının üretimsiz geçtiği |
| Saatlik üretim | Üretim / çalışma süresi | Üretim hızı; planlı veya net süreye göre |
| Gereken vardiya üretimi | (Dönem hedefi − gerçekleşen) / kalan vardiya | Hedefe ulaşmak için gereken ortalama tempo |

Bu göstergeler hızlı bir durum fotoğrafı verir. Ancak duruşun nedenini (arıza, bakım, malzeme beklemesi, hava koşulları vb.) göstermezler.

## Ekipman zaman sınıflandırması

Ekipman performansını doğru ölçmek için takvim süresinin standart kategorilere ayrılması gerekir. Genel yaklaşımda takvim süresi; bakım ve arıza nedeniyle ekipmanın **kullanılamadığı** süre ile **kullanılabilir** süreye ayrılır. Kullanılabilir süre de ekipmanın fiilen çalıştığı süre ile çalışabilir durumda olduğu hâlde **beklemede** geçirdiği süreye bölünür. Çalışma süresi içinde de operasyonel gecikmeler ayrıca izlenebilir [@gmg-zaman-siniflandirma-2020].

Bu sınıflandırmadan türetilen iki temel gösterge şunlardır [@hustrulid-2013]:

- **Kullanılabilirlik (availability):** Ekipmanın çalışmaya hazır olduğu sürenin toplam süreye oranı. Bakım organizasyonunun ve ekipman güvenilirliğinin göstergesidir.
- **Kullanım oranı (utilization):** Kullanılabilir sürenin ne kadarında ekipmanın fiilen çalıştığı. Planlama, operatör ve organizasyon kaynaklı kayıpları gösterir.

Farklı işletmeler bu kavramları farklı tanımlayabildiği için göstergeler ancak **aynı tanımlar** kullanıldığında karşılaştırılabilir. Küresel madencilik sektöründe ortak tanımlar oluşturmak amacıyla yayımlanan zaman sınıflandırma çerçeveleri bu nedenle önemlidir [@gmg-zaman-siniflandirma-2020].

## Teorik ve fiili kapasite

Bir ekipmanın katalog veya hesapla bulunan teorik kapasitesi, sahadaki fiili üretimine eşit değildir. Fiili üretim; kullanılabilirlik, kullanım oranı, operatör ve iş organizasyonu verimi ile malzeme koşullarına bağlıdır [@sme-handbook-2011]. Planlamada bu iki kapasitenin ayrı gösterilmesi, gerçekçi olmayan hedeflerin önüne geçer.

## Uygulamada dikkat edilecekler

1. **Ölçüm yöntemini sabitleyin:** Kantar, kamyon sayımı ve topoğrafik ölçüm farklı sonuçlar verebilir; kamyon sayımına dayalı değerler düzenli olarak kantar verisiyle doğrulanmalıdır.
2. **Duruş nedenlerini kaydedin:** Toplam duruş süresi kadar duruşun nedeni de önemlidir.
3. **Hedefi gerçekçi kurun:** Dönem hedefi, kullanılabilirlik ve kullanım oranı varsayımlarıyla birlikte belirlenmelidir.

Günlük göstergeleri hesaplamak için [vardiya performansı hesaplayıcısını](/hesaplamalar/vardiya-performansi) kullanabilirsiniz.
