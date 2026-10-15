/**
 * İçerik doğrulama betiği.
 *
 * Kullanım:
 *   npm run content:check              → hatalarda çıkış kodu 1
 *   npm run content:check -- --strict  → uyarılar da hata sayılır
 *   npm run content:check -- --quiet   → yalnızca hatalar listelenir
 *
 * GitHub Actions'ta çalışırken hatalar PR üzerinde dosya bazında açıklama olarak görünür.
 */
import { calculatorSlugs } from '../src/calculators/registry';
import { loadContentStore } from '../src/lib/content/repository';
import { validateStore, type Issue } from '../src/lib/content/validate';
import { todayIso } from '../src/lib/format';

const args = new Set(process.argv.slice(2));
const strict = args.has('--strict');
const quiet = args.has('--quiet');
const inCi = process.env.GITHUB_ACTIONS === 'true';
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;

const color = (code: number) => (text: string) =>
  useColor ? `\u001b[${code}m${text}\u001b[0m` : text;
const red = color(31);
const yellow = color(33);
const green = color(32);
const dim = color(2);
const bold = color(1);

const today = todayIso();
const { store, errors: loadErrors } = loadContentStore();

const issues: Issue[] = [
  ...loadErrors.map((error): Issue => ({
    level: 'error',
    file: error.file,
    message: error.message.replace(`${error.file}: `, ''),
  })),
  ...validateStore(store, { today, calculatorSlugs }),
];

function countByStatus(items: { status: string }[]) {
  const published = items.filter((item) => item.status === 'published').length;
  const review = items.filter((item) => item.status === 'review').length;
  const draft = items.filter((item) => item.status === 'draft').length;
  return `${items.length} (yayımlanmış ${published}, incelemede ${review}, taslak ${draft})`;
}

console.log(bold(`\nİçerik doğrulaması — ${today}`));
console.log(`  Makale       : ${countByStatus(store.articles)}`);
console.log(`  Sözlük terimi: ${countByStatus(store.terms)}`);
console.log(`  Hesaplayıcı  : ${countByStatus(store.calculators)}`);
console.log(`  Sayfa        : ${store.pages.length}`);
console.log(
  dim(
    `  Kaynak ${store.sources.length} · Kişi ${store.people.length} · Konu ${store.categories.length} · Etiket ${store.tags.length}`,
  ),
);

function printGroup(level: Issue['level'], list: Issue[]) {
  if (list.length === 0) return;
  const title =
    level === 'error'
      ? red(bold(`\nHATALAR (${list.length})`))
      : yellow(bold(`\nUYARILAR (${list.length})`));
  console.log(title);
  const byFile = new Map<string, Issue[]>();
  for (const issue of list) byFile.set(issue.file, [...(byFile.get(issue.file) ?? []), issue]);
  for (const [file, fileIssues] of byFile) {
    console.log(`  ${bold(file)}`);
    for (const issue of fileIssues) {
      const icon = level === 'error' ? red('✖') : yellow('▲');
      console.log(`    ${icon} ${issue.message.split('\n').join('\n      ')}`);
      if (inCi) {
        const kind = level === 'error' ? 'error' : 'warning';
        console.log(`::${kind} file=${file}::${issue.message.replace(/\n/g, ' ')}`);
      }
    }
  }
}

const errors = issues.filter((issue) => issue.level === 'error');
const warnings = issues.filter((issue) => issue.level === 'warning');

printGroup('error', errors);
if (!quiet) printGroup('warning', warnings);

const failed = errors.length > 0 || (strict && warnings.length > 0);
console.log(
  failed
    ? red(
        bold(
          `\n✖ ${errors.length} hata${strict && warnings.length ? `, ${warnings.length} uyarı (--strict)` : ''}. Düzeltmeden yayımlamayın.\n`,
        ),
      )
    : green(bold(`\n✔ Hata yok${warnings.length ? ` (${warnings.length} uyarı)` : ''}.\n`)),
);
process.exit(failed ? 1 : 0);
