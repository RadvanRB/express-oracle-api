import path from "path";
import { DatabaseConfig, databaseManager } from "./databaseManager";
import { EmailConfig } from "../utils/DatabaseErrorHandler";

// Konfigurace připojení pro různé oblasti aplikace
// Můžete přidat další připojení podle potřeb

// Hlavní připojení (výchozí)
export const mainDatabaseConfig: DatabaseConfig = {
  name: "main",
  type: "oracle",
  host: process.env.ORACLE_HOST || "localhost",
  port: parseInt(process.env.ORACLE_PORT || "1521"),
  username: process.env.ORACLE_USERNAME || "system",
  password: process.env.ORACLE_PASSWORD || "password",
  sid: process.env.ORACLE_SID,
  serviceName: process.env.ORACLE_SERVICE_NAME,
  //synchronize: process.env.NODE_ENV === "development",
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: [path.join(__dirname, "../modules/**/models/**/*.{js,ts}")],
  subscribers: [],
  migrations: [path.join(__dirname, "../migrations/**/*.{js,ts}")],
  poolSize: 10
};

// Další připojení pro jiné oblasti (např. pro datový sklad, historická data, apod.)
export const secondaryDatabaseConfig: DatabaseConfig = {
  name: "etlowner",
  type: "oracle",
  host: process.env.ORACLE_SECONDARY_HOST || process.env.ORACLE_HOST || "localhost",
  port: parseInt(process.env.ORACLE_SECONDARY_PORT || process.env.ORACLE_PORT || "1521"),
  username: process.env.ORACLE_SECONDARY_USERNAME || process.env.ORACLE_USERNAME || "system",
  password: process.env.ORACLE_SECONDARY_PASSWORD || process.env.ORACLE_PASSWORD || "password",
  sid: process.env.ORACLE_SECONDARY_SID || process.env.ORACLE_SID,
  serviceName: process.env.ORACLE_SECONDARY_SERVICE_NAME || process.env.ORACLE_SERVICE_NAME,
  //synchronize: process.env.NODE_ENV === "development",
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  // Upraveno - pouze entity z modulu etlcore
  entities: [
    path.join(__dirname, "../modules/etlcore/**/models/**/*.{js,ts}"),
    path.join(__dirname, "../modules/interfaces/**/models/**/*.{js,ts}")
  ],
  subscribers: [],
  migrations: [path.join(__dirname, "../migrations/**/*.{js,ts}")],
  poolSize: 5
};

// Registrace všech databázových připojení
export const registerDatabaseConnections = (): void => {
  // Registrace hlavního připojení
  databaseManager.registerDataSource(mainDatabaseConfig);
  console.log("Hlavní databázové připojení registrováno:", mainDatabaseConfig.name);
  
  // Registrace sekundárního připojení
  databaseManager.registerDataSource(secondaryDatabaseConfig);
  console.log("Sekundární databázové připojení registrováno:", secondaryDatabaseConfig.name);
  
  // Nastavení výchozího připojení
  databaseManager.setDefaultDataSource("main");
  console.log("Výchozí databázové připojení nastaveno na:", "main");
};

// create  a new type as one of databaseconfig names in this case only valids are "main" and "secondary"
export type DatabaseConnectionName = "main" | "etlowner";


// Konfigurace pro odesílání emailů při chybách databáze
// Tato konfigurace by měla být načtena z konfiguračního souboru nebo prostředí
// a měla by obsahovat informace o tom, zda je odesílání emailů povoleno,
// komu se mají posílat a jaký je předmět emailu

export  const databaseErrorMailConfig: EmailConfig = {
  enabled: process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true',
  recipient: process.env.EMAIL_RECIPIENT || 'admin@example.com',
  sender: process.env.EMAIL_SENDER || 'system@example.com',
  subjectPrefix: process.env.EMAIL_SUBJECT_PREFIX || '[DB ERROR]'
};

export const databaseErrorMaxRetries = parseInt(process.env.DB_ERROR_MAX_RETRIES || '3');
export const databaseErrorRetryInterval = parseInt(process.env.DB_ERROR_RETRY_INTERVAL || '1000'); // ms