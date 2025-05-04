import path from "path";
import { DatabaseConfig, databaseManager } from "./databaseManager";

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
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [path.join(__dirname, "../modules/**/models/**/*.{js,ts}")],
  subscribers: [],
  migrations: [path.join(__dirname, "../migrations/**/*.{js,ts}")],
  poolSize: 10
};

// Další připojení pro jiné oblasti (např. pro datový sklad, historická data, apod.)
export const secondaryDatabaseConfig: DatabaseConfig = {
  name: "secondary",
  type: "oracle",
  host: process.env.ORACLE_SECONDARY_HOST || process.env.ORACLE_HOST || "localhost",
  port: parseInt(process.env.ORACLE_SECONDARY_PORT || process.env.ORACLE_PORT || "1521"),
  username: process.env.ORACLE_SECONDARY_USERNAME || process.env.ORACLE_USERNAME || "system",
  password: process.env.ORACLE_SECONDARY_PASSWORD || process.env.ORACLE_PASSWORD || "password",
  sid: process.env.ORACLE_SECONDARY_SID || process.env.ORACLE_SID,
  serviceName: process.env.ORACLE_SECONDARY_SERVICE_NAME || process.env.ORACLE_SERVICE_NAME,
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [path.join(__dirname, "../modules/**/models/**/*.{js,ts}")],
  subscribers: [],
  migrations: [path.join(__dirname, "../migrations/**/*.{js,ts}")],
  poolSize: 5
};

// Registrace všech databázových připojení
export const registerDatabaseConnections = (): void => {
  // Registrace hlavního připojení
  databaseManager.registerDataSource(mainDatabaseConfig);
  
  // Registrace sekundárního připojení
  databaseManager.registerDataSource(secondaryDatabaseConfig);
  
  // Nastavení výchozího připojení
  databaseManager.setDefaultDataSource("main");
};

// create  a new type as one of databaseconfig names in this case only valids are "main" and "secondary"
export type DatabaseConnectionName = "main" | "secondary";
