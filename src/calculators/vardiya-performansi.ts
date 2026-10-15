import { failure, fmt, readInputs, success } from './core/read';
import type {
  CalculatorDefinition,
  ChartData,
  FieldDef,
  FormValues,
  ResultItem,
} from './core/types';
import { DURATION_UNITS } from './core/units';

/* ------------------------------------------------------------------ */
/* Saf hesap fonksiyonları                                             */
/* ------------------------------------------------------------------ */

/** Hedef gerçekleşme oranı (%) */
export function achievementPercent(actual: number, target: number): number {
  if (!(target > 0)) throw new RangeError('Hedef sıfırdan büyük olmalı.');
  return (actual / target) * 100;
}

/** Kalan vardiyalarda gereken ortalama üretim; hedefe ulaşıldıysa 0 */
export function requiredPerShift(
  periodTarget: number,
  producedSoFar: number,
  remainingShifts: number,
): number {
  if (!(remainingShifts > 0)) throw new RangeError('Kalan vardiya sayısı sıfırdan büyük olmalı.');
  return Math.max(0, periodTarget - producedSoFar) / remainingShifts;
}

/** Saatlik üretim hızı */
export function hourlyRate(production: number, hours: number): number {
  if (!(hours > 0)) throw new RangeError('Çalışma süresi sıfırdan büyük olmalı.');
  return production / hours;
}

/* ------------------------------------------------------------------ */
/* Hesaplayıcı tanımı                                                  */
/* ------------------------------------------------------------------ */

const productionUnit = (values: FormValues) => (values.uretimBirimi === 'm3' ? 'm³' : 't');
const shiftCount = (values: FormValues) => Number(values.vardiyaSayisi ?? '3');
const perShiftMode = (values: FormValues) => values.giris !== 'toplam';

const shiftField = (index: number): FieldDef => ({
  kind: 'number',
  id: `v${index}`,
  label: `${index}. vardiya üretimi`,
  symbol: `P${index}`,
  unit: productionUnit,
  min: 0,
  visibleWhen: (values) => perShiftMode(values) && shiftCount(values) >= index,
});

