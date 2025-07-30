import { test as base } from '@playwright/test';

export const test = base.extend<{
  searchItem: string;
}>({
  searchItem: ['pantaloni', { option: true }],
});
