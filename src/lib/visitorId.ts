const VISITOR_COOKIE = 'visitor_id';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/; SameSite=Lax`;
}

export function getVisitorId(): string {
  const existing = getCookie(VISITOR_COOKIE);
  if (existing) return existing;

  let id: string;
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    id = crypto.randomUUID();
  } else {
    id = `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  setCookie(VISITOR_COOKIE, id, ONE_YEAR_SECONDS);
  return id;
}
