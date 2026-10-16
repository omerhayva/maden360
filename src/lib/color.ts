/** Renk yardımcıları: WCAG 2.x göreli parlaklık, kontrast oranı ve saydam katman bindirme. */

export type Rgb = readonly [red: number, green: number, blue: number];

export function hexToRgb(hex: string): [number, number, number] {
  const digits = /^#([0-9a-f]{6})$/i.exec(hex)?.[1];
  if (!digits) throw new Error(`Geçersiz renk: ${hex} (#rrggbb bekleniyor)`);
  const value = Number.parseInt(digits, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

const linear = (value: number) => {
  const channel = value / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
};

/** WCAG göreli parlaklık (0 = siyah, 1 = beyaz) */
export function relativeLuminance([red, green, blue]: Rgb): number {
  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
}

/** WCAG kontrast oranı (1–21) */
export function contrastRatio(first: Rgb, second: Rgb): number {
  const a = relativeLuminance(first);
  const b = relativeLuminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** `top` rengini `alpha` örtücülükle `bottom` üzerine bindirir (tarayıcılar gibi sRGB'de) */
export function composite(top: Rgb, alpha: number, bottom: Rgb): [number, number, number] {
  const mix = (upper: number, lower: number) => upper * alpha + lower * (1 - alpha);
  return [mix(top[0], bottom[0]), mix(top[1], bottom[1]), mix(top[2], bottom[2])];
}

/** CSS'teki `--color-<ad>: #rrggbb;` tanımlarını okur → { 'copper-600': '#b64e00', … } */
export function parseThemeColors(css: string): Record<string, string> {
  const colors: Record<string, string> = {};
  for (const match of css.matchAll(/--color-([a-z]+-\d+):\s*(#[0-9a-f]{6})\s*;/gi)) {
    const [, name, hex] = match;
    if (name && hex) colors[name] = hex.toLowerCase();
  }
  return colors;
}
