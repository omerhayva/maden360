import type { Submission } from './message';

/**
 * Başvurunun editöre ulaştırılması.
 *
 * Varsayılan yöntem e-postadır (mailto): ek hizmet ve hesap gerektirmez,
 * kişisel veriler doğrudan sitenin e-posta kutusuna gider. İsteğe bağlı olarak
 * NEXT_PUBLIC_FORM_ENDPOINT ile bir form hizmeti (Formspree, Web3Forms vb.)
 * kullanılabilir; ayrıntılar docs/ilanlar-ve-fuar.md belgesindedir.
 */

export interface DeliveryConfig {
  email: string;
  endpoint?: string;
  accessKey?: string;
}

/** Çok uzun mailto adresleri bazı e-posta programlarında kesilebilir. */
export const MAILTO_LIMIT = 8000;

export function buildMailto(
  email: string,
  subject: string,
  body: string,
  limit = MAILTO_LIMIT,
): string {
  const base = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=`;
  const encoded = encodeURIComponent(body);
  if (base.length + encoded.length <= limit) return base + encoded;
  const note =
    '\n\n[Metnin devamı e-posta adresine sığmadı. Lütfen sayfadaki “Metni kopyala” düğmesiyle tam metni kopyalayıp buraya yapıştırın.]';
  let cut = body.slice(0, Math.max(0, Math.floor((limit - base.length) / 3) - note.length));
  while (cut.length > 0 && base.length + encodeURIComponent(cut + note).length > limit) {
    cut = cut.slice(0, -100);
  }
  return base + encodeURIComponent(cut + note);
}

export type DeliveryResult = 'sent' | 'failed';

/** Form hizmetine gönderir (FormData; Formspree ve Web3Forms ile uyumlu alan adları). */
export async function postSubmission(
  config: DeliveryConfig,
  submission: Submission,
  kind: string,
  fetchImpl: typeof fetch = fetch,
): Promise<DeliveryResult> {
  if (!config.endpoint) return 'failed';
  const data = new FormData();
  if (config.accessKey) data.set('access_key', config.accessKey);
  data.set('subject', submission.subject);
  data.set('_subject', submission.subject);
  data.set('from_name', 'Maden360 başvuru formu');
  data.set('tur', kind);
  data.set('ref', submission.ref);
  data.set('message', submission.text);
  if (submission.replyTo) {
    data.set('email', submission.replyTo);
    data.set('_replyto', submission.replyTo);
  }
  try {
    const response = await fetchImpl(config.endpoint, {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return 'failed';
    const json = (await response.json().catch(() => ({}))) as { success?: boolean; ok?: boolean };
    return json.success === false || json.ok === false ? 'failed' : 'sent';
  } catch {
    return 'failed';
  }
}
