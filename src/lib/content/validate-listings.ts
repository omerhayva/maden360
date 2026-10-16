import { daysBetween } from '@/lib/format';
import { findContactInfo, isPhoneNumber } from '@/lib/listings/contact';
import { LISTING_MAX_DAYS, listingKindLabels, type ListingKind } from '@/lib/listings/options';
import { reservedSlugs } from '@/i18n/routes';
import type { ContentStore, ListingEntry } from './repository';
import { emailSchema, httpUrlSchema, type Person } from './schemas';

/**
 * İlan kuralları: fuar standı, iş ilanı, aday profili ve market ilanı.
 * Kuralların açıklaması: docs/ilanlar-ve-fuar.md
 */

export interface ListingValidationContext {
  today: string;
  error: (file: string, message: string) => void;
  warn: (file: string, message: string) => void;
  people: Map<string, Person>;
  /** Site içi bağlantı denetimi (validate.ts ile ortak) */
  checkInternalLink: (file: string, href: string, isPublished: boolean) => void;
  /** public/ altındaki dosyanın bayt cinsinden boyutu; dosya yoksa null */
  publicFileSize: (publicPath: string) => number | null;
  /** Mevzuat atıflarının yeniden kontrol edilmesi gereken gün sayısı */
  legalCheckMaxAgeDays: number;
}

/** Patlayıcı madde alım-satımı ilan kurallarına göre kabul edilmez. */
const PROHIBITED_PATTERN =
  /\b(dinamit|kapsül|kapsul|fünye|funye|infilakl[ıi] fitil|anfo|jelatinit|emülsiyon patlay[ıi]c[ıi]|patlay[ıi]c[ıi] madde sat)/iu;

const IMAGE_WARN_BYTES = 500 * 1024;

function titleOf(entry: ListingEntry): string {
  switch (entry.kind) {
    case 'stand':
      return entry.name;
    case 'candidate':
      return entry.headline;
    default:
      return entry.title;
  }
}

