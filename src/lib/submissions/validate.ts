import { findContactInfo, isPhoneNumber } from '@/lib/listings/contact';
import { REF_PATTERN } from '@/lib/listings/options';
import { allFields, isShown, type FormDefinition, type FormField } from './forms';
import {
  arrayValue,
  canonicalProvince,
  listValue,
  parseFormNumber,
  textValue,
  type FormValues,
} from './values';

export interface ValidationResult {
  /** Alan kimliği → hata mesajı */
  fieldErrors: Record<string, string>;
  /** Onay kimliği → hata mesajı */
  consentErrors: Record<string, string>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function isHttpUrl(value: string): boolean {
  if (!/^https?:\/\/\S+\.\S+$/i.test(value.trim())) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

const CONTACT_MESSAGE =
  'İletişim bilgisi (telefon, e-posta, web adresi) yazmayın; profiliniz iletişim bilgisi olmadan yayımlanır.';

export function validateField(field: FormField, values: FormValues): string | undefined {
  const { label } = field;

  if (field.type === 'checkboxes') {
    const selected = arrayValue(values, field.id);
    if (field.required && selected.length === 0) return `${label}: en az bir seçim yapın.`;
    const allowed = new Set(field.options?.map((option) => option.value));
    if (selected.some((value) => !allowed.has(value))) return `${label}: geçersiz seçim.`;
    if (field.maxItems && selected.length > field.maxItems) {
      return `${label}: en fazla ${field.maxItems} seçim yapabilirsiniz.`;
    }
    return undefined;
  }

  const raw = textValue(values, field.id);
  if (raw === '') return field.required ? `${label} zorunlu.` : undefined;

  if (field.maxLength && raw.length > field.maxLength) {
    return `${label} en fazla ${field.maxLength} karakter olabilir (şu an ${raw.length}).`;
  }
  if (field.minLength && raw.length < field.minLength) {
    return `${label} en az ${field.minLength} karakter olmalı (şu an ${raw.length}).`;
  }
  if (field.noContactInfo && findContactInfo(raw).length > 0) return CONTACT_MESSAGE;

  switch (field.type) {
    case 'email':
      return isEmail(raw) ? undefined : 'Geçerli bir e-posta adresi girin (ör. ad@firma.com.tr).';
    case 'tel':
      return isPhoneNumber(raw)
        ? undefined
        : 'Telefon numarasını alan koduyla yazın (ör. 0312 123 45 67).';
    case 'url':
      return isHttpUrl(raw)
        ? undefined
        : 'Web adresini https:// ile başlayarak yazın (ör. https://www.firma.com.tr).';
    case 'number': {
      const parsed = parseFormNumber(raw);
      if (parsed === 'invalid' || parsed === null) return `${label} için geçerli bir sayı girin.`;
      if (field.integer && !Number.isInteger(parsed)) return `${label} tam sayı olmalı.`;
      if (field.min !== undefined && parsed < field.min)
        return `${label} en az ${field.min} olmalı.`;
      if (field.max !== undefined && parsed > field.max)
        return `${label} en fazla ${field.max} olabilir.`;
      return undefined;
    }
    case 'select': {
      const allowed = field.options?.some((option) => option.value === raw);
      return allowed ? undefined : `${label}: listeden bir seçenek seçin.`;
    }
    case 'list': {
      const items = listValue(values, field.id);
      if (field.required && items.length === 0) return `${label} zorunlu.`;
      if (field.maxItems && items.length > field.maxItems) {
        return `${label}: en fazla ${field.maxItems} satır yazabilirsiniz (şu an ${items.length}).`;
      }
      const tooLong = items.find((item) => item.length > 200);
      if (tooLong) return `${label}: her satır en fazla 200 karakter olabilir.`;
      if (field.provinceList) {
        const unknown = items.filter((item) => canonicalProvince(item) === null);
        if (unknown.length > 0) {
          return `Tanınmayan il: ${unknown.join(', ')}. İl adını yazın veya “Türkiye geneli” kullanın.`;
        }
      }
      return undefined;
    }
    default:
      return undefined;
  }
}

/** Alanlar arası kurallar */
function crossFieldErrors(definition: FormDefinition, values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (definition.kind === 'is-ilani') {
    const method = textValue(values, 'applyMethod');
    const value = textValue(values, 'applyValue');
    if (value) {
      if (method === 'eposta' && !isEmail(value))
        errors.applyValue = 'Başvuru için geçerli bir e-posta adresi girin.';
      if (method === 'url' && !isHttpUrl(value))
        errors.applyValue = 'Başvuru sayfasının adresini https:// ile başlayarak yazın.';
      if (method === 'telefon' && !isPhoneNumber(value))
        errors.applyValue = 'Başvuru için telefon numarasını alan koduyla yazın.';
    }
    const min = parseFormNumber(textValue(values, 'salaryMin'));
    const max = parseFormNumber(textValue(values, 'salaryMax'));
    if (typeof min === 'number' && typeof max === 'number' && min > max) {
      errors.salaryMax = 'En yüksek ücret, en düşük ücretten küçük olamaz.';
    }
  }
  if (definition.kind === 'fuar-standi') {
    if (
      !textValue(values, 'website') &&
      !textValue(values, 'email') &&
      !textValue(values, 'phone')
    ) {
      errors.website =
        'Stand sayfasında görünecek web sitesi, e-posta veya telefondan en az birini yazın.';
    }
  }
  if (definition.kind === 'iletisim-talebi') {
    const ref = textValue(values, 'ref').toUpperCase();
    if (ref && !REF_PATTERN.test(ref)) {
      errors.ref =
        'Numara ADY-20261016-K7QX biçiminde olmalı; ilan sayfasındaki “İlan no” alanından kopyalayın.';
    }
  }
  if (definition.kind === 'market-ilani' && textValue(values, 'contactMode') === 'dogrudan') {
    if (
      !textValue(values, 'contactPhone') &&
      !textValue(values, 'website') &&
      !textValue(values, 'contactEmail')
    ) {
      errors.contactPhone = 'İlanda görünecek en az bir iletişim bilgisi yazın.';
    }
  }
  return errors;
}

export function validateSubmission(
  definition: FormDefinition,
  values: FormValues,
  consents: Record<string, boolean>,
): ValidationResult {
  const fieldErrors: Record<string, string> = {};
  for (const field of allFields(definition)) {
    if (!isShown(field.showIf, values)) continue;
    const message = validateField(field, values);
    if (message) fieldErrors[field.id] = message;
  }
  for (const [id, message] of Object.entries(crossFieldErrors(definition, values))) {
    fieldErrors[id] ??= message;
  }
  const consentErrors: Record<string, string> = {};
  for (const consent of definition.consents) {
    if (!isShown(consent.showIf, values)) continue;
    if (!consents[consent.id]) consentErrors[consent.id] = 'Devam etmek için bu onayı işaretleyin.';
  }
  return { fieldErrors, consentErrors };
}

export function hasErrors(result: ValidationResult): boolean {
  return Object.keys(result.fieldErrors).length > 0 || Object.keys(result.consentErrors).length > 0;
}
