import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ValidateError } from "tsoa";
import { DbErrorResponse, isDbErrorResponse } from "../services/AbstractService";

// Interface pro rozšířené chyby
export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  errors?: any[];
  recovered?: boolean; // Pro databázové chyby
}

/**
 * Globální middleware pro zpracování chyb
 */
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Chyba:", err);

  // Výchozí status kód a zpráva
  let statusCode = err.statusCode || 500;
  let message = err.message || "Nastala chyba na serveru";
  let errors: any[] | undefined;
  let recovered = false;

  // Zpracování specifických typů chyb
  if (isDbErrorResponse(err)) {
    // Zpracování našich vlastních databázových chyb
    const dbError = err as DbErrorResponse;
    statusCode = dbError.recovered ? 200 : 503;
    message = dbError.message;
    recovered = dbError.recovered;
    console.error(`[DB Error] Endpoint: ${req.originalUrl}, Error: ${dbError.error}`);
  } else if (err instanceof ValidateError) {
    // Validační chyby z TSOA
    statusCode = 400;
    message = "Validační chyba";
    errors = Object.entries(err.fields).map(([key, value]) => ({
      path: key,
      message: value.message,
    }));
  } else if (err instanceof ZodError) {
    // Validační chyby ze Zod
    statusCode = 400;
    message = "Validační chyba";
    errors = err.errors.map((e) => ({
      path: e.path.join("."),
      message: e.message,
    }));
  } else if (err.name === "QueryFailedError") {
    // Chyby z TypeORM
    statusCode = 400;
    message = "Chyba při dotazu do databáze";
  }

  // Poslání odpovědi klientovi
  res.status(statusCode).json({
    status: recovered ? "warning" : "error",
    message,
    errors,
    recovered,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};

/**
 * Middleware pro zpracování chyb 404 (nenalezeno)
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: `Cesta ${req.originalUrl} nebyla nalezena`,
  });
};