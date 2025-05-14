import { DataSource } from "typeorm";
import { config } from "dotenv";
import path from "path";

// Načtení proměnných z .env souboru
config();

// Vytvoření instance připojení k databázi
export const AppDataSource = new DataSource({
  type: "oracle",
  host: process.env.ORACLE_HOST || "localhost",
  port: parseInt(process.env.ORACLE_PORT || "1521"),
  username: process.env.ORACLE_USERNAME || "system",
  password: process.env.ORACLE_PASSWORD || "password",
  sid: process.env.ORACLE_SID,
  serviceName: process.env.ORACLE_SERVICE_NAME,
  synchronize: process.env.NODE_ENV === "development", // Automatická synchronizace schématu v vývojovém prostředí
  logging: process.env.NODE_ENV === "development",
  entities: [path.join(__dirname, "../models/**/*.{js,ts}")],
  subscribers: [],
  migrations: [path.join(__dirname, "../migrations/**/*.{js,ts}")],
  poolSize: 10, // Velikost connection poolu
  //connectTimeout: 30000,
  //con
});

// Inicializace databázového připojení
export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log("Databázové připojení bylo úspěšně navázáno");
  } catch (error) {
    console.error("Chyba při připojování k databázi:", error);
    throw error;
  }
};