/**
 * Derleme sonrası site denetimi (kalite kapısı).
 *
 * Kullanım:  npm run build  →  npm run site:check
 *
 * Her HTML sayfasında şunları denetler:
 *   - <title>, meta description ve kanonik URL var mı, kanonik URL doğru mu?
 *   - Tek bir <h1> var mı, <html lang="tr"> doğru mu?
 *   - Site içi bağlantılar ve sayfa içi #çapa bağlantıları çalışıyor mu?
 *   - Görsellerde alt metni var mı?
 *   - JSON-LD blokları geçerli JSON mu?
 *   - Site haritasındaki tüm adresler mevcut mu?
 * Yinelenen başlık ve açıklamalar uyarı olarak raporlanır.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { parse } from 'parse5';

const root = join(process.cwd(), 'out');
if (!existsSync(root)) {
  console.error('out/ klasörü bulunamadı. Önce "npm run build" çalıştırın.');
  process.exit(1);
}

const siteUrl = (process.env.SITE_URL?.trim() || 'https://maden360.example').replace(/\/+$/, '');
const errors = [];
const warnings = [];
const placeholders = [];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const allFiles = walk(root);
const htmlFiles = allFiles.filter(
  (file) => file.endsWith('.html') && !file.includes(`${sep}_next${sep}`),
);

/** out/ içindeki dosyadan sayfa yolunu çıkarır: out/market/x.html → /market/x */
function pagePath(file) {
  const rel = relative(root, file).split(sep).join('/');
  if (rel === 'index.html') return '/';
  return `/${rel.replace(/(\/index)?\.html$/, '')}`;
}

