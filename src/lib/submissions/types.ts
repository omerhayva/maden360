/**
 * Başvuru formu türleri ve URL parçaları (/ilan-ver/<tur>).
 * Tarayıcıda da çalışır.
 */
export const SUBMISSION_TYPES = [
  'is-ilani',
  'aday-profili',
  'market-ilani',
  'fuar-standi',
] as const;
export type SubmissionType = (typeof SUBMISSION_TYPES)[number];

/** İletişim talebi (aday veya aracılı market ilanı için) ayrı bir sayfadadır: /iletisim-talebi */
export type FormKind = SubmissionType | 'iletisim-talebi';

export function isSubmissionType(value: string): value is SubmissionType {
  return (SUBMISSION_TYPES as readonly string[]).includes(value);
}
