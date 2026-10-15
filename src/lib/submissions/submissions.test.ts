import { describe, expect, it, vi } from 'vitest';
import { parseFrontmatter } from '@/lib/content/frontmatter';
import {
  candidateFrontmatterSchema,
  jobFrontmatterSchema,
  marketFrontmatterSchema,
  standFrontmatterSchema,
} from '@/lib/content/schemas';
import { buildMailto, postSubmission } from './deliver';
import { toYaml } from './draft';
import { getFormDefinition, type FormRegistries } from './forms';
import { buildSubmission } from './message';
import { validateSubmission } from './validate';
import { canonicalProvince, parseFormNumber, type FormValues } from './values';

const registries: FormRegistries = {
  positions: [
    { value: 'maden-muhendisi', label: 'Maden Mühendisi' },
    { value: 'is-makinesi-operatoru', label: 'İş Makinesi Operatörü' },
  ],
  halls: [
    { value: 'sondaj-arama', label: 'C · Sondaj, Arama ve Jeoloji' },
    { value: 'laboratuvar', label: 'G · Laboratuvar ve Analiz' },
  ],
  marketCategories: [
    { value: 'is-makineleri', label: 'İş makineleri', kind: 'ekipman' },
    { value: 'cevher-urun', label: 'Cevher ve ürün', kind: 'cevher' },
    { value: 'saha-ruhsat', label: 'Saha, ruhsat ve rödövans', kind: 'saha' },
  ],
  rulesHref: '/ilan-kurallari',
  privacyHref: '/kvkk',
};
const marketKinds: Record<string, string> = {
  'is-makineleri': 'ekipman',
  'cevher-urun': 'cevher',
  'saha-ruhsat': 'saha',
};
const TODAY = '2026-10-16';
const longText = (topic: string) =>
  `${topic} hakkında ayrıntılı açıklama. Görev ve sorumluluklar, çalışma koşulları ve beklentiler burada anlatılır; metin yeterince uzundur.`;

const allConsents = (kind: Parameters<typeof getFormDefinition>[0]) =>
  Object.fromEntries(
    getFormDefinition(kind, registries).consents.map((consent) => [consent.id, true]),
  );

function draftData(kind: Parameters<typeof getFormDefinition>[0], values: FormValues) {
  const definition = getFormDefinition(kind, registries);
  const category = typeof values.category === 'string' ? values.category : '';
  const submission = buildSubmission(definition, values, {
    ref: 'MKT-20261016-AB2C',
    today: TODAY,
    marketKind: marketKinds[category],
  });
  expect(submission.draft).toBeDefined();
  const { data, body } = parseFrontmatter(submission.draft!.content, submission.draft!.path);
  return { submission, data, body };
}

const jobValues: FormValues = {
  title: 'Maden Mühendisi (Açık Ocak Planlama)',
  position: 'maden-muhendisi',
  employmentType: 'tam-zamanli',
  siteType: 'acik-ocak',
  openings: '2',
  employerName: 'Örnek Madencilik A.Ş.',
  employerWebsite: 'https://ornek.example',
  city: 'Eskişehir',
  requirements: '- Planlama yazılımı bilgisi\n- 3 yıl deneyim\n\n',
  certificates: '',
  benefits: 'Servis\nYemek',
  salaryMin: '70.000',
  salaryMax: '90.000',
  description: longText('İş tanımı "tırnaklı" ve: iki noktalı'),
  applyMethod: 'eposta',
  applyValue: 'ik@ornek.example',
  contactName: 'Ayşe Yılmaz',
  contactEmail: 'ayse@ornek.example',
  contactPhone: '0312 123 45 67',
};

describe('form sayıları ve iller', () => {
  it('Türkçe binlik yazımı okur', () => {
    expect(parseFormNumber('45.000')).toBe(45000);
    expect(parseFormNumber('1.250.000')).toBe(1250000);
    expect(parseFormNumber('2.450,50')).toBe(2450.5);
    expect(parseFormNumber('2,5')).toBe(2.5);
    expect(parseFormNumber('12.5')).toBe(12.5);
    expect(parseFormNumber('')).toBeNull();
    expect(parseFormNumber('on bin')).toBe('invalid');
  });

  it('il adlarını düzeltir', () => {
    expect(canonicalProvince('izmir')).toBe('İzmir');
    expect(canonicalProvince('  ISTANBUL ')).toBe('İstanbul');
    expect(canonicalProvince('turkiye geneli')).toBe('Türkiye geneli');
    expect(canonicalProvince('Gotham')).toBeNull();
  });
});

