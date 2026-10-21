import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { isInternalHref } from '@/lib/href';
import { cardBase, cardFrame, listPanel, listRow, panel, stretchedLink } from './card';
import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
  BUTTON_WIDTHS,
  buttonClasses,
  chipClasses,
  cx,
  FIELD_SIZES,
  iconButtonClasses,
  inputClasses,
  photoFillClasses,
  photoScrimClasses,
  textLinkClasses,
} from './styles';

/** "ui-hover:[--a:b]" → { variant: "ui-hover", utility: "[--a:b]" } (köşeli parantez içindeki ':' sayılmaz) */
function splitClass(cls: string): { variant: string; utility: string } {
  let depth = 0;
  let last = -1;
  for (let i = 0; i < cls.length; i += 1) {
    const ch = cls[i];
    if (ch === '[') depth += 1;
    else if (ch === ']') depth -= 1;
    else if (ch === ':' && depth === 0) last = i;
  }
  return last === -1
    ? { variant: '', utility: cls }
    : { variant: cls.slice(0, last), utility: cls.slice(last + 1) };
}

/** Aynı CSS özelliğini ayarlayan sınıfları aynı aileye koyar. */
const FAMILIES: [RegExp, string][] = [
  [/^text-(xs|sm|base|lg|\d?xl|\[[\d.]+(rem|px|em)\])$/, 'font-size'],
  [/^text-(left|center|right|justify|start|end)$/, 'text-align'],
  [/^text-/, 'color'],
  [/^bg-(linear|radial|conic)(-|$)/, 'background-image'],
  [/^bg-/, 'background-color'],
  [/^from-\d+%$/, 'gradient-from-position'],
  [/^via-\d+%$/, 'gradient-via-position'],
  [/^to-\d+%$/, 'gradient-to-position'],
  [/^from-/, 'gradient-from'],
  [/^via-/, 'gradient-via'],
  [/^to-/, 'gradient-to'],
  [/^z-/, 'z-index'],
  [/^border(-\d+)?$/, 'border-width'],
  [/^border-/, 'border-color'],
  [/^rounded/, 'border-radius'],
  [/^shadow/, 'box-shadow'],
  [/^min-h-/, 'min-height'],
  [/^h-/, 'height'],
  [/^w-/, 'width'],
  [/^size-/, 'size'],
  [/^p-/, 'padding'],
  [/^px-/, 'padding-x'],
  [/^py-/, 'padding-y'],
  [/^pl-/, 'padding-left'],
  [/^pr-/, 'padding-right'],
  [/^gap-/, 'gap'],
  [/^font-(thin|light|normal|medium|semibold|bold|extrabold|black)$/, 'font-weight'],
  [/^leading-/, 'line-height'],
  [/^(inline-flex|flex|block|inline-block|grid|inline-grid|hidden|inline)$/, 'display'],
  [/^(relative|absolute|fixed|sticky|static)$/, 'position'],
  [/^transition/, 'transition-property'],
  [/^duration-/, 'transition-duration'],
  [/^opacity-/, 'opacity'],
  [/^cursor-/, 'cursor'],
  [/^ring(-\d+)?$/, 'ring-width'],
  [/^ring-inset$/, 'ring-inset'],
  [/^ring-/, 'ring-color'],
  [/^inset-ring(-\d+)?$/, 'inset-ring-width'],
  [/^inset-ring-/, 'inset-ring-color'],
  [/^outline-offset-/, 'outline-offset'],
  [/^outline(-\d+)?$/, 'outline-width'],
  [/^outline-/, 'outline-color'],
  [/^translate-y-/, 'translate-y'],
  [/^items-/, 'align-items'],
  [/^justify-/, 'justify-content'],
  [/^appearance-/, 'appearance'],
  [/^(underline|no-underline|line-through)$/, 'text-decoration-line'],
  [/^(top|bottom|left|right)-/, 'inset-side'],
];

