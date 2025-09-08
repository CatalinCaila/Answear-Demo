// import { logger } from '../../utils/logger/logger';
// import { AuthContext } from '../helpers/authHelper';

// export async function fetchSearchResults(
//   searchTerm: string,
//   baseURL: string,
//   auth: AuthContext,
//   site = 'RO',
//   lang = 'ro-RO'
// ): Promise<any> {
//   logger.info(`[fetchSearchResults] Start... term="${searchTerm}"`);

//   const headers: Record<string, string> = {
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${auth.token}`,
//     'Accept-Language': lang,
//     'X-Site': site,
//   };

//   if (auth.tamago) {
//     headers['Tamago'] = auth.tamago; // 👈 exact name must match server’s expectation
//   }

//   const response = await fetch(`${baseURL}/api/products`, {
//     method: 'POST',
//     headers,
//     body: JSON.stringify({ query: searchTerm }), // adjust payload if UI uses another field
//   });

//   if (!response.ok) {
//     const errText = await response.text().catch(() => '');
//     throw new Error(
//       `❌ Search API failed: ${response.status} ${response.statusText} | Body: ${errText}`
//     );
//   }

//   const data = await response.json();
//   logger.info(`[fetchSearchResults] ✅ ${data.items?.length ?? 0} products`);
//   logger.info(`[fetchSearchResults] End...`);
//   return data;
// }
