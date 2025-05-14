import { Request, Response, NextFunction } from "express";
import { getApiKeyService } from "../modules/app/apikeys/services/apiKeyService";
import logger from "../utils/logger";

/**
 * Middleware pro autentifikaci pomocí API klíčů
 * Umožňuje třetím stranám přístup k API bez použití JWT tokenů
 */
export function apiKeyAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  // Název hlavičky s API klíčem (např. "X-API-Key")
  const apiKeyHeader = process.env.API_KEY_HEADER?.toLowerCase() || "x-api-key";
  
  // Získání API klíče z hlavičky
  const apiKey = req.headers[apiKeyHeader] as string;
  
  if (!apiKey) {
    // Pokud API klíč není přítomen, pokračujeme dál (zkusí se JWT autentifikace)
    return next();
  }

  // Ověření API klíče
  const apiKeyService = getApiKeyService();
  
  apiKeyService
    .validateApiKey(apiKey)
    .then((apiKeyEntity) => {
      if (!apiKeyEntity) {
        // Pokud API klíč není platný, pokračujeme bez autentifikace
        logger.warn("Neplatný API klíč", { apiKey: apiKey.substring(0, 8) + "..." });
        return next();
      }

      // Kontrola IP adresy, pokud je potřeba
      if (apiKeyEntity.allowedIps && apiKeyEntity.allowedIps.length > 0) {
        const clientIp = req.ip || req.connection.remoteAddress;
        
        if (!apiKeyEntity.allowedIps.includes(clientIp as string)) {
          logger.warn("Pokus o přístup s API klíčem z nepovolené IP adresy", {
            apiKeyId: apiKeyEntity.id,
            clientId: apiKeyEntity.clientId,
            ip: clientIp
          });
          
          return res.status(401).json({
            message: "Přístup s tímto API klíčem není povolen z vaší IP adresy"
          });
        }
      }

      // Přidání informací o klientovi do req.user
      req.user = {
        // Prefix, aby bylo jasné, že jde o API klíč
        username: `api-client-${apiKeyEntity.clientId}`,
        
        // Role přiřazené k API klíči
        roles: apiKeyEntity.roles,
        
        // Příznak, že jde o autentifikaci pomocí API klíče
        isApiClient: true,
        
        // ID klienta
        clientId: apiKeyEntity.clientId,
        
        // Další užitečné informace
        apiKeyId: apiKeyEntity.id,
        apiKeyName: apiKeyEntity.name
      };

      // Logování úspěšné autentifikace
      logger.debug("Úspěšná autentifikace pomocí API klíče", {
        clientId: apiKeyEntity.clientId,
        apiKeyId: apiKeyEntity.id
      });

      // Pokračování zpracování požadavku
      next();
    })
    .catch((error) => {
      // Chyba při ověřování API klíče
      logger.error("Chyba při ověřování API klíče", { error });
      next();
    });
}

/**
 * Middleware pro kontrolu, zda je klient autentifikován pomocí API klíče
 * Použití: pro endpointy, které mohou používat pouze třetí strany s API klíčem
 */
export function requireApiClient(req: Request, res: Response, next: NextFunction) {
  if (!req.user || !req.user.isApiClient) {
    return res.status(401).json({
      message: "Tento endpoint vyžaduje autentifikaci pomocí API klíče"
    });
  }
  
  next();
}

/**
 * Funkce pro integraci všech autentifikačních middlewarů v Express aplikaci
 * @param app Express aplikace
 */
export function setupAuthentication(app: any) {
  // Pořadí middlewarů je důležité - zkusí se postupně všechny autentifikační metody
  
  // 1. Autentifikace pomocí API klíčů (pro třetí strany)
  app.use(apiKeyAuthMiddleware);
  
  // 2. Autentifikace pomocí JWT tokenů (pro frontend aplikaci)
  app.use(require("./authentication").jwtAuthMiddleware);
  
  // Přidání dalších middlewarů podle potřeby
}