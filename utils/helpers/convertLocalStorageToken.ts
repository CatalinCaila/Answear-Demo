import fs from 'fs';
import path from 'path';
import { logger } from '../logger';

const storageFilePath = path.resolve(__dirname, '../../auth/userAuth.json');
const outputFilePath = path.resolve(__dirname, '../../auth/accessToken.txt');

// Load storage state
const storageState = JSON.parse(fs.readFileSync(storageFilePath, 'utf-8')) as {
  origins: {
    origin: string;
    localStorage: { name: string; value: string }[];
  }[];
};

// Look for Answear domain
const answearStorage = storageState.origins.find(
  (entry) => entry.origin === 'https://answear.ro'
); 

if (!answearStorage) {
  logger.error('❌ Answear.ro localStorage entry missing.');
  throw new Error(`❌ Could not find localStorage for https://answear.ro`);
}

// Find 'access_token' key
const accessTokenEntry = answearStorage.localStorage.find(
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
