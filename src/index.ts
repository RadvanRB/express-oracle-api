import { createApp } from "./app";
import { SERVER_CONFIG } from "./config/server";
import { initializeDatabase } from "./config/database";
import pLimit from "p-limit";

// Globální omezovač paralelismu
export const limiter = pLimit(SERVER_CONFIG.maxConcurrentOperations);

// Funkce pro spuštění serveru
const startServer = async () => {
  try {
    // Inicializace databáze
    await initializeDatabase();
    
    // Vytvoření aplikace
    const app = createApp();
    
    // Spuštění serveru
    app.listen(SERVER_CONFIG.port, () => {
      console.log(`Server běží na portu ${SERVER_CONFIG.port} v módu ${SERVER_CONFIG.environment}`);
      console.log(`Health check: http://localhost:${SERVER_CONFIG.port}/health`);
    });
  } catch (error) {
    console.error("Chyba při spuštění serveru:", error);
    process.exit(1);
  }
};

// Spuštění serveru
startServer();

// Zpracování neodchycených výjimek
process.on("uncaughtException", (error) => {
  console.error("Neodchycená výjimka:", error);
  process.exit(1);
});

// Zpracování nezachycených Promise rejection
process.on("unhandledRejection", (reason, promise) => {
  console.error("Nezachycená Promise rejection:", reason);
  process.exit(1);
});