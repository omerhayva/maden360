import { failure, fmt, readInputs, success } from './core/read';
import type { CalculatorDefinition, FormValues, ResultItem } from './core/types';
import { DENSITY_UNITS, LENGTH_UNITS, densityPlausibility } from './core/units';

/* ------------------------------------------------------------------ */
/* Saf hesap fonksiyonları (birimler: m, m³, t/m³, t)                  */
/* ------------------------------------------------------------------ */

export type VolumeShape = 'dogrudan' | 'prizma' | 'koni' | 'ucgen-prizma' | 'silindir';

export interface ShapeDimensions {
  hacim?: number;
  uzunluk?: number;
  genislik?: number;
  yukseklik?: number;
  cap?: number;
  taban?: number;
}

function need(value: number | undefined, name: string): number {
  if (value === undefined || !Number.isFinite(value)) throw new Error(`Eksik boyut: ${name}`);
  return value;
}

/** Geometrik şekle göre hacim (m³) */
export function shapeVolume(shape: VolumeShape, d: ShapeDimensions): number {
  switch (shape) {
    case 'dogrudan':
      return need(d.hacim, 'hacim');
    case 'prizma':
      return (
        need(d.uzunluk, 'uzunluk') * need(d.genislik, 'genislik') * need(d.yukseklik, 'yukseklik')
      );
    case 'koni':
      return (Math.PI * need(d.cap, 'cap') ** 2 * need(d.yukseklik, 'yukseklik')) / 12;
    case 'ucgen-prizma':
      return (
        0.5 * need(d.taban, 'taban') * need(d.yukseklik, 'yukseklik') * need(d.uzunluk, 'uzunluk')
      );
    case 'silindir':
      return (Math.PI * need(d.cap, 'cap') ** 2 * need(d.yukseklik, 'yukseklik')) / 4;
  }
}

/** T = V × ρ */
export function tonnageFromVolume(volumeM3: number, densityTPerM3: number): number {
  return volumeM3 * densityTPerM3;
}

/** Yaş baza göre nem: T_kuru = T × (1 − w/100) */
export function dryTonnage(wetTonnes: number, moisturePercent: number): number {
  return wetTonnes * (1 - moisturePercent / 100);
}

/** V_gevşek = V_yerinde × (1 + s/100) */
export function looseFromBank(bankM3: number, swellPercent: number): number {
  return bankM3 * (1 + swellPercent / 100);
}

/** V_yerinde = V_gevşek / (1 + s/100) */
export function bankFromLoose(looseM3: number, swellPercent: number): number {
  return looseM3 / (1 + swellPercent / 100);
}

/* ------------------------------------------------------------------ */
/* Hesaplayıcı tanımı                                                  */
/* ------------------------------------------------------------------ */

const shapeIs =
  (...shapes: VolumeShape[]) =>
  (values: FormValues) =>
    shapes.includes(values.sekil as VolumeShape);

const lengthField = (id: string, label: string, symbol: string, shapes: VolumeShape[]) =>
  ({
    kind: 'number',
    id,
    label,
    symbol,
    units: LENGTH_UNITS,
    min: 0,
    minExclusive: true,
    visibleWhen: shapeIs(...shapes),
  }) as const;

const shapeLabels: Record<VolumeShape, string> = {
  dogrudan: 'doğrudan girilen',
  prizma: 'dikdörtgen prizma',
  koni: 'konik yığın',
  'ucgen-prizma': 'üçgen kesitli uzun yığın',
  silindir: 'silindir',
};

