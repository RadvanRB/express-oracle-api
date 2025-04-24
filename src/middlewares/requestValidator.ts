import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

// Typy zdrojů, ze kterých lze validovat data
export type ValidationSource = "body" | "query" | "params";

/**
 * Vytvoří middleware pro validaci dat v požadavku pomocí Zod schématu
 * @param schema Zod validační schéma
 * @param source Zdroj dat pro validaci (body, query, params)
 */
export const validate = 
  (schema: z.ZodTypeAny, source: ValidationSource = "body") => 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validace dat podle zdroje
      const data = req[source];
      const validatedData = schema.parse(data);
      
      // Přiřazení validovaných dat zpět do požadavku
      req[source] = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formátování chybové zprávy ze Zod
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));
        
        res.status(400).json({
          status: "error",
          message: "Validační chyba",
          errors: formattedErrors,
        });
      } else {
        // Pokud nastane jiná chyba, předej ji dál
        next(error);
      }
    }
  };