describe('form doğrulama', () => {
  it('eksik zorunlu alanlar ve onaylar hata verir', () => {
    const definition = getFormDefinition('is-ilani', registries);
    const result = validateSubmission(definition, {}, {});
    expect(result.fieldErrors.title).toContain('zorunlu');
    expect(result.fieldErrors.position).toBeDefined();
    expect(result.fieldErrors.contactEmail).toBeDefined();
    expect(Object.keys(result.consentErrors).sort()).toEqual(['kurallar', 'kvkk', 'yetki']);
  });

  it('geçerli iş ilanı başvurusu hatasızdır', () => {
    const result = validateSubmission(
      getFormDefinition('is-ilani', registries),
      jobValues,
      allConsents('is-ilani'),
    );
    expect(result).toEqual({ fieldErrors: {}, consentErrors: {} });
  });

  it('başvuru adresi yönteme uygun olmalı; ücret aralığı tutarlı olmalı', () => {
    const definition = getFormDefinition('is-ilani', registries);
    const values = {
      ...jobValues,
      applyMethod: 'url',
      applyValue: 'ik@ornek.example',
      salaryMin: '90.000',
      salaryMax: '70.000',
    };
    const result = validateSubmission(definition, values, allConsents('is-ilani'));
    expect(result.fieldErrors.applyValue).toContain('https://');
    expect(result.fieldErrors.salaryMax).toBeDefined();
  });

  it('aday metninde iletişim bilgisi kabul edilmez', () => {
    const definition = getFormDefinition('aday-profili', registries);
    const result = validateSubmission(
      definition,
      { headline: 'Operatör, beni 0532 123 45 67 numarasından arayın', about: 'kısa' },
      {},
    );
    expect(result.fieldErrors.headline).toContain('İletişim bilgisi');
    expect(result.fieldErrors.about).toContain('en az 50');
  });

  it('tanınmayan il ve fazla salon seçimi hata verir', () => {
    expect(
      validateSubmission(
        getFormDefinition('aday-profili', registries),
        { preferredCities: 'İzmir\nGotham' },
        {},
      ).fieldErrors.preferredCities,
    ).toContain('Gotham');
    const stand = getFormDefinition('fuar-standi', registries);
    const result = validateSubmission(stand, { halls: ['a', 'b', 'c', 'd'] }, {});
    expect(result.fieldErrors.halls).toBeDefined();
    expect(result.fieldErrors.website).toContain('en az birini');
  });

  it('gizli bölümler (ör. saha bilgileri) yalnızca ilgili kategoride doğrulanır', () => {
    const definition = getFormDefinition('market-ilani', registries);
    const equipment = validateSubmission(definition, { category: 'is-makineleri' }, {});
    expect(equipment.fieldErrors.licenseGroup).toBeUndefined();
    expect(equipment.consentErrors['yetki-saha']).toBeUndefined();
    const site = validateSubmission(definition, { category: 'saha-ruhsat' }, {});
    expect(site.fieldErrors.licenseGroup).toBeDefined();
    expect(site.consentErrors['yetki-saha']).toBeDefined();
  });

  it('iletişim talebinde numara biçimi denetlenir', () => {
    const definition = getFormDefinition('iletisim-talebi', registries);
    expect(
      validateSubmission(definition, { ref: 'ady-20261016-k7qx' }, {}).fieldErrors.ref,
    ).toBeUndefined();
    expect(validateSubmission(definition, { ref: 'ADY-123' }, {}).fieldErrors.ref).toBeDefined();
  });
});

