# Hesaplayıcı geliştirme rehberi

Hesaplayıcılar platformun ana ürünüdür. Her biri arayüzden bağımsız, saf TypeScript ile yazılır ve
bilinen örneklerle test edilir. Arayüz (form, sonuç paneli, formül listesi, girdi tablosu) tanımdan
otomatik üretilir; yeni bir hesaplayıcı için arayüz kodu yazmanız gerekmez.

## Dosyalar

| Dosya | İçerik |
|---|---|
| `src/calculators/<slug>.ts` | Tanım: alanlar, formüller, varsayımlar, sınırlar, örnek, `compute` |
| `src/calculators/<slug>.test.ts` | Bilinen örnek testleri ve hata durumları |
| `src/calculators/registry.ts` | Kayıt (yeni motoru buraya ekleyin) |
| `content/hesaplamalar/<slug>.md` | Açıklama sayfası: kullanım, çözümlü örnek, sık hatalar, kaynaklar |

## Tanımın yapısı

```ts
export const ornekHesap: CalculatorDefinition = {
  slug: 'ornek-hesap',
  version: '1.0.0',          // formül veya doğrulama değişince artırın
  sections: [...],           // girdi alanları (bölümler hâlinde)
  formulas: [...],           // KaTeX ifadeleri ve sembol açıklamaları
  assumptions: [...],        // geçerlilik varsayımları
  limitations: [...],        // kullanım sınırları
  example: { title, values },// "Örnek değerleri doldur" düğmesi ve testler için
  compute(values) { ... },   // saf fonksiyon: metin girdiler → sonuç veya hata
};
```

### Alan türleri

- **Sayı alanı** (`kind: 'number'`): `units` ile seçilebilir birimler (çarpanla temel birime çevrilir)
  veya sabit `unit`; `min`/`max` (temel birimde), `minExclusive`, `integer`, `optional`, `help`.
  Özel hata mesajı için `messages: { min: '...' }`.
- **Seçim alanı** (`kind: 'choice'`): `options`, `defaultValue`, `layout: 'segmented' | 'cards'`.
- `visibleWhen(values)` ile alanlar ve bölümler koşullu gösterilir; gizli alanlar doğrulanmaz.

### `compute` yazarken

1. `readInputs(definition, values)` ile girdileri okuyun. Eksik, geçersiz ve aralık dışı değerler bu
   adımda alan hatası olarak döner.
2. Alanlar arası kuralları kontrol edin ve `failure(alanHataları, formHataları)` döndürün
   (ör. konsantre > besleme, 24 saati aşan vardiya, farklı bazlarda dekapaj).
3. Hesabı `src/calculators/<slug>.ts` içindeki **ayrı, dışa aktarılmış saf fonksiyonlarla** yapın
   (birim testleri bunları doğrudan çağırır).
4. `success({ results, steps, interpretation, warnings })` döndürün:
   - `results`: tam olarak bir tanesi `emphasis: true` olan sonuçlar,
   - `steps`: değerlerin yerine konduğu adım adım hesap,
   - `interpretation`: sonucun sade Türkçe yorumu,
   - `warnings`: hesabı engellemeyen ama dikkat gerektiren durumlar (olağan dışı yoğunluk vb.).

`compute` asla istisna fırlatmamalıdır; `registry.test.ts` her motoru rastgele ve hatalı girdilerle
400 kez çalıştırarak bunu doğrular.

## Ortak kurallar

- **Sayı biçimi:** Kullanıcı `2,65`, `2.65`, `1.250.000` veya `1 250` yazabilir (`core/number.ts`).
  Belirsiz yazımlar (`2.700`) ondalık okunur; arayüz "Okunan değer: 2,7" göstererek fark ettirir.
- **Birimler:** Dönüşümler `core/units.ts` içindeki çarpanlarla yapılır; adım listesinde gösterilir.
- **Baz karıştırma yok:** Ağırlık ve hacim bazı yalnızca yoğunlukla, açıkça dönüştürülür.
- **Makullük kontrolü:** Fiziksel olarak mümkün olmayan değerler (ör. 2.650 t/m³) hata; olağan dışı
  değerler uyarı olarak raporlanır (`densityPlausibility`).
- **Sıfıra bölme:** Paydaya giren her alan `min: 0, minExclusive: true` ile ve anlaşılır bir mesajla
  korunur.

## Test

Her hesaplayıcı için en az şunlar test edilir:

- Elle doğrulanmış en az bir **bilinen örnek** (tercihen kaynaktaki çözümlü örnek),
- Birim dönüşümleri,
- Eksik, geçersiz, negatif ve sıfır girdiler,
- Alanlar arası tutarlılık hataları,
- Uyarı üreten sınır durumlar.

```powershell
npm test                 # tüm testler
npm run test:watch       # geliştirirken izleme modu
```

## Sürüm politikası

`version` alanı sayfada "Hesap motoru sürüm x.y.z" olarak görünür:

- **Yama (1.0.x):** Metin, yorum veya uyarı ifadesi değişiklikleri.
- **Küçük (1.x.0):** Yeni isteğe bağlı girdi veya sonuç; mevcut sonuçlar değişmez.
- **Büyük (x.0.0):** Formül, varsayım veya doğrulama kuralı değişikliği; aynı girdiler farklı sonuç verebilir.
  Büyük değişikliklerde açıklama sayfasının `corrections` alanına not eklenir.

## Güvenlikle ilişkili hesaplayıcılar

Havalandırma, tahkimat, patlatma ve İSG ile ilgili hesaplayıcılar:

- Yalnızca eğitim ve ön değerlendirme amaçlı olarak, açık uyarılarla yayımlanır,
- İlgili mevzuat ve standarda atıf yapar (tam metni kopyalamadan),
- Konusunda yetkin bir kişinin teknik incelemesi olmadan yayımlanmaz,
- Sahada doğrudan kontrol veya güvenlik kararı vermek için tasarlanmaz.

Planlanan hesaplayıcılar `src/config/roadmap.ts` dosyasında listelenir.
