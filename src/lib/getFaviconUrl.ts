export function getFaviconUrl(pageUrl: string, size: 32 | 64 = 64) {
  return `http://www.google.com/s2/favicons?domain=${encodeURIComponent(
    pageUrl,
  )}&size=${size}`;
}