export const vardiyaPerformansi: CalculatorDefinition = {
  slug: 'vardiya-performansi',
  version: '1.0.0',
  sections: [
    {
      id: 'duzen',
      title: 'Vardiya düzeni',
      fields: [
        {
          kind: 'choice',
          id: 'vardiyaSayisi',
          label: 'Günlük vardiya sayısı (n)',
          layout: 'segmented',
          defaultValue: '3',
          options: [
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' },
          ],
        },
        {
          kind: 'number',
          id: 'vardiyaSuresi',
          label: 'Vardiya süresi (t_v)',
          symbol: 't_v',
          unit: 'saat',
          min: 0,
          minExclusive: true,
          max: 24,
          placeholder: 'ör. 8',
        },
        {
          kind: 'choice',
          id: 'uretimBirimi',
          label: 'Üretim birimi',
          layout: 'segmented',
          defaultValue: 't',
          options: [
            { value: 't', label: 'ton (t)' },
            { value: 'm3', label: 'm³' },
          ],
        },
      ],
    },
    {
      id: 'uretim',
      title: 'Gerçekleşen üretim',
      fields: [
        {
          kind: 'choice',
          id: 'giris',
          label: 'Üretimi nasıl gireceksiniz?',
          layout: 'segmented',
          defaultValue: 'vardiya',
          options: [
            { value: 'vardiya', label: 'Vardiya vardiya' },
            { value: 'toplam', label: 'Günlük toplam' },
          ],
        },
        shiftField(1),
        shiftField(2),
        shiftField(3),
        shiftField(4),
        {
          kind: 'number',
          id: 'gunlukToplam',
          label: 'Günlük toplam üretim (P)',
          symbol: 'P',
          unit: productionUnit,
          min: 0,
          visibleWhen: (values) => !perShiftMode(values),
        },
      ],
    },
    {
      id: 'hedef',
      title: 'Hedef ve duruşlar',
      description:
        'İsteğe bağlı. Girilirse hedef gerçekleşme ve net çalışma süresine göre verim hesaplanır.',
      fields: [
        {
          kind: 'number',
          id: 'gunlukHedef',
          label: 'Günlük hedef üretim (P_h)',
          symbol: 'P_h',
          unit: productionUnit,
          optional: true,
          min: 0,
          minExclusive: true,
        },
        {
          kind: 'number',
          id: 'durus',
          label: 'Toplam duruş süresi (t_d)',
          symbol: 't_d',
          units: DURATION_UNITS,
          optional: true,
          min: 0,
          help: 'Gün içindeki tüm vardiyalarda üretimin durduğu sürelerin toplamı (arıza, bekleme, yemek molası vb.).',
        },
      ],
    },
    {
      id: 'donem',
      title: 'Dönem hedefi takibi',
      description:
        'İsteğe bağlı. Ay veya proje dönemi hedefine ulaşmak için kalan vardiyalarda gereken ortalama üretimi hesaplar; üç alan birlikte girilmelidir.',
      fields: [
        {
          kind: 'number',
          id: 'donemHedefi',
          label: 'Dönem hedefi (H_d)',
          symbol: 'H_d',
          unit: productionUnit,
          optional: true,
          min: 0,
          minExclusive: true,
        },
        {
          kind: 'number',
          id: 'donemGerceklesen',
          label: 'Dönem başından bugüne üretim (G_d)',
          symbol: 'G_d',
          unit: productionUnit,
          optional: true,
          min: 0,
          help: 'Bugünkü üretim dahil.',
        },
        {
          kind: 'number',
          id: 'kalanVardiya',
          label: 'Kalan vardiya sayısı (n_k)',
          symbol: 'n_k',
          unit: 'vardiya',
          optional: true,
          integer: true,
          min: 0,
          minExclusive: true,
        },
      ],
    },
  ],
  formulas: [
    {
      id: 'toplam',
      label: 'Günlük üretim ve ortalama',
      tex: 'P = \\sum_{i=1}^{n} P_i \\qquad \\bar{P} = \\frac{P}{n}',
      legend: [
        { symbol: 'P_i', meaning: 'i. vardiyanın üretimi', unit: 't veya m³' },
        { symbol: 'n', meaning: 'Günlük vardiya sayısı', unit: '—' },
      ],
    },
    {
      id: 'hedef',
      label: 'Hedef gerçekleşme',
      tex: 'G = \\frac{P}{P_h} \\times 100',
      legend: [{ symbol: 'P_h', meaning: 'Günlük hedef üretim', unit: 't veya m³' }],
    },
    {
      id: 'sure',
      label: 'Süreler ve saatlik üretim',
      tex: 't_p = n \\times t_v \\qquad DO = \\frac{t_d}{t_p} \\times 100 \\qquad Q_{net} = \\frac{P}{t_p - t_d}',
      legend: [
        { symbol: 't_v', meaning: 'Vardiya süresi', unit: 'saat' },
        { symbol: 't_p', meaning: 'Planlı çalışma süresi', unit: 'saat' },
        { symbol: 't_d', meaning: 'Toplam duruş süresi', unit: 'saat' },
        { symbol: 'DO', meaning: 'Duruş oranı', unit: '%' },
        { symbol: 'Q_{net}', meaning: 'Net çalışma saatine göre üretim hızı', unit: 't/sa' },
      ],
    },
    {
      id: 'donem',
      label: 'Dönem hedefi için gereken vardiya üretimi',
      tex: 'P_{\\text{gerekli}} = \\frac{H_d - G_d}{n_k}',
      legend: [
        { symbol: 'H_d', meaning: 'Dönem hedefi', unit: 't veya m³' },
        { symbol: 'G_d', meaning: 'Dönem başından bugüne üretim', unit: 't veya m³' },
        { symbol: 'n_k', meaning: 'Kalan vardiya sayısı', unit: '—' },
      ],
    },
  ],
  assumptions: [
    'Vardiyaların süreleri eşittir ve 24 saatlik gün içinde yer alır.',
    'Duruş süresi, planlı çalışma süresi içindeki üretimsiz sürelerin toplamıdır.',
    'Üretim miktarları aynı birimde ve aynı ölçüm yöntemiyle (kantar, kamyon sayımı, ölçüm) belirlenmiştir.',
  ],
  limitations: [
    'Bu araç ekipman kullanılabilirliği veya kullanım oranı gibi ayrıntılı zaman sınıflandırması göstergelerini hesaplamaz; bunlar için ekipman bazlı zaman kayıtları gerekir.',
    'Kamyon sayımı gibi yaklaşık ölçümlerle elde edilen üretim değerleri kantar verisiyle düzenli olarak doğrulanmalıdır.',
  ],
  example: {
    title: '3 × 8 saat; vardiyalar 1.450 / 1.380 / 1.170 t; hedef 4.500 t; duruş 150 dk',
    values: {
      vardiyaSayisi: '3',
      vardiyaSuresi: '8',
      uretimBirimi: 't',
      giris: 'vardiya',
      v1: '1450',
      v2: '1380',
      v3: '1170',
      gunlukHedef: '4500',
      durus: '150',
      durus_birim: 'dk',
      donemHedefi: '120000',
      donemGerceklesen: '78400',
      kalanVardiya: '30',
    },
  },
  compute(rawValues) {
    const read = readInputs(vardiyaPerformansi, rawValues);
    if (!read.ok) return read.failure;
    const { input } = read;

    const n = Number(input.choice('vardiyaSayisi'));
    const shiftHours = input.num('vardiyaSuresi');
    const unit = productionUnit(input.values);
    const plannedHours = n * shiftHours;

    if (plannedHours > 24 + 1e-9) {
      return failure({
        vardiyaSuresi: `${n} vardiya × ${fmt(shiftHours)} saat = ${fmt(plannedHours)} saat; günlük toplam vardiya süresi 24 saati aşamaz.`,
      });
    }

    const downtime = input.opt('durus');
    if (downtime !== undefined && downtime > plannedHours + 1e-9) {
      return failure({
        durus: `Duruş süresi (${fmt(downtime)} saat), planlı çalışma süresinden (${fmt(plannedHours)} saat) uzun olamaz.`,
      });
    }

    const periodIds = ['donemHedefi', 'donemGerceklesen', 'kalanVardiya'] as const;
    const periodValues = periodIds.map((id) => input.opt(id));
    const periodGiven = periodValues.filter((value) => value !== undefined).length;
    if (periodGiven > 0 && periodGiven < 3) {
      const errors: Record<string, string> = {};
      periodIds.forEach((id, index) => {
        if (periodValues[index] === undefined) errors[id] = 'Dönem hesabı için bu alan da gerekli.';
      });
      return failure(errors);
    }

    const perShift = perShiftMode(input.values);
    const shifts = perShift
      ? Array.from({ length: n }, (_, index) => input.num(`v${index + 1}`))
      : [];
    const total = perShift
      ? shifts.reduce((sum, value) => sum + value, 0)
      : input.num('gunlukToplam');
    const average = total / n;

    const results: ResultItem[] = [];
    const steps: string[] = [];
    const interpretation: string[] = [];
    const warnings: string[] = [];

    if (perShift) {
      steps.push(`P = ${shifts.map((value) => fmt(value)).join(' + ')} = ${fmt(total)} ${unit}`);
    }
    steps.push(`P̄ = P / n = ${fmt(total)} / ${n} = ${fmt(average)} ${unit}/vardiya`);
    steps.push(`t_p = n × t_v = ${n} × ${fmt(shiftHours)} = ${fmt(plannedHours)} saat`);

    results.push({ id: 'toplam', label: 'Günlük üretim (P)', value: total, unit, emphasis: true });
    results.push({
      id: 'ortalama',
      label: 'Vardiya başına ortalama',
      value: average,
      unit: `${unit}/vardiya`,
    });
    interpretation.push(
      `Gün içinde toplam ${fmt(total)} ${unit} üretildi; vardiya başına ortalama ${fmt(average)} ${unit}.`,
    );

    const target = input.opt('gunlukHedef');
    if (target !== undefined) {
      const achievement = achievementPercent(total, target);
      const difference = total - target;
      steps.push(
        `G = P / P_h × 100 = ${fmt(total)} / ${fmt(target)} × 100 = %${fmt(achievement, 2)}`,
      );
      results.push({
        id: 'gerceklesme',
        label: 'Hedef gerçekleşme (G)',
        value: achievement,
        unit: '%',
        digits: 1,
      });
      results.push({ id: 'fark', label: 'Hedeften fark', value: difference, unit });
      interpretation.push(
        difference >= 0
          ? `Günlük hedefin %${fmt(achievement, 1)}’i gerçekleşti; hedef ${fmt(difference)} ${unit} aşıldı.`
          : `Günlük hedefin %${fmt(achievement, 1)}’i gerçekleşti; hedefe ${fmt(-difference)} ${unit} eksik kalındı.`,
      );
    }

    results.push({
      id: 'planliSure',
      label: 'Planlı çalışma süresi (t_p)',
      value: plannedHours,
      unit: 'saat',
    });
    const grossRate = hourlyRate(total, plannedHours);
    results.push({
      id: 'saatlikBrut',
      label: 'Saatlik üretim (planlı süreye göre)',
      value: grossRate,
      unit: `${unit}/sa`,
    });

    if (downtime !== undefined) {
      const netHours = plannedHours - downtime;
      const downtimePct = (downtime / plannedHours) * 100;
      steps.push(
        `DO = t_d / t_p × 100 = ${fmt(downtime, 2)} / ${fmt(plannedHours)} × 100 = %${fmt(downtimePct, 2)}`,
      );
      results.push({
        id: 'durusOrani',
        label: 'Duruş oranı (DO)',
        value: downtimePct,
        unit: '%',
        digits: 1,
      });
      results.push({
        id: 'netSure',
        label: 'Net çalışma süresi',
        value: netHours,
        unit: 'saat',
        digits: 2,
      });
      if (netHours > 0) {
        const netRate = hourlyRate(total, netHours);
        steps.push(
          `Q_net = P / (t_p − t_d) = ${fmt(total)} / ${fmt(netHours, 2)} = ${fmt(netRate)} ${unit}/sa`,
        );
        results.push({
          id: 'saatlikNet',
          label: 'Saatlik üretim (net süreye göre)',
          value: netRate,
          unit: `${unit}/sa`,
        });
        interpretation.push(
          `Planlı ${fmt(plannedHours)} saatin ${fmt(downtime, 2)} saati duruşla geçti (%${fmt(downtimePct, 1)}); net çalışma saati başına ortalama ${fmt(netRate)} ${unit} üretildi.`,
        );
      } else if (total > 0) {
        warnings.push(
          'Duruş süresi planlı sürenin tamamına eşit olduğu hâlde üretim girildi; değerleri kontrol edin.',
        );
      }
    }

    if (periodGiven === 3) {
      const [periodTarget, producedSoFar, remainingShifts] = periodValues as [
        number,
        number,
        number,
      ];
      const remaining = periodTarget - producedSoFar;
      if (remaining <= 0) {
        results.push({ id: 'kalanHedef', label: 'Kalan dönem hedefi', value: 0, unit });
        interpretation.push(
          `Dönem hedefine ulaşıldı; hedefin ${fmt(-remaining)} ${unit} üzerindesiniz.`,
        );
      } else {
        const required = requiredPerShift(periodTarget, producedSoFar, remainingShifts);
        steps.push(
          `P_gerekli = (H_d − G_d) / n_k = (${fmt(periodTarget)} − ${fmt(producedSoFar)}) / ${fmt(remainingShifts, 0)} = ${fmt(required)} ${unit}/vardiya`,
        );
        results.push({ id: 'kalanHedef', label: 'Kalan dönem hedefi', value: remaining, unit });
        results.push({
          id: 'gerekliOrtalama',
          label: 'Gereken ortalama vardiya üretimi',
          value: required,
          unit: `${unit}/vardiya`,
        });
        const comparison =
          average > 0
            ? ` Bu, bugünkü vardiya ortalamanızın %${fmt((required / average) * 100, 0)}’i.`
            : '';
        interpretation.push(
          `Dönem hedefine ulaşmak için kalan ${fmt(remainingShifts, 0)} vardiyada ortalama ${fmt(required)} ${unit}/vardiya üretim gerekiyor.${comparison}`,
        );
      }
    }

    let chart: ChartData | undefined;
    if (perShift && n > 1) {
      chart = {
        title: 'Vardiya üretimleri',
        unit,
        items: shifts.map((value, index) => ({ label: `${index + 1}. vardiya`, value })),
        reference:
          target !== undefined
            ? { label: 'Vardiya başına hedef', value: target / n }
            : { label: 'Ortalama', value: average },
      };
      shifts.forEach((value, index) => {
        if (value === 0 && total > 0) {
          warnings.push(
            `${index + 1}. vardiyada üretim sıfır. Vardiya çalışmadıysa vardiya sayısını düşürün; ortalama ve saatlik değerler etkilenir.`,
          );
        }
      });
    }

    return success({ results, steps, interpretation, warnings, chart });
  },
};
