const dotenv = require('dotenv');
const fs = require('fs');

const defaultEnv = './config/.env.local';
const ciEnv = './config/.env-cucumber';
const envFile = fs.existsSync(ciEnv) ? ciEnv : defaultEnv;

dotenv.config({ path: envFile });

const isLocal = process.env.NODE_ENV !== 'ci';

module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: ['./steps/**/*.ts'], // Adjusted path based on folder structure
    paths: ['./features/**/*.feature'], // Adjusted if features are not inside "tests/"
    format: ['progress', 'json:test-results/json/report.json'],
    retry: 1
  }
};
