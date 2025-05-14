import { DataSource } from "typeorm";
import { config } from "dotenv";
import path from "path";

// Načtení proměnných z .env souboru
config();

// Typ pro konfiguraci připojení
export interface DatabaseConfig {
  name: string;
  type: "oracle";
  host: string;
  port: number;
  username: string;
  password: string;
  sid?: string;
  serviceName?: string;
  synchronize?: boolean;
  logging?: boolean;
  entities: string[];
  subscribers?: string[];
  migrations?: string[];
  poolSize?: number;
}

// Třída pro správu databázových připojení
export class DatabaseManager {
  private static instance: DatabaseManager;
  private dataSources: Map<string, DataSource> = new Map();
  private defaultDataSource: string | null = null;

  private constructor() {}

  // Singleton pattern
  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  // Registrace nového připojení
  public registerDataSource(config: DatabaseConfig): void {
    const dataSource = new DataSource({
      name: config.name,
      type: config.type,
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      sid: config.sid,
      serviceName: config.serviceName,
      synchronize: config.synchronize ?? (process.env.NODE_ENV === "development"),
      logging: config.logging ?? (process.env.NODE_ENV === "development"),
      entities: config.entities,
      subscribers: config.subscribers ?? [],
      migrations: config.migrations ?? [],
      poolSize: config.poolSize ?? 10,
    });

    this.dataSources.set(config.name, dataSource);
    
    // První registrované připojení je výchozí, pokud nebylo nastaveno jinak
    if (this.defaultDataSource === null) {
      this.defaultDataSource = config.name;
    }
  }

  // Nastavení výchozího připojení
  public setDefaultDataSource(name: string): void {
    if (!this.dataSources.has(name)) {
      throw new Error(`Databázové připojení '${name}' neexistuje`);
    }
    this.defaultDataSource = name;
  }

  // Získání připojení podle názvu
  public getDataSource(name?: string): DataSource {
    const sourceName = name || this.defaultDataSource;
    if (!sourceName) {
      throw new Error("Žádné výchozí databázové připojení není nastaveno");
    }
    
    const dataSource = this.dataSources.get(sourceName);
    if (!dataSource) {
      throw new Error(`Databázové připojení '${sourceName}' neexistuje`);
    }
    
    return dataSource;
  }

  // Inicializace všech připojení
  public async initializeAll(): Promise<void> {
    const initPromises = Array.from(this.dataSources.entries()).map(async ([name, dataSource]) => {
      try {
        await dataSource.initialize();
        console.log(`Databázové připojení '${name}' bylo úspěšně navázáno`);
      } catch (error) {
        console.error(`Chyba při připojování k databázi '${name}':`, error);
        throw error;
      }
    });

    await Promise.all(initPromises);
  }

  // Inicializace konkrétního připojení
  public async initialize(name?: string): Promise<void> {
    const dataSource = this.getDataSource(name);
    try {
      await dataSource.initialize();
      console.log(`Databázové připojení '${name || this.defaultDataSource}' bylo úspěšně navázáno`);
    } catch (error) {
      console.error(`Chyba při připojování k databázi '${name || this.defaultDataSource}':`, error);
      throw error;
    }
  }

  // Uzavření všech připojení
  public async closeAll(): Promise<void> {
    const closePromises = Array.from(this.dataSources.entries()).map(async ([name, dataSource]) => {
      if (dataSource.isInitialized) {
        await dataSource.destroy();
        console.log(`Databázové připojení '${name}' bylo úspěšně uzavřeno`);
      }
    });

    await Promise.all(closePromises);
  }

  // Uzavření konkrétního připojení
  public async close(name?: string): Promise<void> {
    const dataSource = this.getDataSource(name);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log(`Databázové připojení '${name || this.defaultDataSource}' bylo úspěšně uzavřeno`);
    }
  }
}

// Export instance správce připojení
export const databaseManager = DatabaseManager.getInstance();

// Pomocná funkce pro inicializaci všech databázových připojení
export const initializeDatabase = async (): Promise<void> => {
  try {
    await databaseManager.initializeAll();
  } catch (error) {
    console.error("Chyba při inicializaci databázových připojení:", error);
    throw error;
  }
};