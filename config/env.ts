export type Market = 'RO' | 'IT';

export interface AppConfig {
  baseURL: string;
  site: Market;        // X-Site header
  locale: string;      // Accept-Language header
  transport: 'fetch' | 'pw'; // transport layer
  storageStatePath?: string; // location of storageState
}

export const cfg: AppConfig = {
  baseURL: process.env.BASE_URL ?? 'https://answear.ro',
  site: (process.env.SITE as Market) ?? 'RO',
  locale: process.env.LOCALE ?? 'ro-RO',
  transport: (process.env.API_TRANSPORT as 'fetch' | 'pw') ?? 'pw',
  storageStatePath: process.env.STORAGE_STATE ?? './auth/userAuth-RO-0.json',
};
