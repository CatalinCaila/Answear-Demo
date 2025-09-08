import { request, type APIRequestContext } from '@playwright/test';
import type { HttpClient } from './httpClient';

export class PlaywrightClient implements HttpClient {
  private ctx!: APIRequestContext;
  private ready = false;

  constructor(private baseURL: string, private storageStatePath?: string) {}

  private async ensure() {
    if (this.ready) return;
    this.ctx = await request.newContext({
      baseURL: this.baseURL,
      storageState: this.storageStatePath, // replays cookies/localStorage
    });
    this.ready = true;
  }

  async post<T>(path: string, body: any, headers: Record<string,string> = {}) {
    await this.ensure();
    const res = await this.ctx.post(path, { data: body, headers });
    const text = await res.text();
    if (!res.ok()) {
      throw new Error(`HTTP ${res.status()} ${res.statusText()} | Body: ${text}`);
    }
    return { status: res.status(), data: JSON.parse(text) as T };
  }
}