export function validateListings(store: ContentStore, ctx: ListingValidationContext): void {
  const { today, error, warn, people } = ctx;

  /* ---------------- Kayıt dosyaları ---------------- */
  const duplicates = (ids: string[], file: string, label: string) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) error(file, `Yinelenen ${label}: "${id}".`);
      seen.add(id);
    }
  };
  duplicates(store.halls.map((hall) => hall.slug), 'content/fuar-salonlari.yaml', 'salon kimliği');
  duplicates(store.halls.map((hall) => hall.code), 'content/fuar-salonlari.yaml', 'salon kodu');
  duplicates(
    store.marketCategories.map((category) => category.slug),
    'content/market-kategorileri.yaml',
    'kategori kimliği',
  );
  duplicates(store.positions.map((position) => position.slug), 'content/meslekler.yaml', 'meslek kimliği');

  // Kategori notlarındaki mevzuat atıfları: tarih geçerli ve güncel olmalı
  for (const category of store.marketCategories) {
    for (const reference of category.notice?.references ?? []) {
      const where = `"${category.slug}" notu (${reference.title})`;
      if (reference.checkedAt > today) {
        error('content/market-kategorileri.yaml', `${where}: checkedAt gelecekte olamaz.`);
      } else if (daysBetween(reference.checkedAt, today) > ctx.legalCheckMaxAgeDays) {
        warn(
          'content/market-kategorileri.yaml',
          `${where}: resmî metin ${Math.round(ctx.legalCheckMaxAgeDays / 30)} aydan uzun süredir kontrol edilmedi; güncel metni kontrol edip checkedAt'i yenileyin.`,
        );
      }
    }
  }

  const halls = new Set(store.halls.map((hall) => hall.slug));
  const positions = new Set(store.positions.map((position) => position.slug));
  const categories = new Map(store.marketCategories.map((category) => [category.slug, category]));
  const stands = new Map(store.stands.map((stand) => [stand.slug, stand]));

  /* ---------------- Ortak kurallar ---------------- */
  const common = (entry: ListingEntry, kind: ListingKind) => {
    const file = entry.file;
    const isPublished = entry.status === 'published';
    const label = listingKindLabels[kind].toLocaleLowerCase('tr-TR');

    for (const [field, value] of [
      ['postedAt', entry.postedAt],
      ['moderatedAt', entry.moderatedAt],
      ['updatedAt', entry.updatedAt],
    ] as const) {
      if (value && value > today) error(file, `${field} gelecekte olamaz (${value}).`);
    }
    if (entry.postedAt && entry.expiresAt) {
      if (entry.expiresAt < entry.postedAt) {
        error(file, 'expiresAt (bitiş), postedAt (yayın) tarihinden önce olamaz.');
      } else {
        const days = daysBetween(entry.postedAt, entry.expiresAt);
        const max = LISTING_MAX_DAYS[kind];
        if (days > max) error(file, `Yayın süresi ${days} gün; ${label} için en fazla ${max} gün olabilir.`);
      }
    }
    if (entry.moderatedBy) {
      const person = people.get(entry.moderatedBy);
      if (!person) error(file, `Tanımsız onaylayan: "${entry.moderatedBy}" (content/kisiler.yaml).`);
      else if (!person.canModerate) {
        error(file, `"${entry.moderatedBy}" ilan onaylama yetkisine sahip değil (canModerate: true olmalı).`);
      }
    }
    if (entry.example && isPublished) {
      error(file, 'Örnek içerik (example: true) yayımlanamaz; gerçek bir ilan için yeni dosya oluşturun.');
    }
    if (isPublished) {
      if (!entry.postedAt) error(file, 'Yayımlanan ilanda postedAt (yayın tarihi) zorunlu.');
      if (!entry.expiresAt) error(file, 'Yayımlanan ilanda expiresAt (bitiş tarihi) zorunlu.');
      if (!entry.moderatedBy) error(file, 'Yayımlanan ilanda moderatedBy (onaylayan editör) zorunlu.');
      if (!entry.moderatedAt) error(file, 'Yayımlanan ilanda moderatedAt (onay tarihi) zorunlu.');
      if (entry.expiresAt && entry.expiresAt < today) {
        warn(
          file,
          `İlanın süresi ${entry.expiresAt} tarihinde doldu; üretim derlemesinde yayımlanmaz. Dosyayı silin veya yeni süreyle yeniden onaylayın.`,
        );
      }
    }
    for (const href of entry.internalLinks) ctx.checkInternalLink(file, href, isPublished);

    // Aday profilleri arama motorlarına kapalıdır (noindex); SEO uzunluk uyarısı gerekmez.
    if (kind === 'candidate') return;
    const pageTitle = entry.seoTitle ?? titleOf(entry);
    if (pageTitle.length > 60) {
      warn(file, `Sayfa başlığı ${pageTitle.length} karakter; arama sonuçlarında kesilebilir (öneri ≤ 60, seoTitle ile kısaltın).`);
    }
    const description = entry.seoDescription ?? entry.summary;
    if (description.length > 160) {
      warn(file, `Açıklama ${description.length} karakter (öneri ≤ 160, seoDescription ekleyin).`);
    }
  };

  /* ---------------- Fuar standları ---------------- */
  for (const stand of store.stands) {
    common(stand, 'stand');
    const file = stand.file;
    if ((reservedSlugs.stands as readonly string[]).includes(stand.slug)) {
      error(file, `"${stand.slug}" adı ayrılmış bir yol; dosya adını değiştirin.`);
    }
    for (const hall of stand.halls) {
      if (!halls.has(hall)) error(file, `Tanımsız salon: "${hall}" (content/fuar-salonlari.yaml).`);
    }
    if (!stand.website && !stand.email && !stand.phone) {
      error(file, 'Standda en az bir iletişim bilgisi (website, email veya phone) olmalı.');
    }
    if (stand.logo && ctx.publicFileSize(stand.logo) === null) {
      error(file, `Logo dosyası bulunamadı: public${stand.logo}`);
    }
    if (stand.verification && stand.verification.checkedAt > today) {
      error(file, 'verification.checkedAt gelecekte olamaz.');
    }
    if (stand.status === 'published' && !stand.verification) {
      warn(file, 'Firma bilgilerinin nasıl doğrulandığı (verification) belirtilmemiş.');
    }
    if (stand.offerings.length === 0) warn(file, 'Ürün ve hizmet listesi (offerings) boş.');
  }

  /* ---------------- İş ilanları ---------------- */
  for (const job of store.jobs) {
    common(job, 'job');
    const file = job.file;
    if (!positions.has(job.position)) error(file, `Tanımsız meslek: "${job.position}" (content/meslekler.yaml).`);
    if (job.employer.stand) {
      const stand = stands.get(job.employer.stand);
      if (!stand) error(file, `Tanımsız fuar standı: "${job.employer.stand}".`);
      else if (job.status === 'published' && stand.status !== 'published') {
        warn(file, `Bağlı fuar standı "${job.employer.stand}" yayımlanmadı; bağlantı yayında görünmeyecek.`);
      }
    }
    const { method, value } = job.apply;
    const applyValid =
      method === 'eposta'
        ? emailSchema.safeParse(value).success
        : method === 'url'
          ? httpUrlSchema.safeParse(value).success
          : isPhoneNumber(value);
    if (!applyValid) error(file, `Başvuru bilgisi (apply.value) "${method}" yöntemine uygun değil: ${value}`);
    if (job.salary?.min !== undefined && job.salary.max !== undefined && job.salary.min > job.salary.max) {
      error(file, 'Ücret aralığında en düşük değer (salary.min) en yüksek değerden (salary.max) büyük olamaz.');
    }
  }

  /* ---------------- Aday profilleri ---------------- */
  for (const candidate of store.candidates) {
    common(candidate, 'candidate');
    const file = candidate.file;
    if (!positions.has(candidate.position)) {
      error(file, `Tanımsız meslek: "${candidate.position}" (content/meslekler.yaml).`);
    }
    if (!candidate.ref) {
      error(file, 'Aday profilinde başvuru numarası (ref) zorunlu; iletişim talepleri bu numarayla eşleştirilir.');
    } else {
      if (!candidate.ref.startsWith('ADY-')) error(file, 'Aday profilinin başvuru numarası ADY- ile başlamalı.');
      if (candidate.slug !== candidate.ref.toLowerCase()) {
        error(file, `Dosya adı başvuru numarasıyla aynı olmalı: ${candidate.ref.toLowerCase()}.md (kişisel bilgi URL'ye girmesin).`);
      }
    }
    if (candidate.consentAt > today) error(file, 'consentAt (açık rıza tarihi) gelecekte olamaz.');
    if (candidate.postedAt && candidate.consentAt > candidate.postedAt) {
      error(file, 'Profil, aday açık rıza vermeden (consentAt) önce yayımlanamaz.');
    }
    const freeText = [
      candidate.headline,
      candidate.summary,
      candidate.education ?? '',
      ...candidate.skills,
      ...candidate.certificates,
      candidate.body,
    ].join('\n');
    const found = findContactInfo(freeText);
    if (found.length > 0) {
      error(
        file,
        `Aday profilinde iletişim bilgisi bulunamaz (${found.map((match) => match.text).join(', ')}). Talepler editör aracılığıyla iletilir; bu bilgileri silin.`,
      );
    }
  }

  /* ---------------- Market ilanları ---------------- */
  for (const listing of store.marketListings) {
    common(listing, 'market');
    const file = listing.file;
    if ((reservedSlugs.marketListings as readonly string[]).includes(listing.slug)) {
      error(file, `"${listing.slug}" adı ayrılmış bir yol; dosya adını değiştirin.`);
    }
    const category = categories.get(listing.category);
    if (!category) {
      error(file, `Tanımsız market kategorisi: "${listing.category}" (content/market-kategorileri.yaml).`);
    } else {
      if (category.kind === 'cevher' && !listing.ore) {
        error(file, 'Cevher ve ürün ilanlarında ore bloğu (mineral, tenör dayanağı) zorunlu.');
      }
      if (category.kind === 'saha' && !listing.license) {
        error(file, 'Saha ve ruhsat ilanlarında license bloğu (maden grubu, ruhsat türü, teklif) zorunlu.');
      }
      if (category.kind !== 'cevher' && listing.ore) warn(file, 'ore bloğu yalnızca cevher ve ürün ilanlarında kullanılır.');
      if (category.kind !== 'saha' && listing.license) warn(file, 'license bloğu yalnızca saha ve ruhsat ilanlarında kullanılır.');
      if (listing.condition && category.kind !== 'ekipman' && category.kind !== 'parca') {
        warn(file, 'condition (durum) yalnızca ekipman ve yedek parça ilanlarında anlamlıdır.');
      }
      if (category.kind === 'hizmet' && listing.type !== 'hizmet') {
        warn(file, 'Hizmetler kategorisindeki ilanlarda type: hizmet kullanılmalı.');
      }
      if (listing.type === 'hizmet' && category.kind !== 'hizmet') {
        warn(file, 'type: hizmet olan ilan "hizmetler" kategorisinde olmalı.');
      }
    }
    if (listing.seller.stand && !stands.has(listing.seller.stand)) {
      error(file, `Tanımsız fuar standı: "${listing.seller.stand}".`);
    }
    const { mode, phone, email, website } = listing.contact;
    if (mode === 'dogrudan' && !phone && !email && !website) {
      error(file, 'Doğrudan iletişimli ilanda en az bir iletişim bilgisi (phone, email veya website) olmalı.');
    }
    if (mode === 'aracili' && (phone || email)) {
      error(file, 'Aracılı (gizli) iletişimde telefon ve e-posta içerik dosyasına yazılmaz; talepler editör aracılığıyla iletilir.');
    }
    if (mode === 'dogrudan' && listing.seller.kind === 'kisi' && (phone || email)) {
      warn(
        file,
        'Bireysel satıcının telefon/e-postası herkese açık depoda kalıcı olarak saklanır; satıcıya aracılı iletişim (mode: aracili) önerin.',
      );
    }
    for (const image of listing.images) {
      const size = ctx.publicFileSize(image.src);
      if (size === null) error(file, `Görsel bulunamadı: public${image.src}`);
      else if (size > IMAGE_WARN_BYTES) {
        warn(file, `Görsel ${Math.round(size / 1024)} KB (${image.src}); sayfa hızı için 500 KB altına küçültün (WebP önerilir).`);
      }
    }
    const text = [listing.title, listing.summary, listing.body].join('\n');
    if (PROHIBITED_PATTERN.test(text)) {
      warn(file, 'İlanda patlayıcı madde ile ilgili ifade var; patlayıcı madde alım-satım ilanları kabul edilmez (ilan kuralları). Kontrol edin.');
    }
  }
}
