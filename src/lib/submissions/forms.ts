import {
  analysisBasisOptions,
  availabilityOptions,
  conditionOptions,
  CURRENCIES,
  employmentTypeOptions,
  licenseKindOptions,
  licenseOfferOptions,
  LISTING_MAX_DAYS,
  marketTypeOptions,
  MINE_GROUPS,
  PROVINCES,
  QUANTITY_UNITS,
  quantityUnitLabels,
  REF_PREFIXES,
  reserveBasisOptions,
  siteTypeOptions,
  type MarketKind,
  type Option,
  type RefPrefix,
} from '@/lib/listings/options';
import type { FormKind, SubmissionType } from './types';

/**
 * Başvuru formlarının tanımları.
 *
 * Tanımlar yalnızca veri içerir (fonksiyon yok); sunucuda kayıt dosyalarındaki
 * seçeneklerle (meslekler, salonlar, market kategorileri) üretilir ve tarayıcıdaki
 * form bileşenine aktarılır.
 */

export type FieldType =
  'text' | 'textarea' | 'email' | 'tel' | 'url' | 'number' | 'select' | 'checkboxes' | 'list';

export interface ShowIf {
  field: string;
  in: string[];
}

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  integer?: boolean;
  options?: Option[];
  /** checkboxes ve list alanlarında en fazla seçim / satır */
  maxItems?: number;
  /** Seçili değer (select) */
  defaultValue?: string;
  autoComplete?: string;
  /** Yalnızca başka bir alan belirli değerlerdeyken görünür ve doğrulanır */
  showIf?: ShowIf;
  /** Metinde telefon, e-posta veya web adresi bulunamaz (aday profilleri) */
  noContactInfo?: boolean;
  /** Yayımlanmaz: yalnızca editöre iletilir, taslak içerik dosyasına yazılmaz */
  private?: boolean;
  /** list alanında yazımı il adına göre düzeltilir (Izmir → İzmir) */
  provinceList?: boolean;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  showIf?: ShowIf;
}

export type ConsentPart = string | { href: string; text: string };

export interface Consent {
  id: string;
  parts: ConsentPart[];
  showIf?: ShowIf;
}

export interface FormDefinition {
  kind: FormKind;
  title: string;
  /** Sayfa başlığının altında görünen açıklama */
  description: string;
  /** Kartlarda kısa açıklama */
  short: string;
  refPrefix: RefPrefix;
  /** Yayın süresi (gün); iletişim talebinde yok */
  durationDays?: number;
  submitLabel: string;
  sections: FormSection[];
  consents: Consent[];
}

export interface FormRegistries {
  positions: Option[];
  halls: Option[];
  marketCategories: (Option & { kind: MarketKind })[];
  /** İlan kuralları ve KVKK sayfalarının yolları */
  rulesHref: string;
  privacyHref: string;
}

const provinceOptions: Option[] = PROVINCES.map((name) => ({ value: name, label: name }));
const currencyOptions: Option[] = CURRENCIES.map((code) => ({ value: code, label: code }));

const rulesConsent = (r: FormRegistries): Consent => ({
  id: 'kurallar',
  parts: [{ href: r.rulesHref, text: 'İlan kurallarını' }, ' okudum ve kabul ediyorum.'],
});
const privacyConsent = (r: FormRegistries): Consent => ({
  id: 'kvkk',
  parts: [{ href: r.privacyHref, text: 'KVKK aydınlatma metnini' }, ' okudum.'],
});

const privateContactSection = (title: string, description: string): FormSection => ({
  id: 'sorumlu',
  title,
  description,
  fields: [
    {
      id: 'contactName',
      label: 'Ad soyad',
      type: 'text',
      required: true,
      maxLength: 80,
      autoComplete: 'name',
      private: true,
    },
    {
      id: 'contactEmail',
      label: 'E-posta',
      type: 'email',
      required: true,
      maxLength: 120,
      autoComplete: 'email',
      private: true,
    },
    {
      id: 'contactPhone',
      label: 'Telefon',
      type: 'tel',
      maxLength: 25,
      autoComplete: 'tel',
      private: true,
      help: 'Başvurunuzla ilgili soru olursa sizi arayabilmemiz için.',
    },
  ],
});

