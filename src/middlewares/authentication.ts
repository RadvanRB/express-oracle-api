import * as express from "express";
import * as jwt from "jsonwebtoken";
import { Request } from "express";
import axios from "axios";
import NodeCache from "node-cache";
import logger from "../utils/logger";

// Cache pro ukládání veřejných klíčů Keycloaku (snížení počtu požadavků)
const keycloakPublicKeyCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

// Rozšíření interface pro Request o přidání user objektu
declare global {
  namespace Express {
    interface Request {
      user?: {
        username: string;
        roles: string[];
        email?: string;
        sub?: string;
        [key: string]: any;
      };
    }
  }
}

/**
 * Získá veřejný klíč z Keycloak serveru pro ověření JWT tokenů
 * @returns Veřejný klíč z Keycloaku
 */
async function getKeycloakPublicKey(): Promise<string> {
  const cachedKey = keycloakPublicKeyCache.get<string>("publicKey");
  if (cachedKey) {
    return cachedKey;
  }

  try {
    // Získání veřejného klíče z Keycloak - zde je potřeba upravit URL
    const keycloakUrl = process.env.KEYCLOAK_URL || "http://localhost:8080/auth";
    const realm = process.env.KEYCLOAK_REALM || "master";
    const response = await axios.get(
      `${keycloakUrl}/realms/${realm}/protocol/openid-connect/certs`
    );

    // Zpracování odpovědi - extrakce veřejného klíče
    // Pozn.: Formát odpovědi závisí na konfiguraci Keycloaku
    const publicKey = response.data.keys[0].x5c[0];
    
    // Uložení klíče do cache
    keycloakPublicKeyCache.set("publicKey", publicKey);
    return publicKey;
  } catch (error) {
    logger.error("Nepodařilo se získat Keycloak veřejný klíč", { error });
    throw new Error("Chyba při získávání veřejného klíče z Keycloaku");
  }
}

/**
 * Extrahuje JWT token z hlavičky požadavku
 * @param req Express požadavek
 * @returns JWT token nebo null, pokud token není přítomen
 */
function extractJwtToken(req: Request): string | null {
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    return req.headers.authorization.substring(7);
  }
  return null;
}

/**
 * Middleware pro ověření JWT tokenů a extrakci uživatelských informací
 * Pokud je token platný, přidá informace o uživateli do req.user
 */
export function jwtAuthMiddleware(req: Request, res: express.Response, next: express.NextFunction) {
  const token = extractJwtToken(req);
  if (!token) {
    return next(); // Pokračujeme bez autentifikace
  }

  try {
    // V případě vývojového prostředí můžeme použít mock token
    if (process.env.NODE_ENV === "development" && process.env.USE_MOCK_AUTH === "true") {
      // Mock uživatelský objekt pro vývojové účely
      req.user = {
        username: "dev.user",
        roles: ["admin", "user"],
        email: "dev@example.com",
        sub: "mock-subject-id"
      };
      return next();
    }

    // Dekódování tokenu bez ověření (pro přístup k hlavičce)
    const decoded: any = jwt.decode(token, { complete: true });
    if (!decoded) {
      logger.warn("Neplatný JWT token");
      return next();
    }

    // Ověření tokenu s použitím veřejného klíče z Keycloaku
    getKeycloakPublicKey().then((publicKey) => {
      jwt.verify(token, publicKey, { algorithms: ["RS256"] }, (err, decoded) => {
        if (err) {
          logger.warn("JWT token se nepodařilo ověřit", { error: err });
          return next();
        }

        // Extrakce informací o uživateli z tokenu
        const tokenPayload = decoded as any;
        req.user = {
          username: tokenPayload.preferred_username || tokenPayload.username,
          roles: tokenPayload.realm_access?.roles || [],
          email: tokenPayload.email,
          sub: tokenPayload.sub,
          // Další vlastnosti, které mohou být v tokenu...
        };

        next();
      });
    }).catch(error => {
      logger.error("Chyba při ověřování JWT tokenu", { error });
      next();
    });
  } catch (error) {
    logger.error("Chyba při zpracování JWT tokenu", { error });
    next();
  }
}

/**
 * Funkce pro autentifikaci používaná TSOA frameworkem
 * Ověřuje, zda má uživatel přístup na základě požadovaného zabezpečení
 */
export function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  if (securityName === "jwt") {
    return new Promise((resolve, reject) => {
      // Pokud není k dispozici user objekt, token chybí nebo je neplatný
      if (!request.user) {
        return reject(new Error("Chybí JWT token nebo je neplatný"));
      }
      
      // Pokud nejsou vyžadovány konkrétní scopes/role, autorizace proběhla úspěšně
      if (!scopes || scopes.length === 0) {
        return resolve(request.user);
      }
      
      // Kontrola, zda uživatel má požadované role
      const hasRequiredRoles = scopes.some(role => request.user?.roles.includes(role));
      if (!hasRequiredRoles) {
        return reject(new Error("Nemáte dostatečná oprávnění pro přístup k tomuto zdroji"));
      }
      
      resolve(request.user);
    });
  }

  return Promise.reject(new Error("Neznámý typ zabezpečení"));
}

/**
 * Middleware pro kontrolu, zda je uživatel přihlášen
 * Používá se jako prvotní vrstva zabezpečení pro endpointy
 */
export function requireAuth(req: Request, res: express.Response, next: express.NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Nepřihlášený uživatel" });
  }
  next();
}