import { Request, Response, NextFunction } from "express";
import { httpLogger } from "../utils/logger";
import onFinished from "on-finished";
import onHeaders from "on-headers";

/**
 * Middleware pro logování HTTP požadavků
 * Loguje detaily o každém HTTP požadavku, včetně doby zpracování
 */
export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  // Generování unikátního ID požadavku (pokud ještě není nastaveno)
  req.id = req.id || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Začátek měření doby zpracování
  const startHrTime = process.hrtime();
  
  // Funkce pro výpočet doby zpracování v ms
  const getDurationInMilliseconds = (start: [number, number]) => {
    const end = process.hrtime(start);
    return (end[0] * 1000) + (end[1] / 1000000);
  };
  
  // Funkce pro logování po dokončení zpracování požadavku
  const logRequest = () => {
    const responseTime = getDurationInMilliseconds(startHrTime);
    httpLogger.logRequest(req, res, responseTime);
  };
  
  // Registrace události pro logování při dokončení odpovědi
  onFinished(res, logRequest);
  
  // Pokračování ve zpracování požadavku
  next();
}

/**
 * Middleware pro logování autentifikačních událostí
 * Použití: Přidejte tento middleware po autentifikačním middleware
 */
export function authLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  // Původní req.user (před případnou změnou z autentifikace)
  const originalUser = req.user;
  
  // Sledování onHeaders události pro zachycení změn v req.user
  onHeaders(res, () => {
    // Pokud se req.user změnil (došlo k přihlášení nebo odhlášení)
    if (originalUser !== req.user) {
      // Pokud je uživatel nyní přihlášen (nově přihlášen)
      if (req.user && !originalUser) {
        httpLogger.logAuth(
          "login", 
          req.user.username, 
          true, 
          { 
            source: req.headers['user-agent'],
            ip: req.ip || req.connection.remoteAddress
          }
        );
      }
      
      // Pokud je uživatel nyní odhlášen (nově odhlášen)
      if (!req.user && originalUser) {
        httpLogger.logAuth(
          "logout", 
          originalUser.username, 
          true, 
          { 
            source: req.headers['user-agent'],
            ip: req.ip || req.connection.remoteAddress
          }
        );
      }
    }
  });
  
  next();
}

/**
 * Aplikuje všechny logovací middlewary
 * @param app Express aplikace
 */
export function setupLogging(app: any) {
  // Logování všech HTTP požadavků
  app.use(requestLoggerMiddleware);
  
  // Logování autentifikačních událostí (po autentifikaci)
  app.use(authLoggerMiddleware);
}