function jobForm(r: FormRegistries): FormDefinition {
  return {
    kind: 'is-ilani',
    title: 'İş ilanı ver',
    description:
      'Ocağınıza, tesisinize veya sahanıza eleman arıyorsanız ilanınızı buradan gönderin. Editör kontrolünden sonra yayımlanır, süresi dolunca kendiliğinden kalkar.',
    short: 'Eleman arayan ocak, tesis ve firmalar için.',
    refPrefix: REF_PREFIXES.job,
    durationDays: LISTING_MAX_DAYS.job,
    submitLabel: 'İlanı gönder',
    sections: [
      {
        id: 'pozisyon',
        title: 'Pozisyon',
        fields: [
          {
            id: 'title',
            label: 'İlan başlığı',
            type: 'text',
            required: true,
            minLength: 5,
            maxLength: 90,
            placeholder: 'Ör. Maden Mühendisi (Açık Ocak)',
          },
          { id: 'position', label: 'Meslek', type: 'select', required: true, options: r.positions },
          {
            id: 'employmentType',
            label: 'Çalışma şekli',
            type: 'select',
            required: true,
            options: employmentTypeOptions,
          },
          {
            id: 'siteType',
            label: 'Çalışma yeri',
            type: 'select',
            required: true,
            options: siteTypeOptions,
          },
          {
            id: 'shift',
            label: 'Vardiya düzeni',
            type: 'text',
            maxLength: 60,
            placeholder: 'Ör. 3 vardiya, 8 saat',
          },
          {
            id: 'openings',
            label: 'Alınacak kişi sayısı',
            type: 'number',
            integer: true,
            min: 1,
            max: 500,
            placeholder: '1',
          },
        ],
      },
      {
        id: 'yer',
        title: 'İşveren ve konum',
        fields: [
          {
            id: 'employerName',
            label: 'Firma adı',
            type: 'text',
            required: true,
            maxLength: 90,
            autoComplete: 'organization',
          },
          {
            id: 'employerWebsite',
            label: 'Firma web sitesi',
            type: 'url',
            maxLength: 200,
            placeholder: 'https://',
          },
          { id: 'city', label: 'İl', type: 'select', required: true, options: provinceOptions },
          { id: 'district', label: 'İlçe / saha', type: 'text', maxLength: 60 },
        ],
      },
      {
        id: 'nitelikler',
        title: 'Aranan nitelikler ve iş tanımı',
        fields: [
          {
            id: 'experienceYears',
            label: 'En az deneyim (yıl)',
            type: 'number',
            integer: true,
            min: 0,
            max: 40,
          },
          {
            id: 'education',
            label: 'Eğitim',
            type: 'text',
            maxLength: 120,
            placeholder: 'Ör. Maden Mühendisliği lisans',
          },
          {
            id: 'requirements',
            label: 'Aranan nitelikler',
            type: 'list',
            maxItems: 12,
            maxLength: 1500,
            help: 'Her satıra bir madde yazın.',
          },
          {
            id: 'certificates',
            label: 'İstenen belgeler',
            type: 'list',
            maxItems: 8,
            maxLength: 600,
            help: 'Her satıra bir belge (ör. G sınıfı sürücü belgesi, MYK mesleki yeterlilik belgesi).',
          },
          {
            id: 'benefits',
            label: 'Yan haklar',
            type: 'list',
            maxItems: 8,
            maxLength: 600,
            help: 'Her satıra bir madde (ör. Servis, yemek, lojman).',
          },
          {
            id: 'salaryMin',
            label: 'Ücret (en az, net aylık TL)',
            type: 'number',
            min: 1,
            max: 10_000_000,
            help: 'Belirtmek istemezseniz boş bırakın.',
          },
          {
            id: 'salaryMax',
            label: 'Ücret (en çok, net aylık TL)',
            type: 'number',
            min: 1,
            max: 10_000_000,
          },
          {
            id: 'description',
            label: 'İş tanımı',
            type: 'textarea',
            required: true,
            minLength: 80,
            maxLength: 4000,
            help: 'Görev ve sorumluluklar, çalışma koşulları. En az 80 karakter.',
          },
        ],
      },
      {
        id: 'basvuru',
        title: 'Adaylar nasıl başvuracak?',
        description: 'Bu bilgiler ilanda görünür.',
        fields: [
          {
            id: 'applyMethod',
            label: 'Başvuru yöntemi',
            type: 'select',
            required: true,
            options: [
              { value: 'eposta', label: 'E-posta' },
              { value: 'url', label: 'Başvuru sayfası (web adresi)' },
              { value: 'telefon', label: 'Telefon' },
            ],
          },
          {
            id: 'applyValue',
            label: 'Başvuru adresi',
            type: 'text',
            required: true,
            maxLength: 200,
            help: 'Seçtiğiniz yönteme göre e-posta adresi, web adresi veya telefon numarası.',
          },
          {
            id: 'applyNote',
            label: 'Başvuru notu',
            type: 'text',
            maxLength: 160,
            placeholder: 'Ör. Konuya ilan numarasını yazın',
          },
        ],
      },
      privateContactSection(
        'İlan sorumlusu (yayımlanmaz)',
        'İlanı doğrulamak için kullanılır, ilanda görünmez.',
      ),
    ],
    consents: [
      rulesConsent(r),
      privacyConsent(r),
      {
        id: 'yetki',
        parts: [
          'Bilgilerin doğru olduğunu ve firmayı temsil etmeye yetkili olduğumu beyan ederim.',
        ],
      },
    ],
  };
}

