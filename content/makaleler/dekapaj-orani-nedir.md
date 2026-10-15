---
title: Dekapaj oranı nedir ve nasıl hesaplanır?
summary: Dekapaj oranının tanımı, ağırlık ve hacim bazında hesaplanması, ortalama ve başa baş oran kavramları ile sık yapılan hatalar.
category: uretim-planlama
tags: [acik-ocak, planlama, temel-kavramlar, birim-donusumu]
keywords: [dekapaj oranı, örtü kazı oranı, stripping ratio, pasa cevher oranı, başa baş dekapaj oranı, break-even stripping ratio, açık ocak]
relatedCalculators: [dekapaj-orani, tonaj-hacim]
relatedTerms: [dekapaj, dekapaj-orani, pasa, yerinde-yogunluk, kabarma-faktoru, acik-ocak]
relatedArticles: [tonaj-hacim-ve-yogunluk, acik-ocak-ve-yeralti-yontemleri]
featured: true
status: review
authors: [maden360-editorluk]
aiAssisted: true
sources:
  - id: hustrulid-2013
    note: Dekapaj oranı tanımları; ortalama, anlık ve başa baş dekapaj oranı; ocak sınırı analizi.
  - id: sme-handbook-2011
    note: Açık ocak madenciliğinde örtü kazısı ve dekapaj oranının planlamadaki yeri.
  - id: maden-yonetmeligi-2022
    locator: Madde 4 (aaa)
    note: Pasanın mevzuattaki tanımı.
  - id: hartman-mutmansky-2002
    note: Yüzey madenciliği yöntemleri ve örtü kazısı kavramı.
---

Açık işletmelerde cevhere ulaşmak için üzerindeki ve çevresindeki ekonomik değeri olmayan malzemenin kaldırılması gerekir. Bu işleme **dekapaj** (örtü kazısı), kaldırılan malzemeye de sahada genellikle **pasa** denir. Dekapaj oranı ise bir birim cevher için kaldırılması gereken pasa miktarını gösterir ve açık ocak planlamasının en temel göstergelerinden biridir [@hustrulid-2013].

## Tanım ve formül

Dekapaj oranı (DO), aynı alan ve dönem için kaldırılan pasa miktarının üretilen cevher miktarına oranıdır:

$$
DO = \frac{\text{Pasa miktarı}}{\text{Cevher miktarı}}
$$

Örneğin 450.000 t pasa kaldırılarak 100.000 t cevher üretilmişse dekapaj oranı 4,5 t/t'dir. Bu, "her 1 ton cevher için 4,5 ton pasa" anlamına gelir ve **4,5 : 1 (pasa : cevher)** biçiminde de yazılabilir.

Mevzuatta pasa, "mevcut ekonomik ve teknik şartlara göre işletilmesi mümkün olmayan, ancak işletme gereği istihsal edilen madde" olarak tanımlanır [@maden-yonetmeligi-2022]. Bu tanım, bugün ekonomik olmayan bir malzemenin şartlar değiştiğinde değerlendirilebileceğini de hatırlatır.

## Baz neden önemli?

Dekapaj oranı ağırlık bazında (t/t) veya yerinde hacim bazında (m³/m³) hesaplanabilir. Pasa ve cevherin yoğunlukları genellikle farklı olduğu için **iki oran aynı değildir**:

| Büyüklük | Pasa | Cevher | Oran |
|---|---|---|---|
| Yerinde hacim | 1.800.000 m³ | 300.000 m³ | 6,0 m³/m³ |
| Yoğunluk | 2,5 t/m³ | 3,0 t/m³ | — |
| Kütle | 4.500.000 t | 900.000 t | 5,0 t/t |

Aynı ocak için 5,0 ve 6,0 gibi iki farklı değer elde edilir. Bu nedenle oran raporlanırken bazı mutlaka belirtilmeli ve farklı bazlar birbirine karıştırılmamalıdır. Bazı sektörlerde (ör. kömür) oran m³/t gibi karma bir birimle de ifade edilebilir; bu tür değerler başka bazdaki oranlarla doğrudan karşılaştırılmamalıdır [@sme-handbook-2011].

Hacim kullanılıyorsa **yerinde (sağlam) hacim** esas alınmalıdır. Kamyon sayımı gibi yöntemlerle elde edilen gevşek hacim, kabarma düzeltmesi yapılmadan yerinde hacimle karşılaştırılamaz.

## Ortalama, anlık ve başa baş oran

Planlamada farklı amaçlar için farklı dekapaj oranları kullanılır [@hustrulid-2013]:

- **Ortalama (toplam) dekapaj oranı:** Ocak ömrü veya bir plan dönemi boyunca kaldırılacak toplam pasanın toplam cevhere oranı.
- **Anlık dekapaj oranı:** Ocağın belirli bir aşamasında, kısa bir dönem için gerçekleşen oran. Ocak geliştikçe değişir.
- **Başa baş (ekonomik sınır) dekapaj oranı:** Bir birim cevherden elde edilen kârın, o cevhere ulaşmak için gereken pasa kazısının maliyetini tam karşıladığı oran. Ocak sınırlarının belirlenmesinde kullanılır.

Başa baş oran, cevher fiyatı, kazanım, üretim ve kazı maliyetleri gibi ekonomik girdilere bağlıdır; bu nedenle bu platformdaki [dekapaj oranı hesaplayıcısı](/hesaplamalar/dekapaj-orani) yalnızca ortalama oranı hesaplar ve ekonomik sınır kararı için tek başına kullanılmamalıdır.

## Sık yapılan hatalar

1. **Baz karıştırmak:** Pasayı m³, cevheri t olarak alıp doğrudan bölmek.
2. **Gevşek ve yerinde hacmi karıştırmak:** Kabarma nedeniyle gevşek hacim yerinde hacimden büyüktür.
3. **Farklı kapsam:** Pasa ve cevher miktarlarının farklı dönemleri veya alanları kapsaması.
4. **Oranı tek başına yorumlamak:** Düşük dekapaj oranı her zaman daha ekonomik bir ocak anlamına gelmez; tenör, kazanım ve maliyetlerle birlikte değerlendirilmelidir [@hartman-mutmansky-2002].

## Hızlı hesap

Pasa ve cevher miktarlarını farklı birimlerde bile girerek oranı her iki bazda görmek için [dekapaj oranı hesaplayıcısını](/hesaplamalar/dekapaj-orani), hacim–tonaj dönüşümleri için [tonaj–hacim hesaplayıcısını](/hesaplamalar/tonaj-hacim) kullanabilirsiniz.
