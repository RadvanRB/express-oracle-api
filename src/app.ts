import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import "express-async-errors";
import swaggerUi from "swagger-ui-express";

import { SERVER_CONFIG } from "./config/server";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { parseQueryParams } from "./middlewares/queryParser";

// Import TSOA generovaného routeru
import { RegisterRoutes } from "./routes/generated/routes";

export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(helmet()); // Bezpečnostní hlavičky
  app.use(compression()); // Komprese odpovědí
  app.use(cors(SERVER_CONFIG.cors)); // CORS nastavení
  app.use(express.json({ limit: SERVER_CONFIG.requestLimits.bodyLimit })); // Parsování JSON
  app.use(express.urlencoded({ extended: true })); // Parsování URL-encoded dat
  
  // Logování požadavků
  if (SERVER_CONFIG.environment === "development") {
    app.use(morgan("dev"));
  } else {
    app.use(morgan("combined"));
  }

  // Statické soubory pro Swagger UI
  app.use(express.static("public"));

  // Test endpoint pro ověření funkčnosti Express
  app.get('/test', (req, res) => {
    res.json({ message: 'Test endpoint funguje!' });
  });

  app.use("/products", parseQueryParams);

  // Nastavení TSOA cest
  RegisterRoutes(app);

  // Swagger UI
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
      swaggerUrl: "/swagger.json",
      explorer: true,
    })
  );

  // Základní route pro health check
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      message: "Server běží",
      environment: SERVER_CONFIG.environment,
    });
  });

  // Middleware pro obsluhu chyb 404 - musí být až po RouterRoutes
  app.use(notFoundHandler);

  // Globální middleware pro zpracování chyb
  app.use(errorHandler);

  return app;
};