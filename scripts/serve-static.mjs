/**
 * Derlenmiş statik siteyi (out/) yerelde sunar. Ek bağımlılık gerektirmez.
 *
 * Kullanım:  npm run build  →  npm start   (varsayılan: http://localhost:3000)
 * Port değiştirmek için (PowerShell):  $env:PORT=4000; npm start
 *
 * Temiz URL'ler (/market/x → out/market/x.html) ve 404 sayfası, Cloudflare Pages
 * gibi statik barındırma hizmetlerindeki davranışla aynı şekilde çözülür.
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';

const root = resolve(process.cwd(), 'out');
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';

if (!existsSync(root)) {
  console.error('out/ klasörü bulunamadı. Önce "npm run build" çalıştırın.');
  process.exit(1);
}

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

function resolveFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, '');
  const base = join(root, clean);
  if (!base.startsWith(root + sep) && base !== root) return null;
  const candidates = [base, `${base}.html`, join(base, 'index.html')];
  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let file = null;
  try {
    file = resolveFile(url.pathname);
  } catch {
    file = null;
  }
  const status = file ? 200 : 404;
  file ??= join(root, '404.html');
  const headers = {
    'Content-Type': types[extname(file)] ?? 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };
  if (url.pathname.startsWith('/_next/static/'))
    headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  res.writeHead(status, headers);
  createReadStream(file).pipe(res);
  if (process.env.LOG_REQUESTS) console.log(status, url.pathname);
});

server.listen(port, host, () => {
  console.log(`Statik site yayında: http://localhost:${port}  (klasör: out/)`);
});
