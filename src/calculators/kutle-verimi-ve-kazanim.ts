import { failure, fmt, readInputs, success } from './core/read';
import type { CalculatorDefinition, FormValues, ResultItem } from './core/types';

/* ------------------------------------------------------------------ */
/* Saf hesap fonksiyonları                                             */
/* Gösterim: F, C, T kütleler; f, c, t tenörler (besleme, konsantre,   */
/* artık). Tenörler aynı birimde olmalıdır (% veya g/t).               */
/* ------------------------------------------------------------------ */

/** Kütle verimi (%) = C / F × 100 */
export function massYield(feed: number, concentrate: number): number {
  if (!(feed > 0)) throw new RangeError('Besleme miktarı sıfırdan büyük olmalı.');
  return (concentrate / feed) * 100;
}

/** Metal kazanımı (%) = (C·c) / (F·f) × 100 */
export function recoveryFromMasses(
  feed: number,
  feedGrade: number,
  concentrate: number,
  concentrateGrade: number,
): number {
  if (!(feed > 0) || !(feedGrade > 0))
    throw new RangeError('Besleme miktarı ve tenörü sıfırdan büyük olmalı.');
  return ((concentrate * concentrateGrade) / (feed * feedGrade)) * 100;
}

/**
 * İki ürün formülü: C/F = (f − t) / (c − t)
 * Geçerlilik koşulu: c > f > t (aksi halde kütle dengesi fiziksel değildir).
 */
export function twoProductYield(f: number, c: number, t: number): number {
  if (!(c > f && f > t && t >= 0)) {
    throw new RangeError('İki ürün formülü için c > f > t ≥ 0 olmalı.');
  }
  return (f - t) / (c - t);
}

/** İki ürün formülüyle kazanım (%) = c(f − t) / [f(c − t)] × 100 */
export function twoProductRecovery(f: number, c: number, t: number): number {
  return ((c * twoProductYield(f, c, t)) / f) * 100;
}

/** Kütle dengesinden artık tenörü: t = (F·f − C·c) / (F − C) */
export function tailingsGrade(
  feed: number,
  feedGrade: number,
  concentrate: number,
  concentrateGrade: number,
): number {
  const tailings = feed - concentrate;
  if (!(tailings > 0)) throw new RangeError('Artık miktarı sıfırdan büyük olmalı.');
  return (feed * feedGrade - concentrate * concentrateGrade) / tailings;
}

/** Metal miktarı: % tenörde kütle × tenör / 100; g/t tenörde kütle(t) × tenör = gram */
export function metalContent(mass: number, grade: number, gradeUnit: '%' | 'g/t'): number {
  return gradeUnit === '%' ? (mass * grade) / 100 : mass * grade;
}

/* ------------------------------------------------------------------ */
/* Hesaplayıcı tanımı                                                  */
/* ------------------------------------------------------------------ */

const isMassMode = (values: FormValues) => values.yontem === 'kutle';
const gradeUnitLabel = (values: FormValues) => (values.tenorBirimi === 'g-t' ? 'g/t' : '%');
const massUnitLabel = (values: FormValues) => (values.kutleBirimi === 't-sa' ? 't/sa' : 't');

/** Metal miktarını okunur birimle döndürür (g/t'de gram, büyükse kg). */
function metalDisplay(mass: number, grade: number, gradeUnit: '%' | 'g/t', massUnit: string) {
  const perHour = massUnit === 't/sa' ? '/sa' : '';
  const value = metalContent(mass, grade, gradeUnit);
  if (gradeUnit === '%') return { value, unit: `t${perHour}` };
  return value >= 1000
    ? { value: value / 1000, unit: `kg${perHour}` }
    : { value, unit: `g${perHour}` };
}