export const tonajHacim: CalculatorDefinition = {
  slug: 'tonaj-hacim',
  version: '1.0.0',
  sections: [
    {
      id: 'hacim',
      title: 'Hacim',
      description: 'Hacmi biliyorsanız doğrudan girin ya da geometrik şekli seçip ölçüleri girin.',
      fields: [
        {
          kind: 'choice',
          id: 'sekil',
          label: 'Hacim nasıl belirlenecek?',
          layout: 'cards',
          defaultValue: 'prizma',
          options: [
            {
              value: 'dogrudan',
              label: 'Hacmi biliyorum',
              hint: 'Ölçüm veya modelden gelen hacim (m³)',
            },
            {
              value: 'prizma',
              label: 'Dikdörtgen prizma',
              hint: 'Blok, basamak dilimi, havuz: L × W × H',
            },
            { value: 'koni', label: 'Konik yığın', hint: 'Stok yığını: π·D²·H / 12' },
            {
              value: 'ucgen-prizma',
              label: 'Üçgen kesitli uzun yığın',
              hint: 'Uzun stok/set: ½·b·H·L',
            },
            { value: 'silindir', label: 'Silindir', hint: 'Silo, bunker, tank: π·D²·H / 4' },
          ],
        },
        {
          kind: 'number',
          id: 'hacim',
          label: 'Hacim (V)',
          symbol: 'V',
          unit: 'm³',
          min: 0,
          minExclusive: true,
          visibleWhen: shapeIs('dogrudan'),
        },
        lengthField('uzunluk', 'Uzunluk (L)', 'L', ['prizma', 'ucgen-prizma']),
        lengthField('genislik', 'Genişlik (W)', 'W', ['prizma']),
        lengthField('taban', 'Kesit taban genişliği (b)', 'b', ['ucgen-prizma']),
        lengthField('cap', 'Taban çapı (D)', 'D', ['koni', 'silindir']),
        lengthField('yukseklik', 'Yükseklik (H)', 'H', [
          'prizma',
          'koni',
          'ucgen-prizma',
          'silindir',
        ]),
      ],
    },
    {
      id: 'yogunluk',
      title: 'Yoğunluk ve hacim bazı',
      description:
        'Yoğunluk, hacimle aynı bazda olmalıdır: yerinde hacim için yerinde yoğunluk, gevşek hacim için gevşek yoğunluk.',
      fields: [
        {
          kind: 'choice',
          id: 'baz',
          label: 'Hacim bazı',
          layout: 'segmented',
          defaultValue: 'yerinde',
          options: [
            { value: 'yerinde', label: 'Yerinde (sağlam)', hint: 'Kazılmamış malzeme' },
            { value: 'gevsek', label: 'Gevşek (kazılmış)', hint: 'Kazılmış veya yığılmış malzeme' },
          ],
        },
        {
          kind: 'number',
          id: 'yogunluk',
          label: 'Yoğunluk (ρ)',
          symbol: 'ρ',
          units: DENSITY_UNITS,
          min: 0,
          minExclusive: true,
          help: 'Laboratuvar veya saha ölçümüyle belirlenmiş, seçilen baza karşılık gelen yoğunluk.',
        },
      ],
    },
    {
      id: 'duzeltmeler',
      title: 'İsteğe bağlı düzeltmeler',
      description: 'Boş bırakılabilir. Değerler ölçüm veya deneyle belirlenmiş olmalıdır.',
      fields: [
        {
          kind: 'number',
          id: 'kabarma',
          label: 'Kabarma oranı (s)',
          symbol: 's',
          unit: '%',
          optional: true,
          min: 0,
          help: 'Kazı sonrası hacim artışı. Girilirse diğer bazdaki hacim de hesaplanır.',
        },
        {
          kind: 'number',
          id: 'nem',
          label: 'Nem oranı (w, yaş baza göre)',
          symbol: 'w',
          unit: '%',
          optional: true,
          min: 0,
          max: 100,
          maxExclusive: true,
          help: 'Girilirse kuru tonaj hesaplanır. Yoğunluğun nemli (doğal) malzemeye ait olduğu varsayılır.',
        },
      ],
    },
  ],
  formulas: [
    {
      id: 'tonaj',
      label: 'Tonaj',
      tex: 'T = V \\times \\rho',
      legend: [
        { symbol: 'T', meaning: 'Kütle (tonaj)', unit: 't' },
        { symbol: 'V', meaning: 'Hacim', unit: 'm³' },
        { symbol: '\\rho', meaning: 'Hacimle aynı bazdaki yoğunluk', unit: 't/m³' },
      ],
    },
    {
      id: 'hacimler',
      label: 'Geometrik hacimler',
      tex: 'V_{\\text{prizma}} = L\\,W\\,H \\qquad V_{\\text{koni}} = \\frac{\\pi D^2 H}{12} \\qquad V_{\\text{üçgen}} = \\tfrac{1}{2}\\,b\\,H\\,L \\qquad V_{\\text{silindir}} = \\frac{\\pi D^2 H}{4}',
      legend: [
        { symbol: 'L, W, H', meaning: 'Uzunluk, genişlik, yükseklik', unit: 'm' },
        { symbol: 'D', meaning: 'Taban çapı', unit: 'm' },
        { symbol: 'b', meaning: 'Üçgen kesitin taban genişliği', unit: 'm' },
      ],
    },
    {
      id: 'kabarma',
      label: 'Kabarma',
      tex: 'V_{g} = V_{y} \\times \\left(1 + \\frac{s}{100}\\right) \\qquad K_F = 1 + \\frac{s}{100}',
      legend: [
        { symbol: 'V_g', meaning: 'Gevşek hacim', unit: 'm³' },
        { symbol: 'V_y', meaning: 'Yerinde hacim', unit: 'm³' },
        { symbol: 's', meaning: 'Kabarma oranı', unit: '%' },
        { symbol: 'K_F', meaning: 'Kabarma faktörü', unit: '—' },
      ],
    },
    {
      id: 'kuru',
      label: 'Kuru tonaj',
      tex: 'T_{\\text{kuru}} = T \\times \\left(1 - \\frac{w}{100}\\right)',
      legend: [{ symbol: 'w', meaning: 'Nem oranı (yaş baza göre)', unit: '%' }],
    },
  ],
  assumptions: [
    'Malzeme, seçilen geometrik şekle uygun ve hacim boyunca homojen kabul edilir.',
    'Yoğunluk, hacimle aynı bazdadır: yerinde hacim × yerinde yoğunluk veya gevşek hacim × gevşek yoğunluk.',
    'Kabarma oranı tek bir ortalama değer olarak uygulanır; kazı yöntemi ve parça boyutuna göre değişebilir.',
    'Nem oranı yaş baza göredir (suyun kütlesi / nemli malzemenin kütlesi).',
  ],
  limitations: [
    'Düzensiz yığın ve kazı hacimleri için basit şekiller yalnızca yaklaşık sonuç verir; kesin hacim için topoğrafik ölçüm (ör. yüzey modeli karşılaştırması) gerekir.',
    'Üçgen kesitli uzun yığında eğimli uç kısımlar hesaba katılmaz.',
    'Sonuç, yoğunluk değerinin doğruluğu kadar güvenilirdir; yoğunluk numune ve ölçüm yöntemine göre değişir.',
  ],
  example: {
    title: 'Basamak dilimi: 120 m × 40 m × 10 m, yerinde yoğunluk 2,65 t/m³, kabarma %40',
    values: {
      sekil: 'prizma',
      uzunluk: '120',
      genislik: '40',
      yukseklik: '10',
      baz: 'yerinde',
      yogunluk: '2,65',
      kabarma: '40',
    },
  },
  compute(rawValues) {
    const read = readInputs(tonajHacim, rawValues);
    if (!read.ok) return read.failure;
    const { input } = read;

    const shape = input.choice('sekil') as VolumeShape;
    const basis = input.choice('baz');
    const basisLabel = basis === 'yerinde' ? 'yerinde' : 'gevşek';
    const density = input.num('yogunluk');
    const swell = input.opt('kabarma');
    const moisture = input.opt('nem');

    const plausibility = densityPlausibility(density, 'Yoğunluk', (v) => fmt(v, 3));
    if (plausibility.error) return failure({ yogunluk: plausibility.error });

    const dims: ShapeDimensions = {
      hacim: input.opt('hacim'),
      uzunluk: input.opt('uzunluk'),
      genislik: input.opt('genislik'),
      yukseklik: input.opt('yukseklik'),
      cap: input.opt('cap'),
      taban: input.opt('taban'),
    };
    const volume = shapeVolume(shape, dims);
    const tonnes = tonnageFromVolume(volume, density);

    const steps: string[] = [];
    const warnings: string[] = [];
    const interpretation: string[] = [];
    const results: ResultItem[] = [];

    // Birim dönüşümleri
    const conversions: string[] = [];
    for (const id of ['uzunluk', 'genislik', 'taban', 'cap', 'yukseklik'] as const) {
      const enteredValue = input.entered(id);
      if (enteredValue !== undefined && input.unitId(id) === 'cm') {
        conversions.push(`${fmt(enteredValue)} cm = ${fmt(input.num(id))} m`);
      }
    }
    if (input.unitId('yogunluk') === 'kg-m3') {
      conversions.push(`${fmt(input.entered('yogunluk')!)} kg/m³ = ${fmt(density, 4)} t/m³`);
    }
    if (conversions.length > 0) steps.push(`Birim dönüşümü: ${conversions.join('; ')}`);

    const m = (value: number | undefined) => `${fmt(value!)} m`;
    switch (shape) {
      case 'prizma':
        steps.push(
          `V = L × W × H = ${m(dims.uzunluk)} × ${m(dims.genislik)} × ${m(dims.yukseklik)} = ${fmt(volume)} m³`,
        );
        break;
      case 'koni':
        steps.push(
          `V = π × D² × H / 12 = π × (${m(dims.cap)})² × ${m(dims.yukseklik)} / 12 = ${fmt(volume)} m³`,
        );
        break;
      case 'ucgen-prizma':
        steps.push(
          `V = ½ × b × H × L = 0,5 × ${m(dims.taban)} × ${m(dims.yukseklik)} × ${m(dims.uzunluk)} = ${fmt(volume)} m³`,
        );
        break;
      case 'silindir':
        steps.push(
          `V = π × D² × H / 4 = π × (${m(dims.cap)})² × ${m(dims.yukseklik)} / 4 = ${fmt(volume)} m³`,
        );
        break;
      case 'dogrudan':
        steps.push(`V = ${fmt(volume)} m³ (doğrudan girildi)`);
        break;
    }
    steps.push(`T = V × ρ = ${fmt(volume)} m³ × ${fmt(density, 4)} t/m³ = ${fmt(tonnes)} t`);

    if (shape !== 'dogrudan') {
      results.push({ id: 'hacim', label: `Hacim (${basisLabel})`, value: volume, unit: 'm³' });
    }
    results.push({
      id: 'tonaj',
      label: moisture !== undefined ? 'Tonaj (doğal/nemli)' : 'Tonaj',
      value: tonnes,
      unit: 't',
      emphasis: true,
    });

    interpretation.push(
      `${shapeLabels[shape].charAt(0).toLocaleUpperCase('tr-TR')}${shapeLabels[shape].slice(1)} hacim (${fmt(volume)} m³, ${basisLabel}) ve ${fmt(density, 4)} t/m³ yoğunlukla malzemenin kütlesi yaklaşık ${fmt(tonnes)} ton.`,
    );

    if (moisture !== undefined) {
      const dry = dryTonnage(tonnes, moisture);
      steps.push(
        `T_kuru = T × (1 − w/100) = ${fmt(tonnes)} t × (1 − ${fmt(moisture)}/100) = ${fmt(dry)} t`,
      );
      results.push({ id: 'kuruTonaj', label: 'Kuru tonaj', value: dry, unit: 't' });
      interpretation.push(
        `%${fmt(moisture)} nemle bu kütlenin yaklaşık ${fmt(tonnes - dry)} tonu sudur; kuru tonaj ${fmt(dry)} ton.`,
      );
      if (moisture > 50) {
        warnings.push('Nem oranı %50’nin üzerinde; değerin yaş baza göre girildiğinden emin olun.');
      }
    }

    if (swell !== undefined) {
      const factor = 1 + swell / 100;
      results.push({
        id: 'kabarmaFaktoru',
        label: 'Kabarma faktörü',
        value: factor,
        unit: '',
        digits: 3,
      });
      if (basis === 'yerinde') {
        const loose = looseFromBank(volume, swell);
        steps.push(
          `V_gevşek = V × (1 + s/100) = ${fmt(volume)} m³ × ${fmt(factor, 3)} = ${fmt(loose)} m³`,
        );
        results.push({
          id: 'digerHacim',
          label: 'Gevşek hacim (kazı sonrası)',
          value: loose,
          unit: 'm³',
        });
        interpretation.push(
          `Kazıldıktan sonra malzeme yaklaşık ${fmt(loose)} m³ gevşek hacim kaplar. Kamyon, bunker ve döküm alanı planlamasında bu hacim kullanılmalı; kütle (tonaj) değişmez.`,
        );
      } else {
        const bank = bankFromLoose(volume, swell);
        steps.push(
          `V_yerinde = V / (1 + s/100) = ${fmt(volume)} m³ / ${fmt(factor, 3)} = ${fmt(bank)} m³`,
        );
        results.push({
          id: 'digerHacim',
          label: 'Yerinde hacim (kazı öncesi)',
          value: bank,
          unit: 'm³',
        });
        interpretation.push(
          `Bu gevşek hacim, kazı öncesinde yaklaşık ${fmt(bank)} m³ yerinde hacme karşılık gelir.`,
        );
      }
      if (swell > 100) {
        warnings.push(
          'Kabarma oranı %100’ün üzerinde; olağan dışı yüksek bir değer, ölçümü kontrol edin.',
        );
      }
    }

    if (plausibility.warning) warnings.push(plausibility.warning);

    return success({ results, steps, interpretation, warnings });
  },
};