function candidateForm(r: FormRegistries): FormDefinition {
  return {
    kind: 'aday-profili',
    title: 'İş arıyorum: aday profili oluştur',
    description:
      'Deneyiminizi, belgelerinizi ve çalışmak istediğiniz illeri yazın. Adınız ve iletişim bilgileriniz yayımlanmaz. İşverenlerin taleplerini editör size iletir.',
    short: 'İş arayan mühendis, tekniker ve operatörler için. İletişim bilgileriniz gizli kalır.',
    refPrefix: REF_PREFIXES.candidate,
    durationDays: LISTING_MAX_DAYS.candidate,
    submitLabel: 'Profili gönder',
    sections: [
      {
        id: 'profil',
        title: 'Profil',
        description: 'Bu bölümdeki bilgiler yayımlanır. Ad, telefon, e-posta veya adres yazmayın.',
        fields: [
          {
            id: 'headline',
            label: 'Profil başlığı',
            type: 'text',
            required: true,
            minLength: 5,
            maxLength: 90,
            noContactInfo: true,
            placeholder: 'Ör. Ekskavatör operatörü, 8 yıl',
          },
          { id: 'position', label: 'Meslek', type: 'select', required: true, options: r.positions },
          {
            id: 'experienceYears',
            label: 'Deneyim (yıl)',
            type: 'number',
            required: true,
            integer: true,
            min: 0,
            max: 50,
          },
          {
            id: 'education',
            label: 'Eğitim',
            type: 'text',
            maxLength: 120,
            noContactInfo: true,
            placeholder: 'Ör. Maden Teknikerliği ön lisans',
          },
          {
            id: 'certificates',
            label: 'Belgeler',
            type: 'list',
            maxItems: 10,
            maxLength: 800,
            noContactInfo: true,
            help: 'Her satıra bir belge (ör. G sınıfı sürücü belgesi).',
          },
          {
            id: 'skills',
            label: 'Beceriler ve deneyim alanları',
            type: 'list',
            maxItems: 12,
            maxLength: 1000,
            noContactInfo: true,
            help: 'Her satıra bir madde.',
          },
          { id: 'languages', label: 'Yabancı diller', type: 'list', maxItems: 5, maxLength: 200 },
          {
            id: 'about',
            label: 'Kendinizi kısaca tanıtın',
            type: 'textarea',
            required: true,
            minLength: 50,
            maxLength: 2000,
            noContactInfo: true,
            help: 'Çalıştığınız iş türleri, kullandığınız ekipmanlar, aradığınız iş. Firma veya kişi adı vermeyin.',
          },
        ],
      },
      {
        id: 'tercihler',
        title: 'Tercihler',
        fields: [
          {
            id: 'preferredCities',
            label: 'Çalışmak istediğiniz iller',
            type: 'list',
            required: true,
            maxItems: 10,
            maxLength: 300,
            provinceList: true,
            help: 'Her satıra bir il yazın veya “Türkiye geneli” yazın.',
          },
          {
            id: 'siteTypes',
            label: 'Çalışma yeri tercihi',
            type: 'checkboxes',
            options: siteTypeOptions,
          },
          {
            id: 'employmentTypes',
            label: 'Çalışma şekli tercihi',
            type: 'checkboxes',
            options: employmentTypeOptions,
          },
          {
            id: 'availability',
            label: 'Ne zaman başlayabilirsiniz?',
            type: 'select',
            required: true,
            options: availabilityOptions,
            defaultValue: 'belirtilmedi',
          },
        ],
      },
      {
        id: 'iletisim',
        title: 'İletişim bilgileriniz (yayımlanmaz)',
        description:
          'Bu bilgileri yalnızca editör görür ve işverenlerin taleplerini size bu bilgilerle iletir.',
        fields: [
          {
            id: 'contactName',
            label: 'Ad soyad',
            type: 'text',
            required: true,
            maxLength: 80,
            autoComplete: 'name',
            private: true,
          },
          {
            id: 'contactEmail',
            label: 'E-posta',
            type: 'email',
            required: true,
            maxLength: 120,
            autoComplete: 'email',
            private: true,
          },
          {
            id: 'contactPhone',
            label: 'Telefon',
            type: 'tel',
            maxLength: 25,
            autoComplete: 'tel',
            private: true,
          },
        ],
      },
    ],
    consents: [
      rulesConsent(r),
      privacyConsent(r),
      {
        id: 'acik-riza',
        parts: [
          'Profilimin ad ve iletişim bilgilerim olmadan Maden360’ta yayımlanmasına ve işverenlerden gelen iletişim taleplerinin bana iletilmesine açık rıza veriyorum.',
        ],
      },
    ],
  };
}

