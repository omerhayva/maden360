import { failure, fmt, readInputs, success } from './core/read';
import type { CalculatorDefinition, ResultItem } from './core/types';
import { BASIS_UNITS, DENSITY_UNITS, densityPlausibility } from './core/units';

/* ------------------------------------------------------------------ */
/* Saf hesap fonksiyonları                                             */
/* ------------------------------------------------------------------ */

/**
 * Dekapaj oranı = pasa / cevher.
 * İki değer AYNI bazda olmalıdır (t/t veya m³/m³). Cevher sıfırsa oran tanımsızdır.
 */
export function strippingRatio(waste: number, ore: number): number {
  if (!(ore > 0)) throw new RangeError('Cevher miktarı sıfırdan büyük olmalı (sıfıra bölme).');
  if (waste < 0) throw new RangeError('Pasa miktarı negatif olamaz.');
  return waste / ore;
}

export type Basis = 't' | 'm3';

export interface Quantity {
  value: number;
  basis: Basis;
  /** Yerinde yoğunluk (t/m³); diğer baza dönüşüm için gerekir */
  density?: number;
}

/** Miktarı ağırlık (t) ve yerinde hacim (m³) bazlarına çevirir; yoğunluk yoksa diğer baz tanımsız kalır. */
export function toBases(q: Quantity): { tonnes?: number; cubicMetres?: number } {
  if (q.basis === 't') {
    return { tonnes: q.value, cubicMetres: q.density ? q.value / q.density : undefined };
  }
  return { cubicMetres: q.value, tonnes: q.density ? q.value * q.density : undefined };
}

/* ------------------------------------------------------------------ */
/* Hesaplayıcı tanımı                                                  */
/* ------------------------------------------------------------------ */

const basisNames: Record<Basis, string> = { t: 'ağırlık', m3: 'hacim' };

