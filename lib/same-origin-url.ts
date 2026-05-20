export function toSameOriginPath(url: string | null | undefined, fallbackPath: string) {
  if (!url) return fallbackPath;

  try {
    const parsedUrl = new URL(url, window.location.origin);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return fallbackPath;
    }

    return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  } catch {
    return fallbackPath;
  }
}
