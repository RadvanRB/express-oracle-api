import * as winston from 'winston';
import { format } from 'winston';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as os from 'os';

// Dynamický import DailyRotateFile - obchází problém s typovou kompatibilitou
const DailyRotateFile = require('winston-daily-rotate-file');

// Načtení konfigurace z .env souboru
dotenv.config();

// Definice konfiguračních proměnných
const DEBUG_FILTERS = process.env.DEBUG_FILTERS === 'true';
const DEBUG_METADATA = process.env.DEBUG_METADATA === 'true';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_FOLDER = process.env.LOG_FOLDER || 'logs';
const MAX_LOG_SIZE = process.env.MAX_LOG_SIZE || '20m';
const MAX_LOG_FILES = process.env.MAX_LOG_FILES || '14d';

// Pole pro ukládání důležitých událostí pro monitoring
interface MonitoringEvent {
  timestamp: Date;
  level: string;
  message: string;
  data?: any;
  eventType: string;
}

// Posledních 100 důležitých událostí pro monitoring
const recentImportantEvents: MonitoringEvent[] = [];
const MAX_MONITORING_EVENTS = 100;

// Vytvoření adresáře pro logy, pokud neexistuje
function ensureLogDirectoryExists(logFolder: string) {
  try {
    if (!fs.existsSync(logFolder)) {
      fs.mkdirSync(logFolder, { recursive: true });
      console.log(`Vytvořena složka pro logy: ${logFolder}`);
    }
  } catch (error) {
    console.error(`Chyba při vytváření složky pro logy: ${error}`);
  }
}

// Ujištění, že adresář pro logy existuje
ensureLogDirectoryExists(LOG_FOLDER);

// Formáty pro logování
const logFormats = {
  // Formát pro konzoli - barevný s časovým razítkem
  console: format.combine(
    format.colorize(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(info => {
      const { timestamp, level, message, ...rest } = info;
      let logMessage = `[${timestamp}] [${level}] ${message}`;
      
      // Přidání dalších dat, pokud existují
      if (Object.keys(rest).length > 0) {
        let additionalData = '';
        try {
          additionalData = JSON.stringify(rest, null, 2);
        } catch (e) {
          additionalData = 'Data nelze serializovat';
        }
        logMessage += ` ${additionalData}`;
      }
      
      return logMessage;
    })
  ),
  
  // Formát pro soubory - bez barev, ale s časovým razítkem a strukturovaným JSON
  file: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.json()
  )
};