describe('editör için taslak içerik dosyası', () => {
  it('YAML üretici tırnak ve özel karakterleri güvenle yazar', () => {
    const yaml = toYaml({
      title: 'A: "b" #c',
      list: ['x', '%40'],
      nested: { n: 1, empty: '' },
      none: undefined,
    });
    expect(yaml).toBe('title: "A: \\"b\\" #c"\nlist:\n  - "x"\n  - "%40"\nnested:\n  n: 1');
  });

  it('iş ilanı taslağı içerik şemasından geçer; yayımlanmayacak bilgiler taslağa yazılmaz', () => {
    const { submission, data, body } = draftData('is-ilani', jobValues);
    const parsed = jobFrontmatterSchema.parse(data);
    expect(parsed.status).toBe('review');
    expect(parsed.salary).toMatchObject({ min: 70000, max: 90000, currency: 'TRY' });
    expect(parsed.requirements).toEqual(['Planlama yazılımı bilgisi', '3 yıl deneyim']);
    expect(parsed.openings).toBe(2);
    expect(body).toContain('İş tanımı "tırnaklı"');
    expect(submission.draft!.path).toBe(
      'content/is-ilanlari/maden-muhendisi-acik-ocak-planlama.md',
    );
    expect(submission.draft!.content).not.toContain('Ayşe');
    expect(submission.draft!.content).not.toContain('0312 123 45 67');
    // Editöre giden metinde sorumlunun bilgileri vardır
    expect(submission.text).toContain('Ayşe Yılmaz');
    expect(submission.text).toContain('[x] Bilgilerin doğru olduğunu');
    expect(submission.replyTo).toBe('ayse@ornek.example');
  });

  it('aday taslağı şemadan geçer, kişisel bilgi içermez ve dosya adı başvuru numarasıdır', () => {
    const values: FormValues = {
      headline: 'Deneyimli ekskavatör operatörü',
      position: 'is-makinesi-operatoru',
      experienceYears: '8',
      certificates: 'G sınıfı sürücü belgesi',
      preferredCities: 'manisa\nizmir',
      siteTypes: ['acik-ocak'],
      employmentTypes: [],
      availability: 'hemen',
      about:
        'Sekiz yıldır açık ocakta dekapaj ve yükleme işlerinde çalışıyorum; vardiyalı çalışmaya uygunum.',
      contactName: 'Mehmet Demir',
      contactEmail: 'mehmet@ornek.example',
    };
    const definition = getFormDefinition('aday-profili', registries);
    const submission = buildSubmission(definition, values, {
      ref: 'ADY-20261016-K7QX',
      today: TODAY,
    });
    const { data } = parseFrontmatter(submission.draft!.content, 'x.md');
    const parsed = candidateFrontmatterSchema.parse(data);
    expect(parsed.preferredCities).toEqual(['Manisa', 'İzmir']);
    expect(parsed.consentAt).toBe(TODAY);
    expect(submission.draft!.path).toBe('content/is-arayanlar/ady-20261016-k7qx.md');
    expect(submission.draft!.content).not.toMatch(/Mehmet|mehmet@/);
  });

  it('market taslağı kategoriye göre doğru blokları yazar; gizli iletişimde telefon taslağa girmez', () => {
    const base: FormValues = {
      type: 'satilik',
      title: 'Parça krom cevheri',
      description: longText('Krom cevheri'),
      oreMineral: 'Krom cevheri',
      oreGrade: '%38–40 Cr2O3',
      oreAnalysis: 'laboratuvar',
      quantityValue: '5.000',
      quantityUnit: 't',
      priceAmount: '210',
      priceCurrency: 'USD',
      pricePer: 'ton',
      city: 'Elazığ',
      sellerName: 'Örnek Krom',
      sellerKind: 'firma',
      contactMode: 'aracili',
      contactEmail: 'satis@ornek.example',
      contactPhone: '0424 000 00 00',
      condition: 'yeni',
    };
    const ore = marketFrontmatterSchema.parse(
      draftData('market-ilani', { ...base, category: 'cevher-urun' }).data,
    );
    expect(ore.ore).toMatchObject({ mineral: 'Krom cevheri', analysis: 'laboratuvar' });
    expect(ore.quantity).toEqual({ value: 5000, unit: 't' });
    expect(ore.condition).toBeUndefined();
    expect(ore.license).toBeUndefined();
    expect(ore.contact).toEqual({ mode: 'aracili' });

    const direct = marketFrontmatterSchema.parse(
      draftData('market-ilani', {
        ...base,
        category: 'is-makineleri',
        contactMode: 'dogrudan',
        year: '2016',
        hours: '11.800',
      }).data,
    );
    expect(direct.contact).toEqual({
      mode: 'dogrudan',
      phone: '0424 000 00 00',
      email: 'satis@ornek.example',
    });
    expect(direct).toMatchObject({ condition: 'yeni', year: 2016, hours: 11800 });
    expect(direct.ore).toBeUndefined();

    const site = marketFrontmatterSchema.parse(
      draftData('market-ilani', {
        ...base,
        category: 'saha-ruhsat',
        type: 'kiralik',
        licenseGroup: 'IV(c)',
        licenseKind: 'isletme',
        licenseOffer: 'rodovans',
        licenseArea: '96',
        licenseReserve: 'umrek-raporu',
      }).data,
    );
    expect(site.license).toEqual({
      group: 'IV(c)',
      kind: 'isletme',
      offer: 'rodovans',
      areaHectares: 96,
      reserve: 'umrek-raporu',
    });
  });

  it('stand taslağı şemadan geçer; ürün satırları ad ve açıklamaya ayrılır', () => {
    const values: FormValues = {
      name: 'Örnek Sondaj Ltd. Şti.',
      summary: 'Maden arama projeleri için karotlu sondaj ve numune hazırlama hizmetleri.',
      halls: ['sondaj-arama'],
      city: 'Ankara',
      serviceArea: 'Türkiye geneli',
      founded: '2009',
      description: longText('Firma'),
      offerings: 'Karotlu sondaj: HQ ve NQ çaplarında 800 m\nNumune hazırlama',
      website: 'https://ornek-sondaj.example',
      contactName: 'Ali Kaya',
      contactEmail: 'ali@ornek.example',
      companyRecord: 'Vergi no 1234567890',
    };
    const { data, submission } = draftData('fuar-standi', values);
    const parsed = standFrontmatterSchema.parse(data);
    expect(parsed.offerings).toEqual([
      { name: 'Karotlu sondaj', description: 'HQ ve NQ çaplarında 800 m' },
      { name: 'Numune hazırlama' },
    ]);
    expect(parsed.founded).toBe(2009);
    expect(submission.draft!.content).not.toMatch(/Ali Kaya|1234567890/);
  });

  it('iletişim talebinde taslak dosya yoktur', () => {
    const definition = getFormDefinition('iletisim-talebi', registries);
    const submission = buildSubmission(
      definition,
      {
        ref: 'ADY-20261016-K7QX',
        message: 'Merhaba, pozisyonumuz için görüşmek isteriz.',
        contactName: 'X',
        contactEmail: 'x@y.example',
      },
      { ref: 'ILT-20261016-ZZZZ', today: TODAY },
    );
    expect(submission.draft).toBeUndefined();
    expect(submission.subject).toContain('ADY-20261016-K7QX');
  });
});

