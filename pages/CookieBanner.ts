// // pages/CookieBanner.ts
// import { Locator, Page } from '@playwright/test';

// export class CookieBanner {
//   readonly page: Page;
//   readonly acceptButton: Locator;

//   constructor(page: Page) {
//     this.page = page;
//     this.acceptButton = page.getByTestId('cookiesAcceptButton');
//   }

//   public async clickIfPresent(): Promise<void> {
//     try {
//       await this.acceptButton.waitFor({ state: 'visible', timeout: 10000 });
//       await this.acceptButton.click();
//       console.log('✅ Clicked cookie banner: Acceptă toate');
//     } catch {
//       console.warn('⚠️ Accept button not found or not visible – skipping');
//     }
//   }
// }