export const kutleVerimiVeKazanim: CalculatorDefinition = {
  slug: 'kutle-verimi-ve-kazanim',
  version: '1.0.0',
  sections: [
    {
      id: 'yontem',
      title: 'Hesaplama yöntemi',
      fields: [
        {
          kind: 'choice',
          id: 'yontem',
          label: 'Elinizdeki veriler',
          layout: 'cards',
          defaultValue: 'kutle',
          options: [
            {
              value: 'kutle',
              label: 'Ölçülmüş kütlelerle',
              hint: 'Besleme ve konsantre miktarı biliniyor (tartım, bant kantarı).',
            },
            {
              value: 'tenor',
              label: 'Yalnızca tenörlerle (iki ürün formülü)',
              hint: 'Besleme, konsantre ve artık tenörleri biliniyor; kütleler bilinmiyor.',
            },
          ],
        },
      ],
    },
    {
      id: 'tenorler',
      title: 'Tenörler',
      description: 'Üç tenör de aynı birimde ve aynı bileşen (ör. Cu, Au, WO₃) için girilmelidir.',
      fields: [
        {
          kind: 'choice',
          id: 'tenorBirimi',
          label: 'Tenör birimi',
          layout: 'segmented',
          defaultValue: 'yuzde',
          options: [
            { value: 'yuzde', label: '%' },
            { value: 'g-t', label: 'g/t (ppm)' },
          ],
        },
        {
          kind: 'number',
          id: 'f',
          label: 'Besleme tenörü (f)',
          symbol: 'f',
          unit: gradeUnitLabel,
          min: 0,
          minExclusive: true,
          messages: {
            min: 'Besleme tenörü sıfırdan büyük olmalı; aksi halde kazanım hesaplanamaz.',
          },
        },
        {
          kind: 'number',
          id: 'c',
          label: 'Konsantre tenörü (c)',
          symbol: 'c',
          unit: gradeUnitLabel,
          min: 0,
        },
        {
          kind: 'number',
          id: 't',
          label: 'Artık tenörü (t)',
          symbol: 't',
          unit: gradeUnitLabel,
          min: 0,
          optional: isMassMode,
          help: 'Kütle yönteminde isteğe bağlıdır; girilirse kütle dengesiyle karşılaştırılır.',
        },
      ],
    },
    {
      id: 'kutleler',
      title: 'Kütleler',
      description: 'Kuru kütle kullanın. Aynı dönem veya aynı saatlik debi için girilmelidir.',
      fields: [
        {
          kind: 'choice',
          id: 'kutleBirimi',
          label: 'Kütle birimi',
          layout: 'segmented',
          defaultValue: 't',
          options: [
            { value: 't', label: 't (dönem toplamı)' },
            { value: 't-sa', label: 't/sa (debi)' },
          ],
        },
        {
          kind: 'number',
          id: 'F',
          label: 'Besleme miktarı (F)',
          symbol: 'F',
          unit: massUnitLabel,
          min: 0,
          minExclusive: true,
          optional: (values) => !isMassMode(values),
          help: 'Tenör yönteminde isteğe bağlıdır; girilirse konsantre ve artık miktarları da hesaplanır.',
        },
        {
          kind: 'number',
          id: 'C',
          label: 'Konsantre miktarı (C)',
          symbol: 'C',
          unit: massUnitLabel,
          min: 0,
          minExclusive: true,
          visibleWhen: isMassMode,
        },
      ],
    },
  ],
  formulas: [
    {
      id: 'verim',
      label: 'Kütle verimi',
      tex: 'Y = \\frac{C}{F} \\times 100',
      legend: [
        { symbol: 'Y', meaning: 'Kütle verimi', unit: '%' },
        { symbol: 'F, C, T', meaning: 'Besleme, konsantre, artık kütlesi', unit: 't veya t/sa' },
      ],
    },
    {
      id: 'kazanim',
      label: 'Metal kazanımı',
      tex: 'R = \\frac{C\\,c}{F\\,f} \\times 100',
      legend: [
        { symbol: 'R', meaning: 'Metal (bileşen) kazanımı', unit: '%' },
        { symbol: 'f, c, t', meaning: 'Besleme, konsantre, artık tenörü', unit: '% veya g/t' },
      ],
    },
    {
      id: 'iki-urun',
      label: 'İki ürün formülü (kütleler bilinmiyorsa)',
      tex: '\\frac{C}{F} = \\frac{f - t}{c - t} \\qquad R = \\frac{c\\,(f - t)}{f\\,(c - t)} \\times 100 \\qquad (c > f > t)',
    },
    {
      id: 'oranlar',
      label: 'Zenginleştirme ve konsantrasyon oranı',
      tex: 'ZO = \\frac{c}{f} \\qquad KO = \\frac{F}{C}',
      legend: [
        { symbol: 'ZO', meaning: 'Zenginleştirme oranı', unit: '—' },
        {
          symbol: 'KO',
          meaning: 'Konsantrasyon oranı (1 birim konsantre için besleme)',
          unit: '—',
        },
      ],
    },
    {
      id: 'denge',
      label: 'Kütle ve metal dengesi',
      tex: 'F = C + T \\qquad F f = C c + T t',
    },
  ],
  assumptions: [
    'Devre kararlı durumdadır; aynı dönemde biriken veya stoktan çekilen malzeme yoktur.',
    'Tek besleme, tek konsantre ve tek artık akımı vardır (iki ürünlü ayırma).',
    'Kütleler kuru bazdadır ve tenörler aynı bileşen için aynı birimdedir.',
    'Numuneler akımları temsil eder; analiz hataları ihmal edilir.',
  ],
  limitations: [
    'Üç veya daha fazla ürünlü devreler (ör. iki konsantre) için iki ürün formülü kullanılamaz.',
    'İki ürün formülü, tenörlerdeki küçük analiz hatalarına karşı çok duyarlıdır; özellikle c ile t veya f ile t birbirine yakınsa sonuç güvenilmez olur.',
    'Kesin metalurjik muhasebe için ölçülmüş kütleler ve kütle dengesi uzlaştırması (veri düzeltme) gerekir.',
  ],
  example: {
    title: 'Bakır flotasyonu: F = 10.000 t, f = %0,80; C = 280 t, c = %24,5; t = %0,12',
    values: {
      yontem: 'kutle',
      tenorBirimi: 'yuzde',
      kutleBirimi: 't',
      F: '10000',
      C: '280',
      f: '0,80',
      c: '24,5',
      t: '0,12',
    },
  },
  compute(rawValues) {
    const read = readInputs(kutleVerimiVeKazanim, rawValues);
    if (!read.ok) return read.failure;
    const { input } = read;

    const mode = input.choice('yontem');
    const gradeUnit: '%' | 'g/t' = input.choice('tenorBirimi') === 'g-t' ? 'g/t' : '%';
    const massUnit = input.choice('kutleBirimi') === 't-sa' ? 't/sa' : 't';
    const f = input.num('f');
    const c = input.num('c');
    const t = input.opt('t');
    const maxGrade = gradeUnit === '%' ? 100 : 1_000_000;
    const g = (value: number) => `${fmt(value, 4)} ${gradeUnit}`;

    const gradeErrors: Record<string, string> = {};
    for (const [id, value] of [
      ['f', f],
      ['c', c],
      ['t', t],
    ] as const) {
      if (value !== undefined && value > maxGrade) {
        gradeErrors[id] =
          gradeUnit === '%'
            ? 'Tenör %100’den büyük olamaz.'
            : 'Tenör 1.000.000 g/t’den (%100) büyük olamaz.';
      }
    }
    if (Object.keys(gradeErrors).length > 0) return failure(gradeErrors);

    const results: ResultItem[] = [];
    const steps: string[] = [];
    const interpretation: string[] = [];
    const warnings: string[] = [];

    let yieldPct: number;
    let recovery: number;
    let feed: number | undefined;
    let conc: number | undefined;

    if (mode === 'kutle') {
      feed = input.num('F');
      conc = input.num('C');
      if (conc > feed) {
        return failure({ C: 'Konsantre miktarı besleme miktarından büyük olamaz.' });
      }
      yieldPct = massYield(feed, conc);
      recovery = recoveryFromMasses(feed, f, conc, c);
      if (recovery > 100 + 1e-9) {
        return failure({}, [
          `Hesaplanan metal kazanımı %${fmt(recovery, 2)}; %100’ü aşamaz. Konsantredeki metal (C·c) beslemedeki metalden (F·f) fazla çıkıyor — kütle veya tenör değerlerini kontrol edin.`,
        ]);
      }
      steps.push(`Y = C / F × 100 = ${fmt(conc)} / ${fmt(feed)} × 100 = %${fmt(yieldPct, 3)}`);
      steps.push(
        `R = (C × c) / (F × f) × 100 = (${fmt(conc)} × ${fmt(c, 4)}) / (${fmt(feed)} × ${fmt(f, 4)}) × 100 = %${fmt(recovery, 2)}`,
      );
      if (c < f) {
        warnings.push(
          'Konsantre tenörü besleme tenöründen düşük; ürün zenginleşmemiş görünüyor. Akım adlarını ve analizleri kontrol edin.',
        );
      }
    } else {
      if (t === undefined) return failure({ t: 'İki ürün formülü için artık tenörü gerekli.' });
      if (!(c > f && f > t)) {
        return failure({}, [
          'İki ürün formülü için tenörler c > f > t sıralamasında olmalı: konsantre tenörü besleme tenöründen, besleme tenörü de artık tenöründen büyük olmalı.',
        ]);
      }
      const ratio = twoProductYield(f, c, t);
      yieldPct = ratio * 100;
      recovery = twoProductRecovery(f, c, t);
      steps.push(
        `C/F = (f − t) / (c − t) = (${fmt(f, 4)} − ${fmt(t, 4)}) / (${fmt(c, 4)} − ${fmt(t, 4)}) = ${fmt(ratio, 5)} → Y = %${fmt(yieldPct, 3)}`,
      );
      steps.push(
        `R = c × (f − t) / [f × (c − t)] × 100 = ${fmt(c, 4)} × ${fmt(f - t, 4)} / (${fmt(f, 4)} × ${fmt(c - t, 4)}) × 100 = %${fmt(recovery, 2)}`,
      );
      feed = input.opt('F');
      if (feed !== undefined) {
        conc = feed * ratio;
        steps.push(`C = F × (C/F) = ${fmt(feed)} × ${fmt(ratio, 5)} = ${fmt(conc)} ${massUnit}`);
      }
      if ((c - t) / c < 0.05 || (f - t) / f < 0.05) {
        warnings.push(
          'Tenörler birbirine çok yakın; iki ürün formülü bu durumda küçük analiz hatalarına karşı çok duyarlıdır.',
        );
      }
    }

    results.push({
      id: 'kazanim',
      label: 'Metal kazanımı (R)',
      value: recovery,
      unit: '%',
      digits: 2,
      emphasis: true,
    });
    results.push({ id: 'verim', label: 'Kütle verimi (Y)', value: yieldPct, unit: '%', digits: 3 });

    const enrichment = c / f;
    const concentrationRatio = 100 / yieldPct;
    results.push({
      id: 'zenginlestirmeOrani',
      label: 'Zenginleştirme oranı (c/f)',
      value: enrichment,
      unit: '',
      digits: 2,
    });
    results.push({
      id: 'konsantrasyonOrani',
      label: 'Konsantrasyon oranı (F/C)',
      value: concentrationRatio,
      unit: '',
      digits: 2,
    });
    steps.push(
      `ZO = c / f = ${fmt(c, 4)} / ${fmt(f, 4)} = ${fmt(enrichment, 2)}; KO = F / C = 100 / Y = ${fmt(concentrationRatio, 2)}`,
    );

    if (feed !== undefined && conc !== undefined) {
      const tailings = feed - conc;
      if (mode === 'tenor')
        results.push({
          id: 'konsantre',
          label: 'Konsantre miktarı (C)',
          value: conc,
          unit: massUnit,
        });
      results.push({
        id: 'artik',
        label: 'Artık miktarı (T = F − C)',
        value: tailings,
        unit: massUnit,
      });
      if (mode === 'kutle' && tailings > 0) {
        const tCalc = tailingsGrade(feed, f, conc, c);
        steps.push(
          `t = (F × f − C × c) / (F − C) = (${fmt(feed)} × ${fmt(f, 4)} − ${fmt(conc)} × ${fmt(c, 4)}) / ${fmt(tailings)} = ${g(tCalc)}`,
        );
        results.push({
          id: 'artikTenoru',
          label: 'Artık tenörü (kütle dengesinden)',
          value: tCalc,
          unit: gradeUnit,
          digits: 4,
        });
        if (t !== undefined && Math.abs(t - tCalc) > 0.05 * f) {
          warnings.push(
            `Girilen artık tenörü (${g(t)}) ile kütle dengesinden hesaplanan değer (${g(tCalc)}) belirgin biçimde farklı. Numune alma, analiz veya kütle ölçümünde hata olabilir.`,
          );
        }
      }
      const feedMetal = metalDisplay(feed, f, gradeUnit, massUnit);
      const concMetal = metalDisplay(conc, c, gradeUnit, massUnit);
      results.push({
        id: 'metalBesleme',
        label: 'Beslemedeki metal',
        value: feedMetal.value,
        unit: feedMetal.unit,
      });
      results.push({
        id: 'metalKonsantre',
        label: 'Konsantredeki metal',
        value: concMetal.value,
        unit: concMetal.unit,
      });
    }

    interpretation.push(
      `Beslemenin %${fmt(yieldPct, 3)}’ü konsantreye alınmış (kütle verimi); beslemedeki metalin %${fmt(recovery, 2)}’si konsantrede kazanılmış, %${fmt(100 - recovery, 2)}’si artıkla kaybedilmiştir.`,
    );
    interpretation.push(
      `Konsantre tenörü besleme tenörünün ${fmt(enrichment, 2)} katı; 1 birim konsantre için yaklaşık ${fmt(concentrationRatio, 2)} birim besleme işlenmiştir.`,
    );
    if (mode === 'tenor') {
      interpretation.push(
        'Sonuçlar yalnızca tenörlerden türetildiği için analiz hatalarına duyarlıdır; mümkünse ölçülmüş kütlelerle doğrulayın.',
      );
    }

    return success({ results, steps, interpretation, warnings });
  },
};
