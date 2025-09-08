export type SearchPay = {
  // align with your real API contract:
  queryString: string;
  sort: string;
  filters: Record<string, unknown>;
  productsPerPage: number;
  category?: string;
  page: number;
};

export function buildSearchPayload(query: string): SearchPay {
  return {
    queryString: query,
    sort: '',
    filters: {},
    productsPerPage: 80,
    category: 'barbati',
    page: 1,
  };
}
