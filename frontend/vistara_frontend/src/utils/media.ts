export function getMediaUrl(path?: string | null) {
  if (!path) return '/placeholder_event.jpg';
  if (path.startsWith('http')) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `http://127.0.0.1:8000${p}`;
}

export default getMediaUrl;
