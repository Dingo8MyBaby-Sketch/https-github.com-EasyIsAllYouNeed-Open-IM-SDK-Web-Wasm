// eslint-disable-next-line no-control-regex
const CHARS_GLOBAL_BACKSLASH_SUPPORTED_RX = /[\0\b\t\n\r\x1a"'\\]/g;
const CHARS_ESCAPE_BACKSLASH_SUPPORTED_MAP: Record<string, string> = {
  '\0': '\\0',
  '\b': '\\b',
  '\t': '\\t',
  '\n': '\\n',
  '\r': '\\r',
  '\x1a': '\\Z',
  '"': '\\"',
  "'": "\\'",
  '\\': '\\\\',
};

export function escapeString(
  val: string,
  opts: { backslashSupported: boolean } = { backslashSupported: false }
) {
  if (val == null) {
    throw new Error('Need to pass a valid string');
  }
  opts = opts || {};
  const backslashSupported = !!opts.backslashSupported;

  if (!backslashSupported) return "'" + val.replace(/'/g, "''") + "'";

  const charsRx = CHARS_GLOBAL_BACKSLASH_SUPPORTED_RX;
  const charsEscapeMap = CHARS_ESCAPE_BACKSLASH_SUPPORTED_MAP;
  let chunkIndex = (charsRx.lastIndex = 0);
  let escapedVal = '';
  let match;

  while ((match = charsRx.exec(val))) {
    escapedVal += val.slice(chunkIndex, match.index) + charsEscapeMap[match[0]];
    chunkIndex = charsRx.lastIndex;
  }

  if (chunkIndex === 0) return "'" + val + "'";

  if (chunkIndex < val.length)
    return "'" + escapedVal + val.slice(chunkIndex) + "'";
  return "'" + escapedVal + "'";
}