describe('başvurunun iletilmesi', () => {
  it('mailto bağlantısı sınırı aşarsa kısaltılır ve not eklenir', () => {
    const short = buildMailto('ilan@ornek.example', 'Konu', 'Kısa metin');
    expect(short).toBe(
      `mailto:ilan@ornek.example?subject=Konu&body=${encodeURIComponent('Kısa metin')}`,
    );
    const long = buildMailto('ilan@ornek.example', 'Konu', 'ş'.repeat(5000), 2000);
    expect(long.length).toBeLessThanOrEqual(2000);
    expect(decodeURIComponent(long.split('body=')[1]!)).toContain('Metni kopyala');
  });

  it('form hizmetine FormData ile gönderir ve sonucu yorumlar', async () => {
    const submission = {
      ref: 'IS-20261016-AB2C',
      subject: 'Konu',
      text: 'Metin',
      replyTo: 'a@b.example',
    };
    const fetchOk = vi.fn(
      async () => new Response(JSON.stringify({ success: true }), { status: 200 }),
    );
    expect(
      await postSubmission(
        { email: 'x', endpoint: 'https://form.example/f', accessKey: 'k' },
        submission,
        'is-ilani',
        fetchOk,
      ),
    ).toBe('sent');
    const body = (fetchOk.mock.calls[0] as unknown as [string, RequestInit])[1].body as FormData;
    expect(body.get('access_key')).toBe('k');
    expect(body.get('message')).toBe('Metin');
    expect(body.get('email')).toBe('a@b.example');

    const fetchFail = vi.fn(async () => new Response('{"success":false}', { status: 200 }));
    expect(
      await postSubmission(
        { email: 'x', endpoint: 'https://form.example/f' },
        submission,
        'is-ilani',
        fetchFail,
      ),
    ).toBe('failed');
    const fetchThrow = vi.fn(async () => {
      throw new Error('ağ hatası');
    });
    expect(
      await postSubmission(
        { email: 'x', endpoint: 'https://form.example/f' },
        submission,
        'is-ilani',
        fetchThrow,
      ),
    ).toBe('failed');
    expect(await postSubmission({ email: 'x' }, submission, 'is-ilani', fetchOk)).toBe('failed');
  });
});
