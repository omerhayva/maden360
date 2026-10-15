/**
 * Hesaplayıcı tanım tipleri.
 *
 * Her hesaplayıcı; girdi alanları, formüller, varsayımlar, sınırlar ve saf bir
 * `compute` fonksiyonundan oluşur. `compute` arayüzden bağımsızdır: formdan veya
 * URL'den gelen metin değerlerini alır, doğrular ve sonuç ya da hata döndürür.
 * Böylece aynı kod hem tarayıcıda hem de otomatik testlerde çalışır.
 */

/** Ham form değerleri (metin). Birim seçimleri `<alan>_birim` anahtarında tutulur. */
export type FormValues = Record<string, string>;

export interface UnitOption {
  /** Formda ve URL'de kullanılan kimlik (ör. "kg-m3") */
  id: string;
  /** Ekranda görünen birim (ör. "kg/m³") */
  label: string;
  /** Temel birime çarpan: temel değer = girilen değer × factor */
  factor: number;
}

type Dynamic<T> = T | ((values: FormValues) => T);

interface FieldBase {
  id: string;
  label: string;
  help?: string;
  visibleWhen?: (values: FormValues) => boolean;
}

export interface NumberField extends FieldBase {
  kind: 'number';
  /** Formüldeki sembol (ör. "ρ") */
  symbol?: string;
  /** Sabit birim etiketi (birim seçimi yoksa) */
  unit?: Dynamic<string>;
  /** Seçilebilir birimler; ilk seçenek veya defaultUnit varsayılan olur. */
  units?: readonly UnitOption[];
  defaultUnit?: string;
  optional?: Dynamic<boolean>;
  /** Alt/üst sınırlar temel birim cinsindendir. */
  min?: number;
  minExclusive?: boolean;
  max?: number;
  maxExclusive?: boolean;
  integer?: boolean;
  placeholder?: string;
  messages?: Partial<Record<'min' | 'max' | 'integer', string>>;
}

export interface ChoiceOption {
  value: string;
  label: string;
  hint?: string;
}

export interface ChoiceField extends FieldBase {
  kind: 'choice';
  options: readonly ChoiceOption[];
  defaultValue: string;
  /** "segmented": kısa seçenekler için yan yana; "cards": açıklamalı seçenekler */
  layout?: 'segmented' | 'cards';
}

export type FieldDef = NumberField | ChoiceField;

export interface FieldSection {
  id: string;
  title: string;
  description?: string;
  fields: FieldDef[];
  visibleWhen?: (values: FormValues) => boolean;
}

export interface ResultItem {
  id: string;
  label: string;
  value: number;
  unit?: string;
  /** Gösterilecek en fazla ondalık basamak (verilmezse büyüklüğe göre seçilir) */
  digits?: number;
  /** Ana sonuç olarak vurgulanır */
  emphasis?: boolean;
  note?: string;
}

export interface ChartData {
  title: string;
  unit: string;
  items: { label: string; value: number }[];
  reference?: { label: string; value: number };
}

export interface CalcSuccess {
  ok: true;
  results: ResultItem[];
  /** Değerlerin yerine konduğu adım adım hesap */
  steps: string[];
  /** Sonucun sade dille yorumu */
  interpretation: string[];
  /** Hesabı engellemeyen ama dikkat gerektiren durumlar */
  warnings: string[];
  chart?: ChartData;
}

export interface CalcFailure {
  ok: false;
  /** Alan kimliği → hata mesajı */
  fieldErrors: Record<string, string>;
  /** Alanlar arası tutarlılık hataları */
  formErrors: string[];
  /** Boş bırakılan zorunlu alanlar */
  missing: string[];
}

export type CalcOutcome = CalcSuccess | CalcFailure;

export interface FormulaDef {
  id: string;
  label: string;
  /** KaTeX (LaTeX) ifadesi */
  tex: string;
  legend?: readonly { symbol: string; meaning: string; unit?: string }[];
}

export interface CalculatorDefinition {
  /** content/hesaplamalar/<slug>.md dosyasıyla eşleşir */
  slug: string;
  /** Hesap motoru ve test sürümü. Formül veya doğrulama değiştiğinde artırılır. */
  version: string;
  sections: FieldSection[];
  formulas: FormulaDef[];
  assumptions: string[];
  limitations: string[];
  example: { title: string; values: FormValues };
  compute: (values: FormValues) => CalcOutcome;
}
