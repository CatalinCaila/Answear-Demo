import winston from 'winston';

const logLevel = process.env.ENABLE_LOGS === 'false' ? 'silent' : 'info';

export const logger = winston.createLogger({
  level: logLevel,
  transports: [new winston.transports.Console()],
});
