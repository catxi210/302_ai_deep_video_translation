/**
 * Convert ASS subtitle color format (&HAARRGGBB) to CSS color format (#RRGGBBAA)
 * @param assColor ASS subtitle color format, e.g. &HFFFFFF or &H00FFFFFF
 * @returns CSS color format, e.g. #FFFFFF or #FFFFFFFF
 * @example
 * assColorToCss("&H003434B7") => "#B73434FF"
 */
export function assColorToCss(assColor: string | undefined | null): string {
  if (!assColor) {
    return "#000000";
  }

  if (!assColor.startsWith("&H")) {
    return assColor;
  }

  // Remove &H prefix and pad to 8 digits
  let color = assColor.substring(2).toUpperCase();
  if (color.length <= 6) {
    color = "00" + color.padStart(6, "0");
  }

  // Ensure 8 digits
  if (color.length !== 8) {
    return "#000000";
  }

  // ASS format is AABBGGRR, need to convert to RRGGBBAA
  const aa = color.substring(0, 2);
  const bb = color.substring(2, 4);
  const gg = color.substring(4, 6);
  const rr = color.substring(6, 8);

  // If alpha is 00, convert to FF (because 00 is opaque in ASS, while FF is opaque in CSS)
  const cssAlpha =
    aa === "00"
      ? "FF"
      : (255 - parseInt(aa, 16)).toString(16).padStart(2, "0").toUpperCase();

  return `#${rr}${gg}${bb}${cssAlpha}`;
}

/**
 * Convert CSS color format (#RRGGBBAA) to ASS subtitle color format (&HAARRGGBB)
 * @param cssColor CSS color format, e.g. #FFFFFF or #FFFFFFFF
 * @returns ASS subtitle color format, e.g. &H00FFFFFF
 * @example
 * cssColorToAss("#B73434FF") => "&H003434B7"
 */
export function cssColorToAss(cssColor: string | undefined | null): string {
  if (!cssColor) {
    return "&H00000000";
  }

  if (!cssColor.startsWith("#")) {
    return cssColor;
  }

  // Remove # prefix
  let color = cssColor.substring(1).toUpperCase();
  if (color.length === 6) {
    color = color + "FF";
  }

  // Ensure 8 digits
  if (color.length !== 8) {
    return "&H00000000";
  }

  // CSS format is RRGGBBAA, need to convert to AABBGGRR
  const rr = color.substring(0, 2);
  const gg = color.substring(2, 4);
  const bb = color.substring(4, 6);
  const aa = color.substring(6, 8);

  // If alpha is FF, convert to 00 (because FF is opaque in CSS, while 00 is opaque in ASS)
  const assAlpha =
    aa === "FF"
      ? "00"
      : (255 - parseInt(aa, 16)).toString(16).padStart(2, "0").toUpperCase();

  return `&H${assAlpha}${bb}${gg}${rr}`;
}

/**
 * Convert hexadecimal color to RGBA color object
 * @param hex Hexadecimal color, e.g. #FFFFFF or #FFFFFFFF
 * @returns RGBA color object
 */
export function hexToRgba(hex: string | undefined | null): {
  r: number;
  g: number;
  b: number;
  a: number;
} {
  if (!hex) {
    return { r: 0, g: 0, b: 0, a: 1 }; // Return opaque black if undefined or null
  }

  // Remove # prefix
  hex = hex.replace("#", "");

  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Parse alpha if present
  const a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1;

  // Handle invalid values
  return {
    r: isNaN(r) ? 0 : r,
    g: isNaN(g) ? 0 : g,
    b: isNaN(b) ? 0 : b,
    a: isNaN(a) ? 1 : a,
  };
}

/**
 * Convert RGBA color object to hexadecimal color
 * @param rgba RGBA color object
 * @returns Hexadecimal color, e.g. #FFFFFFFF
 */
export function rgbaToHex({
  r,
  g,
  b,
  a,
}: {
  r: number;
  g: number;
  b: number;
  a: number;
}): string {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(Math.round(a * 255))}`;
}