function marketForm(r: FormRegistries): FormDefinition {
  const slugsOf = (...kinds: MarketKind[]) =>
    r.marketCategories
      .filter((category) => kinds.includes(category.kind))
      .map((category) => category.value);
  const equipment = slugsOf('ekipman', 'parca');
  const ore = slugsOf('cevher');
  const site = slugsOf('saha');
  return {
    kind: 'market-ilani',
    title: 'Market ilanı ver',
    description:
      'Satılık veya kiralık makine, yedek parça, hizmet, cevher ve saha ilanı verin. Maden360 alım satıma taraf değildir, ödeme almaz. Alıcılar sizinle doğrudan veya editör aracılığıyla iletişime geçer.',
    short: 'Makine, parça, hizmet, cevher veya saha satan, kiralayan ya da arayanlar için.',
    refPrefix: REF_PREFIXES.market,
    durationDays: LISTING_MAX_DAYS.market,
    submitLabel: 'İlanı gönder',
    sections: [
      {
        id: 'ilan',
        title: 'İlan',
        fields: [
          {
            id: 'category',
            label: 'Kategori',
            type: 'select',
            required: true,
            options: r.marketCategories.map(({ value, label }) => ({ value, label })),
          },
          {
            id: 'type',
            label: 'İlan türü',
            type: 'select',
            required: true,
            options: marketTypeOptions,
          },
          {
            id: 'title',
            label: 'İlan başlığı',
            type: 'text',
            required: true,
            minLength: 5,
            maxLength: 90,
            placeholder: 'Ör. 30 tonluk paletli ekskavatör',
          },
          {
            id: 'description',
            label: 'Açıklama',
            type: 'textarea',
            required: true,
            minLength: 80,
            maxLength: 4000,
            help: 'Durum, bakım geçmişi, teslim koşulları, belgeler. En az 80 karakter.',
          },
        ],
      },
      {
        id: 'urun',
        title: 'Ekipman bilgileri',
        showIf: { field: 'category', in: equipment },
        fields: [
          { id: 'condition', label: 'Durum', type: 'select', options: conditionOptions },
          { id: 'brand', label: 'Marka', type: 'text', maxLength: 40 },
          { id: 'model', label: 'Model', type: 'text', maxLength: 40 },
          { id: 'year', label: 'Model yılı', type: 'number', integer: true, min: 1950, max: 2100 },
          {
            id: 'hours',
            label: 'Çalışma saati',
            type: 'number',
            integer: true,
            min: 0,
            max: 500_000,
          },
        ],
      },
      {
        id: 'cevher',
        title: 'Cevher ve ürün bilgileri',
        showIf: { field: 'category', in: ore },
        fields: [
          {
            id: 'oreMineral',
            label: 'Cevher / ürün',
            type: 'text',
            required: true,
            maxLength: 60,
            placeholder: 'Ör. Krom cevheri, feldspat',
          },
          {
            id: 'oreGrade',
            label: 'Tenör / kalite',
            type: 'text',
            maxLength: 60,
            placeholder: 'Ör. %40–42 Cr₂O₃',
          },
          {
            id: 'oreAnalysis',
            label: 'Tenör bilgisinin dayanağı',
            type: 'select',
            required: true,
            options: analysisBasisOptions,
          },
          {
            id: 'oreDelivery',
            label: 'Teslim şekli',
            type: 'text',
            maxLength: 60,
            placeholder: 'Ör. Ocak başı, liman teslim',
          },
          { id: 'quantityValue', label: 'Miktar', type: 'number', min: 0.001, max: 100_000_000 },
          {
            id: 'quantityUnit',
            label: 'Miktar birimi',
            type: 'select',
            options: QUANTITY_UNITS.map((unit) => ({
              value: unit,
              label: quantityUnitLabels[unit],
            })),
            defaultValue: 't',
          },
        ],
      },
      {
        id: 'saha',
        title: 'Saha ve ruhsat bilgileri',
        description:
          'Ruhsat numarası ve koordinatlar yayımlanmaz. Editör doğrulama için isteyebilir.',
        showIf: { field: 'category', in: site },
        fields: [
          {
            id: 'licenseGroup',
            label: 'Maden grubu',
            type: 'select',
            required: true,
            options: MINE_GROUPS.map((group) => ({ value: group, label: `${group} Grubu` })),
          },
          {
            id: 'licenseKind',
            label: 'Ruhsat türü',
            type: 'select',
            required: true,
            options: licenseKindOptions,
          },
          {
            id: 'licenseOffer',
            label: 'Teklif',
            type: 'select',
            required: true,
            options: licenseOfferOptions,
          },
          {
            id: 'licenseArea',
            label: 'Ruhsat alanı (hektar)',
            type: 'number',
            min: 0.01,
            max: 1_000_000,
          },
          {
            id: 'licenseReserve',
            label: 'Rezerv bilgisinin dayanağı',
            type: 'select',
            required: true,
            options: reserveBasisOptions,
            defaultValue: 'yok',
          },
        ],
      },
      {
        id: 'fiyat',
        title: 'Fiyat ve konum',
        fields: [
          {
            id: 'priceAmount',
            label: 'Fiyat',
            type: 'number',
            min: 0.01,
            max: 10_000_000_000,
            help: 'Boş bırakırsanız ilanda “Fiyat sorunuz” yazar.',
          },
          {
            id: 'priceCurrency',
            label: 'Para birimi',
            type: 'select',
            options: currencyOptions,
            defaultValue: 'TRY',
          },
          {
            id: 'pricePer',
            label: 'Fiyat birimi',
            type: 'text',
            maxLength: 20,
            placeholder: 'Ör. ton, gün, metre',
          },
          {
            id: 'priceVat',
            label: 'KDV',
            type: 'select',
            options: [
              { value: 'haric', label: 'KDV hariç' },
              { value: 'dahil', label: 'KDV dahil' },
            ],
          },
          { id: 'city', label: 'İl', type: 'select', required: true, options: provinceOptions },
          { id: 'district', label: 'İlçe', type: 'text', maxLength: 60 },
        ],
      },
      {
        id: 'satici',
        title: 'Satıcı ve iletişim',
        fields: [
          {
            id: 'sellerName',
            label: 'Firma veya satıcı adı',
            type: 'text',
            required: true,
            maxLength: 90,
            autoComplete: 'organization',
          },
          {
            id: 'sellerKind',
            label: 'Satıcı türü',
            type: 'select',
            required: true,
            options: [
              { value: 'firma', label: 'Firma' },
              { value: 'kisi', label: 'Bireysel' },
            ],
          },
          {
            id: 'contactMode',
            label: 'İletişim bilgileri ilanda görünsün mü?',
            type: 'select',
            required: true,
            defaultValue: 'aracili',
            options: [
              { value: 'aracili', label: 'Hayır, talepler Maden360 üzerinden iletilsin' },
              { value: 'dogrudan', label: 'Evet, telefon ve e-postam ilanda görünsün' },
            ],
            help: 'Bireysel satıcılara gizli iletişimi öneriyoruz.',
          },
          {
            id: 'contactEmail',
            label: 'E-posta',
            type: 'email',
            required: true,
            maxLength: 120,
            autoComplete: 'email',
          },
          { id: 'contactPhone', label: 'Telefon', type: 'tel', maxLength: 25, autoComplete: 'tel' },
          {
            id: 'website',
            label: 'Web sitesi',
            type: 'url',
            maxLength: 200,
            placeholder: 'https://',
          },
        ],
      },
    ],
    consents: [
      rulesConsent(r),
      privacyConsent(r),
      {
        id: 'yetki-saha',
        parts: [
          'Ruhsat sahibi olduğumu veya ruhsat sahibi tarafından yetkilendirildiğimi beyan ederim.',
        ],
        showIf: { field: 'category', in: site },
      },
      {
        id: 'yetki-cevher',
        parts: ['İlan konusu cevherin veya ürünün ruhsatlı bir sahadan üretildiğini beyan ederim.'],
        showIf: { field: 'category', in: ore },
      },
    ],
  };
}