function familyOf(utility: string): string {
  const bare = utility.replace(/^-/, '');
  const property = /^\[(-{0,2}[\w-]+):/.exec(bare)?.[1];
  if (property) return property;
  for (const [pattern, family] of FAMILIES) if (pattern.test(bare)) return family;
  return bare;
}

/** Aynı durumda (varyant) aynı özelliği iki kez ayarlayan sınıflar */
function conflicts(classes: string): string[] {
  const groups = new Map<string, string[]>();
  for (const cls of classes.split(/\s+/).filter(Boolean)) {
    const { variant, utility } = splitClass(cls);
    const familyName = familyOf(utility);
    // inset-side ailesinde top/bottom/left/right ayrı özelliklerdir
    const property =
      familyName === 'inset-side' ? utility.replace(/^-/, '').split('-')[0] : familyName;
    const key = `${variant}|${property}`;
    groups.set(key, [...(groups.get(key) ?? []), cls]);
  }
  return [...groups.values()].filter((group) => group.length > 1).map((group) => group.join(' + '));
}

const tokens = (classes: string) => classes.split(/\s+/).filter(Boolean);

describe('cx', () => {
  it('boş ve yanlış değerleri atlar', () => {
    expect(cx('a', false, null, undefined, '', 'b')).toBe('a b');
  });
});

describe('isInternalHref', () => {
  it('site içi adresleri ayırt eder', () => {
    expect(isInternalHref('/fuar')).toBe(true);
    expect(isInternalHref('/ara?q=kırıcı')).toBe(true);
    expect(isInternalHref('//kotu.example')).toBe(false);
    expect(isInternalHref('https://example.com')).toBe(false);
    expect(isInternalHref('mailto:ilan@maden360.example')).toBe(false);
    expect(isInternalHref('tel:+903120000000')).toBe(false);
    expect(isInternalHref('#basvuru')).toBe(false);
  });
});

describe('çakışma denetleyicisi', () => {
  it('aynı özelliği iki kez ayarlayan sınıfları yakalar', () => {
    expect(conflicts('p-0 p-5')).toHaveLength(1);
    expect(conflicts('min-h-10 min-h-11')).toHaveLength(1);
    expect(conflicts('text-sm text-base')).toHaveLength(1);
    expect(conflicts('bg-white bg-stone-50')).toHaveLength(1);
    expect(conflicts('[--btn-edge:red] [--btn-edge:blue]')).toHaveLength(1);
    expect(conflicts('bg-linear-to-r bg-linear-to-b')).toHaveLength(1);
    expect(conflicts('via-copper-500 via-copper-600')).toHaveLength(1);
  });

  it('farklı özellikleri ve farklı durumları çakışma saymaz', () => {
    expect(conflicts('text-sm text-white text-center')).toEqual([]);
    expect(conflicts('border border-transparent')).toEqual([]);
    expect(conflicts('min-h-10 pointer-coarse:min-h-11 sm:w-auto w-full')).toEqual([]);
    expect(
      conflicts('ring-3 ring-copper-500/25 outline-2 outline-transparent outline-offset-0'),
    ).toEqual([]);
    expect(conflicts('before:-top-px before:-bottom-[3px]')).toEqual([]);
    // Zemin rengi ile renk geçişi ayrı özelliklerdir; geçişin rengi ile konumu da öyle
    expect(conflicts('bg-graphite-950/75 bg-linear-to-r via-graphite-950/75 via-60%')).toEqual([]);
  });
});

describe('düğme sınıfları', () => {
  const combos = BUTTON_VARIANTS.flatMap((variant) =>
    BUTTON_SIZES.flatMap((size) => BUTTON_WIDTHS.map((width) => ({ variant, size, width }))),
  );

  it.each(combos)('$variant / $size / $width: çakışan sınıf yok', (options) => {
    expect(conflicts(buttonClasses(options))).toEqual([]);
  });

  it.each(combos)('$variant / $size / $width: aynı sınıf iki kez yazılmaz', (options) => {
    const list = tokens(buttonClasses(options));
    expect(new Set(list).size).toBe(list.length);
  });

  it.each(BUTTON_SIZES)('%s: dokunmatik ekranda en az 44 px yükseklik', (size) => {
    const list = tokens(buttonClasses({ size }));
    expect(
      list.some((cls) => ['min-h-11', 'min-h-12', 'pointer-coarse:min-h-11'].includes(cls)),
    ).toBe(true);
  });

  it.each(BUTTON_VARIANTS)('%s: yüksek kontrast modu için kenarlık var', (variant) => {
    const list = tokens(buttonClasses({ variant }));
    expect(list).toContain('border');
    expect(list.some((cls) => /^border-(transparent|graphite-\d+|white\/\d+)$/.test(cls))).toBe(
      true,
    );
  });

  it('devre dışı ve yükleniyor durumları görsel olarak ayrışır', () => {
    const list = tokens(buttonClasses());
    expect(list).toContain('disabled:cursor-not-allowed');
    expect(list).toContain('data-loading:cursor-progress');
    // üzerine gelme ve basılı durum yalnızca etkin düğmelerde (ui-hover / ui-active)
    expect(list.some((cls) => cls.startsWith('hover:'))).toBe(false);
    expect(list.some((cls) => cls.startsWith('active:'))).toBe(false);
  });

  it('genişlik seçenekleri', () => {
    expect(tokens(buttonClasses({ width: 'full' }))).toContain('w-full');
    expect(tokens(buttonClasses({ width: 'full-mobile' }))).toEqual(
      expect.arrayContaining(['w-full', 'sm:w-auto']),
    );
    expect(tokens(buttonClasses()).some((cls) => cls.startsWith('w-'))).toBe(false);
  });

  it('ek sınıflar sona eklenir', () => {
    expect(buttonClasses({ className: 'mt-4' }).endsWith(' mt-4')).toBe(true);
  });
});

describe('simge düğmeleri', () => {
  const combos = BUTTON_VARIANTS.flatMap((variant) =>
    BUTTON_SIZES.map((size) => ({ variant, size })),
  );

  it.each(combos)('$variant / $size: çakışan sınıf yok, kare ve dokunmaya uygun', (options) => {
    const classes = iconButtonClasses(options);
    expect(conflicts(classes)).toEqual([]);
    const list = tokens(classes);
    expect(list.some((cls) => /^px-|^min-h-/.test(cls))).toBe(false);
    expect(list.some((cls) => ['size-11', 'size-12', 'pointer-coarse:size-11'].includes(cls))).toBe(
      true,
    );
  });
});

describe('çipler', () => {
  it.each([
    { selected: false, tone: 'light' as const },
    { selected: true, tone: 'light' as const },
    { selected: false, tone: 'inverse' as const },
  ])('seçili=$selected / $tone: çakışan sınıf yok, dokunmatikte 44 px', (options) => {
    const classes = chipClasses(options);
    expect(conflicts(classes)).toEqual([]);
    expect(tokens(classes)).toContain('pointer-coarse:min-h-11');
  });

  it('seçili çip renkle birlikte arka planla da ayrışır', () => {
    expect(tokens(chipClasses({ selected: true }))).toContain('bg-graphite-900');
    expect(tokens(chipClasses())).toContain('bg-white');
  });
});

describe('form alanları', () => {
  const combos = FIELD_SIZES.flatMap((size) =>
    (['light', 'dark'] as const).flatMap((tone) =>
      [false, true].map((invalid) => ({ size, tone, invalid })),
    ),
  );

  it.each(combos)('$size / $tone / hatalı=$invalid: çakışan sınıf yok', (options) => {
    expect(conflicts(inputClasses(options))).toEqual([]);
  });

  it('açılır liste ve arama kutusu ekleri temel sınıflarla çakışmaz', () => {
    const select =
      'cursor-pointer appearance-none py-2 pl-3 pr-10 forced-colors:appearance-auto forced-colors:pr-3';
    expect(conflicts(inputClasses({ className: select }))).toEqual([]);
    expect(conflicts(inputClasses({ size: 'xl', className: 'pl-11 pr-28 sm:text-lg' }))).toEqual(
      [],
    );
  });

  it('odak her zaman görünür: kenarlık, hale ve yüksek kontrast için saydam dış çizgi', () => {
    const list = tokens(inputClasses());
    expect(list).toEqual(
      expect.arrayContaining([
        'focus:border-copper-700',
        'focus:ring-3',
        'focus:outline-transparent',
      ]),
    );
    expect(tokens(inputClasses({ invalid: true }))).toContain('border-red-700');
  });

  it('alan kenarlığı beyaz zeminde ayırt edilir (WCAG 1.4.11: graphite-500 ≈ 5,2:1)', () => {
    expect(tokens(inputClasses())).toContain('border-graphite-500');
    expect(tokens(inputClasses())).not.toContain('border-graphite-300');
  });
});

describe('metin bağlantıları ve kartlar', () => {
  it.each([
    { tone: 'light' as const, size: 'sm' as const },
    { tone: 'inverse' as const, size: 'md' as const },
  ])('$tone / $size: çakışan sınıf yok, 44 px dokunma alanı', (options) => {
    const classes = textLinkClasses(options);
    expect(conflicts(classes)).toEqual([]);
    expect(tokens(classes)).toContain('min-h-11');
  });

  it.each([
    ['cardFrame', cardFrame],
    ['cardBase', cardBase],
    ['panel', panel],
    ['listPanel', listPanel],
    ['listRow', listRow],
    ['stretchedLink', stretchedLink],
    ['fotoğraf katmanı', photoScrimClasses],
    ['fotoğraf', photoFillClasses],
  ])('%s: çakışan sınıf yok', (_name, classes) => {
    expect(conflicts(classes)).toEqual([]);
  });
});

describe('bileşenlerde elle yazılmış düğme stili yok', () => {
  const root = join(process.cwd(), 'src');
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (path.endsWith('.tsx')) files.push(path);
    }
  };
  walk(root);
  const outsideUi = files.filter(
    (path) => !relative(root, path).startsWith(join('components', 'ui')),
  );

  it('dosyalar bulundu', () => {
    expect(outsideUi.length).toBeGreaterThan(20);
  });

  it('birincil düğme renkleri yalnızca styles.ts içinde tanımlanır', () => {
    const offenders = outsideUi.filter((path) =>
      /ui-hover:bg-copper-800|bg-copper-700 text-white/.test(readFileSync(path, 'utf8')),
    );
    expect(offenders.map((path) => relative(root, path))).toEqual([]);
  });
});

