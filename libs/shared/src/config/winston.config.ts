import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

/**
 * Configuración de Winston Logger
 * El nivel de log se controla mediante la variable de entorno LOG_LEVEL
 * Niveles disponibles: error, warn, info, http, verbose, debug, silly
 */
export const createWinstonConfig = (
  serviceName: string,
): WinstonModuleOptions => {
  const logLevel = process.env.LOG_LEVEL || 'info';
  const nodeEnv = process.env.NODE_ENV || 'development';

  const formats = [
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ];

  // En desarrollo, usar formato colorido y legible
  if (nodeEnv === 'development') {
    formats.push(
      winston.format.colorize({ all: true }),
      winston.format.printf(({ timestamp, level, message, context, trace }) => {
        const contextStr = context ? `[${context}]` : '';
        const traceStr = trace ? `\n${trace}` : '';
        return `${timestamp} ${level} ${contextStr} ${message}${traceStr}`;
      }),
    );
  }

  return {
    level: logLevel,
    format: winston.format.combine(...formats),
    defaultMeta: { service: serviceName },
    transports: [
      // Console transport
      new winston.transports.Console({
        format:
          nodeEnv === 'development'
            ? winston.format.combine(
                winston.format.colorize({ all: true }),
                winston.format.printf(
                  ({ timestamp, level, message, context, trace }) => {
                    const contextStr = context ? `[${context}]` : '';
                    const traceStr = trace ? `\n${trace}` : '';
                    return `${timestamp} ${level} ${contextStr} ${message}${traceStr}`;
                  },
                ),
              )
            : winston.format.json(),
      }),
      // File transport para errores
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
      // File transport para todos los logs
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    ],
  };
};