function resolvePath(pathname) {
  const clean = decodeURIComponent(pathname).replace(/\/+$/, '') || '/';
  if (clean === '/') return join(root, 'index.html');
  const base = join(root, clean);
  for (const candidate of [base, `${base}.html`, join(base, 'index.html')]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

function* nodes(node) {
  yield node;
  for (const child of node.childNodes ?? []) yield* nodes(child);
  if (node.content) yield* nodes(node.content);
}

const attr = (node, name) => node.attrs?.find((a) => a.name === name)?.value;
const textOf = (node) =>
  [...nodes(node)]
    .filter((n) => n.nodeName === '#text')
    .map((n) => n.value)
    .join('')
    .trim();

const isPlaceholderPath = (path) =>
  path !== '/_not-found' && (path.split('/').pop() ?? '').startsWith('_');

const pages = new Map();
for (const file of htmlFiles) {
  const document = parse(readFileSync(file, 'utf8'));
  const all = [...nodes(document)];
  const ids = new Set(all.map((n) => attr(n, 'id')).filter(Boolean));
  pages.set(pagePath(file), { file, document, all, ids });
}

const titles = new Map();
const descriptions = new Map();

for (const [path, page] of pages) {
  const where = relative(process.cwd(), page.file).split(sep).join('/');
  const { all } = page;
  // Yayımlanmış içerik olmayan bölümlerin yer tutucu 404 sayfaları (bkz. src/lib/static-params.ts)
  if (isPlaceholderPath(path)) {
    placeholders.push(path);
    continue;
  }
  const isErrorPage =
    path === '/404' || path === '/_not-found' || all.some((n) => attr(n, 'data-not-found'));

  const html = all.find((n) => n.nodeName === 'html');
  if (attr(html, 'lang') !== 'tr') errors.push(`${where}: <html lang="tr"> eksik veya hatalı.`);

  const title = all.find((n) => n.nodeName === 'title');
  const titleText = title ? textOf(title) : '';
  if (!titleText) errors.push(`${where}: <title> eksik.`);
  else if (!isErrorPage) titles.set(titleText, [...(titles.get(titleText) ?? []), path]);

  const description = all.find((n) => n.nodeName === 'meta' && attr(n, 'name') === 'description');
  const descriptionText = description ? (attr(description, 'content') ?? '') : '';
  if (!descriptionText) errors.push(`${where}: meta description eksik.`);
  else if (!isErrorPage)
    descriptions.set(descriptionText, [...(descriptions.get(descriptionText) ?? []), path]);

  if (!isErrorPage) {
    const canonical = all.find((n) => n.nodeName === 'link' && attr(n, 'rel') === 'canonical');
    const href = canonical ? attr(canonical, 'href') : undefined;
    const expected = path === '/' ? siteUrl : `${siteUrl}${path}`;
    if (!href) errors.push(`${where}: kanonik URL (<link rel="canonical">) eksik.`);
    else if (href !== expected && href !== `${expected}/`) {
      errors.push(`${where}: kanonik URL hatalı: ${href} (beklenen ${expected}).`);
    }
  }

  const h1Count = all.filter((n) => n.nodeName === 'h1').length;
  if (h1Count !== 1) errors.push(`${where}: ${h1Count} adet <h1> var (tam olarak 1 olmalı).`);

  for (const image of all.filter((n) => n.nodeName === 'img')) {
    if (attr(image, 'alt') === undefined)
      errors.push(`${where}: alt metni olmayan görsel (${attr(image, 'src')}).`);
  }

  for (const script of all.filter(
    (n) => n.nodeName === 'script' && attr(n, 'type') === 'application/ld+json',
  )) {
    try {
      JSON.parse(textOf(script));
    } catch {
      errors.push(`${where}: geçersiz JSON-LD bloğu.`);
    }
  }

  for (const anchor of all.filter((n) => n.nodeName === 'a' && attr(n, 'href'))) {
    const href = attr(anchor, 'href');
    if (/^(https?:|mailto:|tel:|data:)/.test(href)) continue;
    const [pathPart, hash] = href.split('#');
    const targetPath = pathPart ? pathPart.split('?')[0] : '';
    if (!targetPath) {
      if (hash && !page.ids.has(decodeURIComponent(hash)))
        errors.push(`${where}: sayfa içi çapa bulunamadı: #${hash}`);
      continue;
    }
    if (!targetPath.startsWith('/')) continue;
    const resolved = resolvePath(targetPath);
    if (!resolved) {
      errors.push(`${where}: kırık bağlantı: ${href}`);
      continue;
    }
    if (isPlaceholderPath(targetPath.replace(/\/+$/, ''))) {
      errors.push(`${where}: yer tutucu sayfaya bağlantı verilmiş: ${href}`);
      continue;
    }
    if (hash && resolved.endsWith('.html')) {
      const target = pages.get(pagePath(resolved));
      if (target && !target.ids.has(decodeURIComponent(hash)))
        errors.push(`${where}: hedef sayfada çapa yok: ${href}`);
    }
  }
}

for (const [text, paths] of titles) {
  if (paths.length > 1) warnings.push(`Yinelenen başlık "${text}": ${paths.join(', ')}`);
}
for (const [text, paths] of descriptions) {
  if (paths.length > 1)
    warnings.push(`Yinelenen açıklama: ${paths.join(', ')} → "${text.slice(0, 60)}…"`);
}

const sitemapFile = join(root, 'sitemap.xml');
let sitemapCount = 0;
if (!existsSync(sitemapFile)) {
  errors.push('out/sitemap.xml bulunamadı.');
} else {
  const urls = [...readFileSync(sitemapFile, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (m) => m[1],
  );
  sitemapCount = urls.length;
  for (const url of urls) {
    if (!url.startsWith(siteUrl)) {
      errors.push(`sitemap.xml: ${url} beklenen alan adıyla (${siteUrl}) başlamıyor.`);
      continue;
    }
    const path = url.slice(siteUrl.length) || '/';
    if (!resolvePath(path)) errors.push(`sitemap.xml: sayfası olmayan adres: ${url}`);
  }
}
if (!existsSync(join(root, 'robots.txt'))) errors.push('out/robots.txt bulunamadı.');
if (!existsSync(join(root, '404.html'))) errors.push('out/404.html bulunamadı.');
if (!existsSync(join(root, 'arama-dizini.json')))
  errors.push('out/arama-dizini.json (arama dizini) bulunamadı.');

console.log(
  `\nSite denetimi — ${pages.size} HTML sayfası, site haritasında ${sitemapCount} adres (SITE_URL=${siteUrl})`,
);
if (placeholders.length) {
  console.log(
    `\nBilgi: yayımlanmış içerik olmayan bölümler için ${placeholders.length} yer tutucu 404 sayfası üretildi (${placeholders.join(', ')}).`,
  );
}
if (warnings.length) {
  console.log(`\nUYARILAR (${warnings.length})`);
  for (const warning of warnings) console.log(`  ▲ ${warning}`);
}
if (errors.length) {
  console.log(`\nHATALAR (${errors.length})`);
  for (const error of errors) console.log(`  ✖ ${error}`);
  console.log(`\n✖ ${errors.length} hata bulundu.\n`);
  process.exit(1);
}
console.log('\n✔ Kırık bağlantı yok; her sayfada başlık, açıklama, kanonik URL ve tek <h1> var.\n');