/**
 * Hazır şablon izleri geri gelmesin (bkz. docs/uzman-incelemesi.md ve docs/arayuz-rehberi.md):
 * büyük harfli üst etiketler, degrade ve parlama süsleri, hap biçimli etiketler, ok eklenmiş
 * bağlantılar ve orta noktayla birleştirilmiş bilgi satırları kullanılmaz. Fotoğraf üzerindeki
 * koyu katman (styles.ts → photoScrimClasses) işlevsel olduğu için degrade kuralının dışındadır.
 */
describe('şablon izleri', () => {
  const root = join(process.cwd(), 'src');
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.(tsx|ts)$/.test(path) && !path.endsWith('.test.ts')) files.push(path);
    }
  };
  walk(root);
  const sources = files.map((path) => ({
    path: relative(root, path),
    text: readFileSync(path, 'utf8'),
  }));

  const rules: [string, RegExp, string[]][] = [
    ['büyük harfli etiket', /\buppercase\b/, []],
    ['açılmış harf aralığı', /\btracking-(wide|wider|widest|tight|tighter)\b/, []],
    ['degrade süs', /\bbg-(linear|radial|conic)-/, [join('components', 'ui', 'styles.ts')]],
    ['bulanık parlama', /\bblur-(sm|md|lg|xl|2xl|3xl)\b/, []],
    ['hap biçimi', /\brounded-full\b/, []],
    ['iri köşe', /\brounded-(xl|2xl|3xl)\b/, []],
    ['ok simgeli bağlantı', /\b(ArrowRight|ArrowDown|ChevronsRight)\b/, []],
    ['orta noktalı bilgi satırı', /·/, []],
  ];

  it.each(rules)('%s kullanılmıyor', (_name, pattern, allowed) => {
    const offenders = sources
      .filter(({ path, text }) => !allowed.includes(path) && pattern.test(text))
      .map(({ path }) => path);
    expect(offenders).toEqual([]);
  });

  it('kullanıcıya görünen metinlerde uzun tire yok (NaN yer tutucusu hariç)', () => {
    const offenders = sources.flatMap(({ path, text }) =>
      text
        .split('\n')
        .map((line, index) => ({ line: line.trim(), index }))
        .filter(({ line }) => line.includes('—'))
        .filter(({ line }) => !/^(\/\/|\*|\/\*|\{\/\*)/.test(line))
        .filter(({ line }) => !(path === join('lib', 'format.ts') && line.includes("return '—'")))
        .map(({ index }) => `${path}:${index + 1}`),
    );
    expect(offenders).toEqual([]);
  });
});