export const dekapajOrani: CalculatorDefinition = {
  slug: 'dekapaj-orani',
  version: '1.0.0',
  sections: [
    {
      id: 'miktarlar',
      title: 'Pasa ve cevher miktarları',
      description:
        'Hacim girecekseniz yerinde (sağlam) hacmi kullanın. Farklı bazlar karıştırılmaz: oran yalnızca t/t veya m³/m³ olarak hesaplanır.',
      fields: [
        {
          kind: 'number',
          id: 'pasa',
          label: 'Pasa (örtü) miktarı (P)',
          symbol: 'P',
          units: BASIS_UNITS,
          min: 0,
          help: 'Cevhere ulaşmak için kaldırılması gereken örtü ve ara kesmelerin toplamı.',
        },
        {
          kind: 'number',
          id: 'cevher',
          label: 'Cevher miktarı (C)',
          symbol: 'C',
          units: BASIS_UNITS,
          min: 0,
          minExclusive: true,
          messages: {
            min: 'Cevher miktarı sıfırdan büyük olmalı; sıfır olursa oran tanımsızdır (sıfıra bölme).',
          },
        },
      ],
    },
    {
      id: 'yogunluklar',
      title: 'Yerinde yoğunluklar',
      description:
        'Pasa ve cevher farklı birimlerde girildiyse dönüşüm için gereklidir. Aynı birimdeyse diğer bazdaki oranı da görmek için girebilirsiniz.',
      fields: [
        {
          kind: 'number',
          id: 'pasaYogunluk',
          label: 'Pasa yerinde yoğunluğu (ρp)',
          symbol: 'ρp',
          units: DENSITY_UNITS,
          optional: true,
          min: 0,
          minExclusive: true,
        },
        {
          kind: 'number',
          id: 'cevherYogunluk',
          label: 'Cevher yerinde yoğunluğu (ρc)',
          symbol: 'ρc',
          units: DENSITY_UNITS,
          optional: true,
          min: 0,
          minExclusive: true,
        },
      ],
    },
  ],
  formulas: [
    {
      id: 'agirlik',
      label: 'Ağırlık bazında',
      tex: 'DO_{t} = \\frac{P_t}{C_t} \\quad [\\text{t/t}]',
      legend: [
        { symbol: 'P_t', meaning: 'Pasa kütlesi', unit: 't' },
        { symbol: 'C_t', meaning: 'Cevher kütlesi', unit: 't' },
      ],
    },
    {
      id: 'hacim',
      label: 'Hacim bazında',
      tex: 'DO_{v} = \\frac{P_v}{C_v} \\quad [\\text{m}^3/\\text{m}^3]',
      legend: [
        { symbol: 'P_v', meaning: 'Pasa yerinde hacmi', unit: 'm³' },
        { symbol: 'C_v', meaning: 'Cevher yerinde hacmi', unit: 'm³' },
      ],
    },
    {
      id: 'donusum',
      label: 'Baz dönüşümü',
      tex: 'P_t = P_v \\times \\rho_p \\qquad C_v = \\frac{C_t}{\\rho_c}',
      legend: [
        { symbol: '\\rho_p', meaning: 'Pasa yerinde yoğunluğu', unit: 't/m³' },
        { symbol: '\\rho_c', meaning: 'Cevher yerinde yoğunluğu', unit: 't/m³' },
      ],
    },
  ],
  assumptions: [
    'Pasa ve cevher aynı bazda karşılaştırılır; ağırlık ve hacim bazları birbirine yalnızca yoğunlukla dönüştürülür.',
    'Hacimler yerinde (sağlam) hacimdir; yoğunluklar da yerinde yoğunluktur.',
    'Girilen miktarlar aynı alanı, aynı dönemi veya aynı tasarım aşamasını kapsar.',
  ],
  limitations: [
    'Bu araç ortalama (toplam) dekapaj oranını verir; anlık, artımlı veya başa baş (ekonomik sınır) dekapaj oranı ayrı analiz gerektirir.',
    'Ekonomik değerlendirme (maliyet, fiyat, kazanım) içermez; ocak sınırı kararı için tek başına kullanılmamalıdır.',
  ],
  example: {
    title: 'Pasa 1.800.000 m³ (yerinde), cevher 900.000 t; ρp = 2,5 t/m³, ρc = 3,0 t/m³',
    values: {
      pasa: '1800000',
      pasa_birim: 'm3',
      cevher: '900000',
      cevher_birim: 't',
      pasaYogunluk: '2,5',
      cevherYogunluk: '3',
    },
  },
  compute(rawValues) {
    const read = readInputs(dekapajOrani, rawValues);
    if (!read.ok) return read.failure;
    const { input } = read;

    const wasteBasis = (input.unitId('pasa') ?? 't') as Basis;
    const oreBasis = (input.unitId('cevher') ?? 't') as Basis;
    const wasteDensity = input.opt('pasaYogunluk');
    const oreDensity = input.opt('cevherYogunluk');
    const warnings: string[] = [];

    for (const [id, label, value] of [
      ['pasaYogunluk', 'Pasa yoğunluğu', wasteDensity],
      ['cevherYogunluk', 'Cevher yoğunluğu', oreDensity],
    ] as const) {
      if (value === undefined) continue;
      const check = densityPlausibility(value, label, (v) => fmt(v, 3));
      if (check.error) return failure({ [id]: check.error });
      if (check.warning) warnings.push(check.warning);
    }

    const waste = toBases({ value: input.num('pasa'), basis: wasteBasis, density: wasteDensity });
    const ore = toBases({ value: input.num('cevher'), basis: oreBasis, density: oreDensity });

    const ratioT =
      waste.tonnes !== undefined && ore.tonnes !== undefined
        ? strippingRatio(waste.tonnes, ore.tonnes)
        : undefined;
    const ratioV =
      waste.cubicMetres !== undefined && ore.cubicMetres !== undefined
        ? strippingRatio(waste.cubicMetres, ore.cubicMetres)
        : undefined;

    if (ratioT === undefined && ratioV === undefined) {
      return failure({}, [
        'Pasa ve cevher farklı birimlerde girildi. Farklı bazlar karıştırılmaz: oranı aynı bazda hesaplamak için pasa yoğunluğunu (ağırlık bazı için) veya cevher yoğunluğunu (hacim bazı için) girin.',
      ]);
    }

    const steps: string[] = [];
    if (wasteBasis === 'm3' && waste.tonnes !== undefined) {
      steps.push(
        `P_t = P_v × ρp = ${fmt(waste.cubicMetres!)} m³ × ${fmt(wasteDensity!, 3)} t/m³ = ${fmt(waste.tonnes)} t`,
      );
    }
    if (wasteBasis === 't' && waste.cubicMetres !== undefined) {
      steps.push(
        `P_v = P_t / ρp = ${fmt(waste.tonnes!)} t / ${fmt(wasteDensity!, 3)} t/m³ = ${fmt(waste.cubicMetres)} m³`,
      );
    }
    if (oreBasis === 'm3' && ore.tonnes !== undefined) {
      steps.push(
        `C_t = C_v × ρc = ${fmt(ore.cubicMetres!)} m³ × ${fmt(oreDensity!, 3)} t/m³ = ${fmt(ore.tonnes)} t`,
      );
    }
    if (oreBasis === 't' && ore.cubicMetres !== undefined) {
      steps.push(
        `C_v = C_t / ρc = ${fmt(ore.tonnes!)} t / ${fmt(oreDensity!, 3)} t/m³ = ${fmt(ore.cubicMetres)} m³`,
      );
    }
    if (ratioT !== undefined) {
      steps.push(
        `DO_t = P_t / C_t = ${fmt(waste.tonnes!)} t / ${fmt(ore.tonnes!)} t = ${fmt(ratioT, 3)} t/t`,
      );
    }
    if (ratioV !== undefined) {
      steps.push(
        `DO_v = P_v / C_v = ${fmt(waste.cubicMetres!)} m³ / ${fmt(ore.cubicMetres!)} m³ = ${fmt(ratioV, 3)} m³/m³`,
      );
    }

    // Girdilerin bazıyla aynı olan oran ana sonuç olarak vurgulanır
    const primary: Basis = wasteBasis === oreBasis ? wasteBasis : ratioT !== undefined ? 't' : 'm3';
    const results: ResultItem[] = [];
    if (ratioT !== undefined) {
      results.push({
        id: 'oranAgirlik',
        label: 'Dekapaj oranı (ağırlık bazında)',
        value: ratioT,
        unit: 't/t',
        digits: 2,
        emphasis: primary === 't',
      });
    }
    if (ratioV !== undefined) {
      results.push({
        id: 'oranHacim',
        label: 'Dekapaj oranı (hacim bazında)',
        value: ratioV,
        unit: 'm³/m³',
        digits: 2,
        emphasis: primary === 'm3',
      });
    }
    if (waste.tonnes !== undefined && ore.tonnes !== undefined) {
      results.push({
        id: 'toplamAgirlik',
        label: 'Toplam kazı (pasa + cevher)',
        value: waste.tonnes + ore.tonnes,
        unit: 't',
      });
    }
    if (waste.cubicMetres !== undefined && ore.cubicMetres !== undefined) {
      results.push({
        id: 'toplamHacim',
        label: 'Toplam kazı (yerinde hacim)',
        value: waste.cubicMetres + ore.cubicMetres,
        unit: 'm³',
      });
    }

    const interpretation: string[] = [];
    if (ratioT !== undefined) {
      interpretation.push(
        `Ağırlık bazında dekapaj oranı ${fmt(ratioT, 2)} : 1 (pasa : cevher) — her 1 ton cevher için yaklaşık ${fmt(ratioT, 2)} ton pasa kaldırılmalı.`,
      );
    }
    if (ratioV !== undefined) {
      interpretation.push(
        `Hacim bazında dekapaj oranı ${fmt(ratioV, 2)} : 1 — her 1 m³ cevher için yaklaşık ${fmt(ratioV, 2)} m³ pasa kaldırılmalı.`,
      );
    }
    if (ratioT !== undefined && ratioV !== undefined) {
      interpretation.push(
        'İki oran, pasa ve cevher yoğunlukları farklı olduğu için birbirinden farklıdır. Oranı raporlarken bazını (t/t veya m³/m³) mutlaka belirtin.',
      );
    } else {
      const missingBasis: Basis = ratioT === undefined ? 't' : 'm3';
      interpretation.push(
        `${basisNames[missingBasis].charAt(0).toLocaleUpperCase('tr-TR')}${basisNames[missingBasis].slice(1)} bazındaki oranı da görmek için yoğunlukları girin.`,
      );
    }
    if (input.num('pasa') === 0) {
      warnings.push('Pasa miktarı sıfır girildi; dekapaj oranı sıfırdır.');
    }

    return success({ results, steps, interpretation, warnings });
  },
};
