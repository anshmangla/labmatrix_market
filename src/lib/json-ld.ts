const BACKSLASH = String.fromCharCode(92);
const LINE_SEPARATOR = new RegExp(String.fromCharCode(0x2028), "g");
const PARAGRAPH_SEPARATOR = new RegExp(String.fromCharCode(0x2029), "g");

/**
 * Serializes structured data for a <script type="application/ld+json"> tag.
 * Escapes "<" (as a JSON unicode escape) so user-controlled strings such as
 * "</script>" cannot break out of the script element.
 */
export function toJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, BACKSLASH + "u003c")
    .replace(LINE_SEPARATOR, BACKSLASH + "u2028")
    .replace(PARAGRAPH_SEPARATOR, BACKSLASH + "u2029");
}
