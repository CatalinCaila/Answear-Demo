import fs from 'fs';
import path from 'path';
import { logger } from '../logger';

const domain = process.env.BASE_URL || 'https://answear.ro'; // 👈 Dynamic domain variable

const storageFilePath = path.resolve(__dirname, '../../auth/userAuth.json');
const outputFilePath = path.resolve(__dirname, '../../auth/accessToken.txt');

// Load storage state
const storageState = JSON.parse(fs.readFileSync(storageFilePath, 'utf-8')) as {
  origins: {
    origin: string;
    localStorage: { name: string; value: string }[];
  }[];
};

// Use dynamic domain here instead of hardcoded URL
const domainStorage = storageState.origins.find(
  (entry) => entry.origin === domain
);

if (!domainStorage) {
  logger.error(`❌ ${domain} localStorage entry missing.`);
  throw new Error(`❌ Could not find localStorage for ${domain}`);
}

// Find 'access_token' key
const accessTokenEntry = domainStorage.localStorage.find(
  (entry) => entry.name === 'access_token'
);

if (!accessTokenEntry) {
  logger.error('❌ access_token missing in localStorage.');
  throw new Error(`❌ 'access_token' not found in localStorage.`);
}

// Write the token to file
fs.writeFileSync(outputFilePath, accessTokenEntry.value, 'utf-8');

console.log(accessTokenEntry.value);
logger.info(`✅ access_token extracted and saved to ${outputFilePath}`);