function standForm(r: FormRegistries): FormDefinition {
  return {
    kind: 'fuar-standi',
    title: 'Sanal fuarda stand açın',
    description:
      'Firmanızın ürünlerini, markalarını ve iletişim bilgilerini sanal fuarda bir stand sayfasında yayımlayın. Editör bilgileri doğruladıktan sonra yayımlanır. Stand yılda bir yenilenir.',
    short: 'Tedarikçi ve hizmet firmaları için.',
    refPrefix: REF_PREFIXES.stand,
    durationDays: LISTING_MAX_DAYS.stand,
    submitLabel: 'Stand başvurusunu gönder',
    sections: [
      {
        id: 'firma',
        title: 'Firma',
        fields: [
          {
            id: 'name',
            label: 'Firma adı',
            type: 'text',
            required: true,
            minLength: 2,
            maxLength: 90,
            autoComplete: 'organization',
          },
          {
            id: 'summary',
            label: 'Kısa tanıtım',
            type: 'textarea',
            required: true,
            minLength: 40,
            maxLength: 220,
            help: 'Stand kartında görünür. 40–220 karakter.',
          },
          {
            id: 'halls',
            label: 'Salonlar',
            type: 'checkboxes',
            required: true,
            maxItems: 3,
            options: r.halls,
            help: 'Firmanızın yer alacağı en fazla üç salon seçin.',
          },
          {
            id: 'city',
            label: 'Merkez (il)',
            type: 'select',
            required: true,
            options: provinceOptions,
          },
          {
            id: 'serviceArea',
            label: 'Hizmet verilen bölgeler',
            type: 'list',
            maxItems: 12,
            maxLength: 400,
            provinceList: true,
            help: 'Her satıra bir il yazın. “Türkiye geneli” veya “Yurt dışı” da yazabilirsiniz.',
          },
          {
            id: 'founded',
            label: 'Kuruluş yılı',
            type: 'number',
            integer: true,
            min: 1800,
            max: 2100,
          },
          {
            id: 'description',
            label: 'Firma tanıtımı',
            type: 'textarea',
            required: true,
            minLength: 80,
            maxLength: 4000,
            help: 'Faaliyet alanı, referans projeler, ekip ve tesisler. En az 80 karakter.',
          },
        ],
      },
      {
        id: 'urunler',
        title: 'Ürün ve hizmetler',
        fields: [
          {
            id: 'offerings',
            label: 'Ürün ve hizmetler',
            type: 'list',
            required: true,
            maxItems: 12,
            maxLength: 2000,
            help: 'Her satıra bir ürün veya hizmet. Açıklama eklemek için iki nokta kullanın: “Karotlu sondaj: HQ ve NQ çaplarında, 600 m derinliğe kadar”.',
          },
          {
            id: 'brands',
            label: 'Temsil edilen markalar',
            type: 'list',
            maxItems: 12,
            maxLength: 400,
          },
          {
            id: 'certificates',
            label: 'Belgeler ve sertifikalar',
            type: 'list',
            maxItems: 8,
            maxLength: 400,
            help: 'Ör. ISO 9001, ISO 45001, akreditasyon.',
          },
        ],
      },
      {
        id: 'iletisim',
        title: 'Stand iletişim bilgileri',
        description: 'Bu bilgiler stand sayfasında görünür. En az birini doldurun.',
        fields: [
          {
            id: 'website',
            label: 'Web sitesi',
            type: 'url',
            maxLength: 200,
            placeholder: 'https://',
          },
          { id: 'email', label: 'Kurumsal e-posta', type: 'email', maxLength: 120 },
          { id: 'phone', label: 'Telefon', type: 'tel', maxLength: 25 },
          {
            id: 'address',
            label: 'Adres',
            type: 'text',
            maxLength: 200,
            autoComplete: 'street-address',
          },
        ],
      },
      {
        ...privateContactSection(
          'Başvuru sorumlusu (yayımlanmaz)',
          'Firma bilgilerini doğrulamak için kullanılır.',
        ),
        fields: [
          ...privateContactSection('', '').fields,
          {
            id: 'companyRecord',
            label: 'Ticaret unvanı veya vergi numarası',
            type: 'text',
            maxLength: 120,
            private: true,
            help: 'Firmayı doğrulamak için istenir, yayımlanmaz.',
          },
        ],
      },
    ],
    consents: [
      rulesConsent(r),
      privacyConsent(r),
      {
        id: 'yetki',
        parts: [
          'Firmayı temsil etmeye yetkili olduğumu ve bilgilerin doğru olduğunu beyan ederim.',
        ],
      },
    ],
  };
}

