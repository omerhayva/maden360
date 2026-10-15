import { parse as parseYaml } from 'yaml';

export class ContentError extends Error {
  constructor(
    public readonly file: string,
    message: string,
  ) {
    super(`${file}: ${message}`);
    this.name = 'ContentError';
  }
}

/** Windows'ta kaydedilen dosyalardaki BOM ve CRLF satır sonlarını temizler. */
export function normalizeNewlines(raw: string): string {
  return raw.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
}

const FRONTMATTER = /^---\n([\s\S]*?)\n---[ \t]*(?:\n|$)/;

/**
 * Markdown dosyasını ön bilgi (YAML) ve gövde olarak ayırır.
 * YAML 1.2 kullanılır; tarihler (2026-10-15) metin olarak kalır.
 */
export function parseFrontmatter(raw: string, file: string): { data: unknown; body: string } {
  const text = normalizeNewlines(raw);
  const match = FRONTMATTER.exec(text);
  if (!match) {
    throw new ContentError(
      file,
      'Dosya "---" satırlarıyla çevrili bir ön bilgi (frontmatter) bloğuyla başlamalı.',
    );
  }
  let data: unknown;
  try {
    data = parseYaml(match[1] ?? '', { prettyErrors: true });
  } catch (error) {
    throw new ContentError(file, `Ön bilgi YAML olarak okunamadı: ${(error as Error).message}`);
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new ContentError(file, 'Ön bilgi bir anahtar–değer listesi olmalı.');
  }
  return { data, body: text.slice(match[0].length) };
}

export function parseYamlFile(raw: string, file: string): unknown {
  try {
    return parseYaml(normalizeNewlines(raw), { prettyErrors: true });
  } catch (error) {
    throw new ContentError(file, `YAML okunamadı: ${(error as Error).message}`);
  }
}
