import { describe, expect, it } from 'vitest';
import { containsContactInfo, findContactInfo, isPhoneNumber, telHref } from './contact';
import { addDays, daysLeft, isExpired, todayInTurkey } from './dates';
import { createRef, formatMoney, formatPrice, formatSalary, initials } from './format';
import { REF_PATTERN } from './options';

describe('ilan tarihleri', () => {
  it('Türkiye saatine göre günü hesaplar (UTC gece yarısından önce/sonra)', () => {
    // 15 Ekim 21:30 UTC = 16 Ekim 00:30 Türkiye saati
    expect(todayInTurkey(new Date('2026-10-15T21:30:00Z'))).toBe('2026-10-16');
    expect(todayInTurkey(new Date('2026-10-15T20:59:00Z'))).toBe('2026-10-15');
  });

  it('bitiş günü dahil geçerlidir', () => {
    expect(isExpired('2026-10-16', '2026-10-16')).toBe(false);
    expect(isExpired('2026-10-15', '2026-10-16')).toBe(true);
    expect(isExpired(undefined, '2026-10-16')).toBe(false);
  });

  it('kalan günü ve gün eklemeyi hesaplar', () => {
    expect(daysLeft('2026-10-20', '2026-10-16')).toBe(4);
    expect(daysLeft('2026-10-15', '2026-10-16')).toBe(-1);
    expect(addDays('2026-10-16', 60)).toBe('2026-12-15');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });
});

describe('iletişim bilgisi denetimi', () => {
  it.each([
    'Beni 0532 123 45 67 numarasından arayın',
    'Tel: +90 (532) 123-4567',
    '(0312) 555 55 55',
    '05321234567',
    'e-posta: ahmet.yilmaz@ornek.com.tr',
    'Profilim: https://www.linkedin.com/in/ornek',
    'www.ornek.com.tr adresinden',
  ])('bulur: %s', (text) => {
    expect(containsContactInfo(text)).toBe(true);
  });

  it.each([
    '2014 model, 12.500 saat çalışmış',
    'Fiyat: 1.250.000 TL + KDV',
    '8 yıl deneyim, 30–50 ton sınıfı ekskavatör',
    'IV(c) Grubu, 96 hektar, %38–40 Cr₂O₃',
    'HQ ve NQ çaplarında 800 metreye kadar',
  ])('yanlış alarm vermez: %s', (text) => {
    expect(findContactInfo(text)).toEqual([]);
  });

  it('telefon biçimini doğrular ve tel: bağlantısı üretir', () => {
    expect(isPhoneNumber('0312 123 45 67')).toBe(true);
    expect(isPhoneNumber('+90 532 123 45 67')).toBe(true);
    expect(isPhoneNumber('12345')).toBe(false);
    expect(isPhoneNumber('0312-ABC')).toBe(false);
    expect(telHref('0532 123 45 67')).toBe('tel:+905321234567');
    expect(telHref('+49 30 1234567')).toBe('tel:+49301234567');
  });
});

describe('biçimlendirme', () => {
  it('fiyatı Türkçe biçimde gösterir', () => {
    expect(formatMoney(4750000, 'TRY')).toBe('4.750.000 TL');
    expect(formatMoney(2450.5, 'EUR')).toBe('2.450,50 EUR');
    expect(formatPrice({ amount: 38000, currency: 'TRY', per: 'gün', vat: 'haric' })).toBe(
      '38.000 TL/gün + KDV',
    );
    expect(formatPrice({ amount: 210, currency: 'USD', per: 'ton' })).toBe('210 USD/ton');
    expect(formatPrice(undefined)).toBe('Fiyat sorunuz');
  });

  it('ücret aralığını gösterir', () => {
    expect(
      formatSalary({ min: 70000, max: 90000, currency: 'TRY', period: 'aylik', basis: 'net' }),
    ).toBe('70.000–90.000 TL net, aylık');
    expect(formatSalary({ min: 50000, currency: 'TRY', period: 'aylik', basis: 'brut' })).toBe(
      'En az 50.000 TL brüt, aylık',
    );
  });

  it('firma adından baş harf üretir', () => {
    expect(initials('Örnek Karot Sondaj')).toBe('ÖK');
    expect(initials('İzmir Kırma Ltd. Şti.')).toBe('İK');
    expect(initials('Anadolu A.Ş.')).toBe('A');
  });

  it('başvuru numarası biçimi', () => {
    let i = 0;
    const sequence = [0, 0.5, 0.25, 0.99];
    const ref = createRef('MKT', '2026-10-16', () => sequence[i++ % sequence.length]!);
    expect(ref).toMatch(/^MKT-20261016-[A-Z2-9]{4}$/);
    expect(REF_PATTERN.test(ref)).toBe(true);
    for (let n = 0; n < 50; n += 1)
      expect(REF_PATTERN.test(createRef('ADY', '2026-01-01'))).toBe(true);
  });
});
