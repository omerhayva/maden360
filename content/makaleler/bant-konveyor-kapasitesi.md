---
title: "Bant konveyör kapasitesi: teorik ve fiili kapasite"
summary: Bant konveyörlerde taşıma kapasitesinin temel ilişkisi, kapasiteyi belirleyen etkenler ve teorik kapasite ile sahadaki fiili kapasite arasındaki fark.
category: nakliyat
tags: [ekipman, planlama, verimlilik]
keywords: [bant konveyör, konveyör kapasitesi, belt conveyor capacity, bant hızı, yük kesit alanı, oluk açısı, yığın yoğunluğu, ton/saat, nakliyat]
relatedCalculators: [tonaj-hacim, vardiya-performansi]
relatedTerms: [bant-konveyor, kullanilabilirlik]
relatedArticles: [vardiya-ve-ekipman-performansi, tonaj-hacim-ve-yogunluk]
status: review
authors: [maden360-editorluk]
aiAssisted: true
sources:
  - id: cema-2014
    note: Bant konveyör kapasitesi, yük kesit alanı, bant hızı ve tasarım esasları.
  - id: sme-handbook-2011
    note: Madencilikte malzeme taşıma sistemleri ve bant konveyörler.
  - id: maden-yonetmeligi-2022
    locator: Madde 4 (a)
    note: Bant konveyörün altyapı tesisleri arasında sayılması.
---

Bant konveyörler; ocak içi taşımadan kırma–eleme tesislerine, stok sahalarından yükleme limanlarına kadar madenciliğin pek çok aşamasında sürekli ve yüksek kapasiteli taşıma sağlar. Maden Yönetmeliği bant konveyörleri madencilik faaliyetleri için zorunlu altyapı tesisleri arasında sayar [@maden-yonetmeligi-2022].

## Temel kapasite ilişkisi

Bir bant konveyörün kütlesel taşıma kapasitesi; bant üzerindeki yükün kesit alanı, bant hızı ve malzemenin yığın (gevşek) yoğunluğu ile belirlenir [@cema-2014]:

$$
Q = 3600 \times A \times v \times \rho_g
$$

| Sembol | Anlamı | Birim |
|---|---|---|
| Q | Kütlesel kapasite | t/sa |
| A | Bant üzerindeki yükün kesit alanı | m² |
| v | Bant hızı | m/s |
| ρ_g | Malzemenin yığın (gevşek) yoğunluğu | t/m³ |

Örneğin yük kesit alanı 0,10 m², bant hızı 2,5 m/s ve yığın yoğunluğu 1,6 t/m³ ise teorik kapasite 3600 × 0,10 × 2,5 × 1,6 = **1.440 t/sa** olur.

## Kesit alanını belirleyen etkenler

Yük kesit alanı tek başına bant genişliğine bağlı değildir. Aşağıdaki etkenler birlikte belirler [@cema-2014]:

- **Bant genişliği** ve bant kenarında bırakılan serbest pay,
- **Oluk (taşıyıcı makara) açısı:** Makaraların oluşturduğu çukur ne kadar derinse kesit alanı o kadar büyür,
- **Yığılma açısı:** Malzemenin hareket eden bant üzerinde aldığı eğim; malzemenin akışkanlığına bağlıdır,
- **Konveyör eğimi:** Eğim arttıkça taşınabilecek kesit küçülür ve malzemenin geri kayma riski artar.

Bu değerler malzeme özelliklerine ve tasarım standartlarına göre seçilir; tasarım, ilgili standart ve üretici verileriyle yapılmalıdır.

## Teorik ve fiili kapasite

Yukarıdaki formül, bandın sürekli ve tam dolu yüklendiği **teorik** kapasiteyi verir. Sahadaki **fiili** kapasite genellikle daha düşüktür, çünkü [@sme-handbook-2011]:

- Besleme düzensizdir; bant her zaman tam dolu yüklenmez,
- Konveyör bakım, arıza ve beklemeler nedeniyle her zaman çalışmaz (kullanılabilirlik ve kullanım oranı),
- Önceki veya sonraki ekipman (kırıcı, elek, yükleyici) sistemin darboğazı olabilir,
- Malzemenin nemi ve parça boyu dağılımı yükleme koşullarını değiştirir.

Bu nedenle planlamada teorik kapasite ile fiili kapasite **ayrı ayrı** gösterilmeli; fiili kapasite, ölçülmüş çalışma süreleri ve kantar verileriyle doğrulanmalıdır.

## Dikkat

Bu sayfa eğitim ve ön değerlendirme amaçlıdır. Bant genişliği, hız, motor gücü, bant gerilmesi ve güvenlik donanımlarının belirlenmesi; ilgili standartlar, üretici verileri ve yetkili mühendis değerlendirmesiyle yapılmalıdır. Kapasite ile ilgili ilk hesaplar için yığın yoğunluğunu ve gevşek hacmi [tonaj–hacim hesaplayıcısı](/hesaplamalar/tonaj-hacim) ile kontrol edebilirsiniz.