// Vytvoření transportů pro logger s rotací logů
const transports: winston.transport[] = [
  // Vždy logujeme na konzoli
  new winston.transports.Console({
    format: logFormats.console
  }),
  
  // Běžné logy s rotací
  new DailyRotateFile({
    filename: path.join(LOG_FOLDER, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: MAX_LOG_SIZE,
    maxFiles: MAX_LOG_FILES,
    format: logFormats.file,
    zippedArchive: true
  }),
  
  // Chybové logy (úroveň error a výše) s rotací
  new DailyRotateFile({
    filename: path.join(LOG_FOLDER, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: MAX_LOG_SIZE,
    maxFiles: MAX_LOG_FILES,
    level: 'error',
    format: logFormats.file,
    zippedArchive: true
  }),
  
  // Logy s varovnáními (úroveň warn a výše) s rotací
  new DailyRotateFile({
    filename: path.join(LOG_FOLDER, 'warn-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: MAX_LOG_SIZE,
    maxFiles: MAX_LOG_FILES,
    level: 'warn',
    format: logFormats.file,
    zippedArchive: true
  }),
  
  // Přístupové logy (samostatný transport pro HTTP požadavky) s rotací
  new DailyRotateFile({
    filename: path.join(LOG_FOLDER, 'access-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: MAX_LOG_SIZE,
    maxFiles: MAX_LOG_FILES,
    format: logFormats.file,
    zippedArchive: true
  })
];

// Vytvoření loggeru
const logger = winston.createLogger({
  level: LOG_LEVEL,
  levels: winston.config.npm.levels,
  transports,
  // Zachytávání metadat
  defaultMeta: { 
    hostname: os.hostname(),
    pid: process.pid,
    application: 'express-oracle-api'
  }
});

/**
 * Funkce pro monitoring událostí - přidává důležité události do paměti pro pozdější analýzu
 * @param level Úroveň události (error, warn, info, debug)
 * @param message Zpráva
 * @param eventType Typ události (auth, access, error, warning)
 * @param data Další data
 */
const monitorEvent = (level: string, message: string, eventType: string, data?: any) => {
  const event: MonitoringEvent = {
    timestamp: new Date(),
    level,
    message,
    data,
    eventType
  };
  
  // Přidání události na začátek pole
  recentImportantEvents.unshift(event);
  
  // Omezení velikosti pole
  if (recentImportantEvents.length > MAX_MONITORING_EVENTS) {
    recentImportantEvents.pop(); // Odstranění nejstarší události
  }
  
  // Tady by mohla být implementace pro odeslání kritických událostí do externího monitoringu
  // například Sentry, LogDNA, New Relic, nebo vlastní webhook
  if (level === 'error' || (level === 'warn' && (eventType === 'auth' || eventType === 'security'))) {
    // Simulace odeslání do externího monitoringu
    console.warn(`[MONITORING] Critical event: ${message} [${eventType}]`);
    
    // Tady by bylo skutečné odeslání
    // sendToExternalMonitoring(event);
  }
};

/**
 * Získá posledních X důležitých událostí pro monitoring
 * @param count Počet událostí, které chceme získat (výchozí je 10)
 * @param type Volitelný filtr podle typu události
 * @returns Pole událostí
 */
export const getRecentEvents = (count: number = 10, type?: string): MonitoringEvent[] => {
  if (type) {
    return recentImportantEvents
      .filter(e => e.eventType === type)
      .slice(0, count);
  }
  return recentImportantEvents.slice(0, count);
};

/**
 * Pomocná funkce pro logování debugovacích informací o filtrech
 * @param message Zpráva pro logování
 * @param data Volitelná data pro logování
 */
export const debugFilterLog = (message: string, data?: any) => {
  if (DEBUG_FILTERS) {
    logger.debug({ message: `[FILTERS] ${message}`, ...data });
  }
};

/**
 * Pomocná funkce pro logování debugovacích informací o metadatech
 * @param message Zpráva pro logování
 * @param data Volitelná data pro logování
 */
export const debugMetadataLog = (message: string, data?: any) => {
  if (DEBUG_METADATA) {
    logger.debug({ message: `[METADATA] ${message}`, ...data });
  }
};

/**
 * Vytvoří logger pro logování HTTP požadavků
 * Tento logger bude zapisovat do access.log
 */
export const httpLogger = {
  /**
   * Zaloguje HTTP požadavek
   * @param req HTTP požadavek
   * @param res HTTP odpověď
   * @param responseTime Doba zpracování požadavku v ms
   */
  logRequest: (req: any, res: any, responseTime: number) => {
    // Získání IP adresy klienta
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // Získání uživatelského jména nebo 'anonymous' pokud není přihlášen
    const username = req.user ? req.user.username : 'anonymous';
    
    // Získání ID požadavku (pokud je k dispozici)
    const requestId = req.id || '-';
    
    // Získání HTTP metody a cesty
    const method = req.method;
    const path = req.originalUrl || req.url;
    
    // Získání status kódu odpovědi
    const statusCode = res.statusCode;
    
    // Vytvoření strukturovaného záznamu
    const logData = {
      type: 'access',
      ip,
      username,
      requestId,
      method,
      path,
      statusCode,
      responseTime,
      userAgent: req.headers['user-agent'],
      referer: req.headers.referer || '-'
    };
    
    // Zápis do access logu
    logger.info(logData);
    
    // Monitoring pro podezřelé nebo chybové požadavky
    if (statusCode >= 400) {
      // Pro 4xx kódy - client error
      if (statusCode < 500) {
        monitorEvent('warn', `Client error ${statusCode} at ${path}`, 'access', logData);
      } 
      // Pro 5xx kódy - server error
      else {
        monitorEvent('error', `Server error ${statusCode} at ${path}`, 'access', logData);
      }
    }
    
    // Monitoring pro pomalé požadavky
    if (responseTime > 1000) { // Více než 1 sekunda
      monitorEvent('warn', `Slow request (${responseTime.toFixed(0)}ms) at ${path}`, 'performance', logData);
    }
  },
  
  /**
   * Zaloguje událost autentifikace
   * @param type Typ události (login, logout, token_refresh, atd.)
   * @param username Uživatelské jméno
   * @param success Zda byla událost úspěšná
   * @param details Další detaily
   */
  logAuth: (type: string, username: string, success: boolean, details?: any) => {
    const logData = {
      type: 'auth',
      auth_type: type,
      username,
      success,
      ...details
    };
    
    // Zápis do běžného logu
    logger.info(logData);
    
    // Monitoring pro neúspěšné autentifikační události
    if (!success) {
      monitorEvent('warn', `Failed ${type} attempt for user ${username}`, 'auth', logData);
      
      // Tady by mohl být kód pro detekci opakovaných neúspěšných pokusů (brute force)
      // a případné blokování IP adresy
    }
  },
  
  /**
   * Zaloguje bezpečnostní události
   * @param message Zpráva popisující událost
   * @param severity Závažnost (high, medium, low)
   * @param details Další detaily
   */
  logSecurity: (message: string, severity: 'high' | 'medium' | 'low', details?: any) => {
    const logData = {
      type: 'security',
      message,
      severity,
      ...details
    };
    
    // Podle závažnosti logujeme na různých úrovních
    if (severity === 'high') {
      logger.error(logData);
      monitorEvent('error', message, 'security', details);
    } else if (severity === 'medium') {
      logger.warn(logData);
      monitorEvent('warn', message, 'security', details);
    } else {
      logger.info(logData);
    }
  }
};

// Rozšíření původního loggeru o monitoring
const originalError = logger.error.bind(logger);
const originalWarn = logger.warn.bind(logger);

// Přepsání metody error s monitoringem
logger.error = (message: any, ...args: any[]) => {
  // Původní logování
  originalError(message, ...args);
  
  // Přidání do monitoringu
  let eventMessage = message;
  let eventData = args[0] || {};
  
  if (typeof message === 'object') {
    eventMessage = message.message || JSON.stringify(message);
    eventData = message;
  }
  
  monitorEvent('error', eventMessage, 'error', eventData);
  
  return logger;
};

// Přepsání metody warn s monitoringem pro důležité varování
logger.warn = (message: any, ...args: any[]) => {
  // Původní logování
  originalWarn(message, ...args);
  
  // Přidání důležitých varování do monitoringu
  let eventMessage = message;
  let eventData = args[0] || {};
  let isImportant = false;
  
  if (typeof message === 'object') {
    eventMessage = message.message || JSON.stringify(message);
    eventData = message;
    
    // Kontrola, zda je varování důležité (např. obsahuje určitá klíčová slova)
    isImportant = ['security', 'auth', 'permission', 'warning'].some(
      keyword => JSON.stringify(message).toLowerCase().includes(keyword)
    );
  } else if (typeof message === 'string') {
    isImportant = ['security', 'auth', 'permission', 'warning'].some(
      keyword => message.toLowerCase().includes(keyword)
    );
  }
  
  if (isImportant) {
    monitorEvent('warn', eventMessage, 'warning', eventData);
  }
  
  return logger;
};

export default logger;