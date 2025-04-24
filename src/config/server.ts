import { config } from "dotenv";

// Načtení proměnných z .env souboru
config();

export const SERVER_CONFIG = {
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || "development",
  maxConcurrentOperations: parseInt(process.env.MAX_CONCURRENT_OPERATIONS || "10"),
  
  // CORS nastavení
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  
  // Limity požadavků
  requestLimits: {
    bodyLimit: "10mb",
  }
};