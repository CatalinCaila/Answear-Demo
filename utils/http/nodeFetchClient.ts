import type { HttpClient } from './httpClient';

export class NodeFetchClient implements HttpClient {
  constructor(private baseURL: string) {}

  async post<T>(path: string, body: any, headers: Record<string,string> = {}) {
    const res = await fetch(`${this.baseURL}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const text = await res.text();
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText} | Body: ${text}`);
    }
    return { status: res.status, data: JSON.parse(text) as T };
  }
}
