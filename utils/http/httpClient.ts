export interface HttpClient {
  post<T>(path: string, body: any, headers?: Record<string,string>): Promise<{ status: number; data: T }>;
}
