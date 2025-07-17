// utils/logger.ts

import { createLogger, format, transports } from 'winston';

/**
 * Logger configuration using Winston for structured, leveled logging.
 */
export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.colorize(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(
      ({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`,
    ),
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/playwright.log' }),
  ],
});
