import type { AuthContext } from '../auth/authProviders';

export function buildHeaders(
  auth: AuthContext,
  {
    locale,
    site,
    includeTamago = true,
    tamagoHeaderName = 'Tamago',  // adjust if it's 'X-Tamago'
    extra = {},
  }: {
    locale: string;
    site: string;
    includeTamago?: boolean;
    tamagoHeaderName?: string;
    extra?: Record<string,string>;
  }
): Record<string,string> {
  const base: Record<string,string> = {
    'Content-Type': 'application/json',
    'Accept-Language': locale,
    'X-Site': site,
  };
  if (auth?.token) base['Authorization'] = `Bearer ${auth.token}`;
  if (includeTamago && auth?.tamago) base[tamagoHeaderName] = auth.tamago;

  return { ...base, ...auth?.extraHeaders, ...extra };
}