function contactRequestForm(r: FormRegistries): FormDefinition {
  return {
    kind: 'iletisim-talebi',
    title: 'İletişim talebi gönder',
    description:
      'Aday profilleri ve iletişim bilgisi gizli market ilanları için talebinizi bize iletin. Editör talebi ilan sahibine ulaştırır. İlan sahibi uygun görürse sizinle iletişime geçer.',
    short: 'Aday veya ilan sahibine editör aracılığıyla ulaşın.',
    refPrefix: REF_PREFIXES.contact,
    submitLabel: 'Talebi gönder',
    sections: [
      {
        id: 'talep',
        title: 'Talep',
        fields: [
          {
            id: 'ref',
            label: 'İlan veya profil numarası',
            type: 'text',
            required: true,
            maxLength: 20,
            placeholder: 'Ör. ADY-20261016-K7QX',
            help: 'İlan sayfasında “İlan no” olarak yazar.',
          },
          {
            id: 'message',
            label: 'Mesajınız',
            type: 'textarea',
            required: true,
            minLength: 20,
            maxLength: 2000,
            help: 'Pozisyon veya talep ayrıntıları, size nasıl ulaşılabileceği.',
          },
        ],
      },
      {
        id: 'siz',
        title: 'Bilgileriniz',
        description: 'İlan sahibine iletilir.',
        fields: [
          {
            id: 'contactName',
            label: 'Ad soyad',
            type: 'text',
            required: true,
            maxLength: 80,
            autoComplete: 'name',
            private: true,
          },
          {
            id: 'company',
            label: 'Firma',
            type: 'text',
            maxLength: 90,
            autoComplete: 'organization',
            private: true,
          },
          {
            id: 'contactEmail',
            label: 'E-posta',
            type: 'email',
            required: true,
            maxLength: 120,
            autoComplete: 'email',
            private: true,
          },
          {
            id: 'contactPhone',
            label: 'Telefon',
            type: 'tel',
            maxLength: 25,
            autoComplete: 'tel',
            private: true,
          },
        ],
      },
    ],
    consents: [
      privacyConsent(r),
      {
        id: 'aktarim',
        parts: ['Bilgilerimin ve mesajımın ilan sahibine iletilmesini kabul ediyorum.'],
      },
    ],
  };
}

export function getFormDefinition(kind: FormKind, registries: FormRegistries): FormDefinition {
  switch (kind) {
    case 'is-ilani':
      return jobForm(registries);
    case 'aday-profili':
      return candidateForm(registries);
    case 'market-ilani':
      return marketForm(registries);
    case 'fuar-standi':
      return standForm(registries);
    case 'iletisim-talebi':
      return contactRequestForm(registries);
  }
}

/** /ilan-ver sayfasındaki kartlar için sıralama */
export const SUBMISSION_ORDER: SubmissionType[] = [
  'is-ilani',
  'aday-profili',
  'market-ilani',
  'fuar-standi',
];

/** Bir alanın ya da bölümün mevcut değerlere göre görünüp görünmediği */
export function isShown(
  showIf: ShowIf | undefined,
  values: Record<string, string | string[]>,
): boolean {
  if (!showIf) return true;
  const value = values[showIf.field];
  return typeof value === 'string' && showIf.in.includes(value);
}

export function allFields(definition: FormDefinition): FormField[] {
  return definition.sections.flatMap((section) =>
    section.fields.map((field) =>
      section.showIf && !field.showIf ? { ...field, showIf: section.showIf } : field,
    ),
  );
}
