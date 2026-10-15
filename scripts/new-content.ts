/**
 * Şablondan yeni içerik dosyası oluşturur.
 *
 * Kullanım (PowerShell, macOS ve Linux'ta aynı):
 *   npm run new -- makale "Dekapaj planlamasında sık yapılan hatalar"
 *   npm run new -- terim "Sınır tenör"
 *   npm run new -- firma "Örnek Sondaj Ltd. Şti."          → content/fuar/
 *   npm run new -- is-ilani "Maden Mühendisi (Planlama)"   → content/is-ilanlari/
 *   npm run new -- aday "Deneyimli ekskavatör operatörü"   → content/is-arayanlar/
 *   npm run new -- market "Satılık mobil kırıcı"           → content/market/
 *
 * Makale ve terim "draft", ilanlar "review" (editör onayı bekliyor) durumunda
 * oluşturulur. Slug başlıktan üretilir; aday profillerinde dosya adı başvuru
 * numarasıdır (kişisel bilgi URL'ye girmesin).
 */
import fs from 'node:fs';
import path from 'node:path';
import { addDays, todayInTurkey } from '../src/lib/listings/dates';
import { createRef } from '../src/lib/listings/format';
import { LISTING_MAX_DAYS, REF_PREFIXES } from '../src/lib/listings/options';
import { slugify } from '../src/lib/text';

interface TypeConfig {
  template: string;
  dir: string;
  ref?: (typeof REF_PREFIXES)[keyof typeof REF_PREFIXES];
  days?: number;
  /** Dosya adı başlık yerine başvuru numarasından üretilir */
  slugFromRef?: boolean;
}

const TYPES: Record<string, TypeConfig> = {
  makale: { template: 'makale.md', dir: 'makaleler' },
  terim: { template: 'terim.md', dir: 'sozluk' },
  firma: {
    template: 'fuar-standi.md',
    dir: 'fuar',
    ref: REF_PREFIXES.stand,
    days: LISTING_MAX_DAYS.stand,
  },
  'is-ilani': {
    template: 'is-ilani.md',
    dir: 'is-ilanlari',
    ref: REF_PREFIXES.job,
    days: LISTING_MAX_DAYS.job,
  },
  aday: {
    template: 'aday-profili.md',
    dir: 'is-arayanlar',
    ref: REF_PREFIXES.candidate,
    days: LISTING_MAX_DAYS.candidate,
    slugFromRef: true,
  },
  market: {
    template: 'market-ilani.md',
    dir: 'market',
    ref: REF_PREFIXES.market,
    days: LISTING_MAX_DAYS.market,
  },
};

const [type, ...titleParts] = process.argv.slice(2);
const title = titleParts.join(' ').trim();
const config = type ? TYPES[type] : undefined;

if (!config || !title) {
  console.error(`Kullanım: npm run new -- <${Object.keys(TYPES).join('|')}> "Başlık"`);
  console.error('Örnek  : npm run new -- market "Satılık 30 ton paletli ekskavatör"');
  process.exit(1);
}

const today = todayInTurkey();
const ref = config.ref ? createRef(config.ref, today) : '';
const slug = config.slugFromRef
  ? ref.toLowerCase()
  : slugify(title).slice(0, 70).replace(/-+$/, '');
if (!slug) {
  console.error('Başlıktan geçerli bir dosya adı üretilemedi.');
  process.exit(1);
}

const root = path.join(process.cwd(), 'content');
const target = path.join(root, config.dir, `${slug}.md`);
if (fs.existsSync(target)) {
  console.error(`Bu adla bir dosya zaten var: ${path.relative(process.cwd(), target)}`);
  process.exit(1);
}

const template = fs.readFileSync(path.join(root, '_sablonlar', config.template), 'utf8');
const content = template
  .replace(/^# ŞABLON.*\n/m, '')
  .replaceAll('{{title}}', title.replace(/"/g, '\\"'))
  .replaceAll('{{date}}', today)
  .replaceAll('{{ref}}', ref)
  .replaceAll('{{expires}}', config.days ? addDays(today, config.days) : today);

fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, content, 'utf8');
console.log(`Oluşturuldu: ${path.relative(process.cwd(), target)}`);
console.log(
  config.ref
    ? `Başvuru numarası: ${ref}. Sonraki adımlar: bilgileri başvurudan doldurun → npm run content:check → onaylayınca status: published, moderatedBy, moderatedAt`
    : 'Sonraki adımlar: içeriği yazın → kaynakları ekleyin → npm run content:check → durum: review',
);
