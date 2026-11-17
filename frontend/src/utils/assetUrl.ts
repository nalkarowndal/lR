export function resolveAssetUrl(source?: string | null): string | undefined {
  if (typeof source !== 'string') return undefined;
  const url = source.trim();
  if (!url) return undefined;
  if (/^(?:https?:|data:|blob:|\/\/)/i.test(url)) return url;

  const path = url.replace(/^\//, '');
  // Bundled assets follow the app base. Runtime uploads use the server's asset path.
  if (path.startsWith('assets/') && !path.startsWith('assets/uploads/')) {
    return `${import.meta.env.BASE_URL}${path}`;
  }

  return `/${path}`;
}
