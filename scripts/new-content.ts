/**
 * Şablondan yeni içerik dosyası oluşturur.
 *
 * Kullanım (PowerShell, macOS ve Linux'ta aynı):
 *   npm run new -- makale "Dekapaj planlamasında sık yapılan hatalar"
 *   npm run new -- terim "Sınır tenör"
 *
 * Dosya "draft" durumunda oluşturulur; slug başlıktan otomatik üretilir.
 */
import fs from 'node:fs';
import path from 'node:path';
import { todayIso } from '../src/lib/format';
import { slugify } from '../src/lib/text';

const TYPES = {
  makale: { template: 'makale.md', dir: 'makaleler' },
  terim: { template: 'terim.md', dir: 'sozluk' },
} as const;

type ContentType = keyof typeof TYPES;

const [type, ...titleParts] = process.argv.slice(2);
const title = titleParts.join(' ').trim();

if (!type || !(type in TYPES) || !title) {
  console.error('Kullanım: npm run new -- <makale|terim> "Başlık"');
  console.error('Örnek  : npm run new -- makale "Bant konveyör bakımında temel kontroller"');
  process.exit(1);
}

const config = TYPES[type as ContentType];
const slug = slugify(title);
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
  .replaceAll('{{date}}', todayIso());

fs.writeFileSync(target, content, 'utf8');
console.log(`Oluşturuldu: ${path.relative(process.cwd(), target)}`);
console.log(
  'Sonraki adımlar: içeriği yazın → kaynakları ekleyin → npm run content:check → durum: review',
);
