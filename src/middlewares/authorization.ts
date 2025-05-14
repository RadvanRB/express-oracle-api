import { Request, Response, NextFunction } from "express";
import { getPermissionService } from "../modules/app/permissions/services/permissionService";
import { OperationType, EntityType } from "../modules/app/permissions/models/Permission";
import logger from "../utils/logger";

/**
 * Middleware pro kontrolu oprávnění k operaci na entitě
 * Zajišťuje, že přihlášený uživatel má potřebné oprávnění pro danou operaci
 * @param entityName Název entity, ke které se přistupuje
 * @param operation Typ operace (SELECT, INSERT, UPDATE, DELETE, EXECUTE)
 * @param entityType Typ entity (MODEL, PROCEDURE)
 */
export function requirePermission(
  entityName: string,
  operation: OperationType,
  entityType: EntityType = EntityType.MODEL
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Pokud uživatel není přihlášen, nemá oprávnění
    if (!req.user) {
      return res.status(401).json({
        message: "Nepřihlášený uživatel nemá oprávnění k této operaci"
      });
    }

    try {
      // Získání uživatelských rolí z req.user
      const userRoles = req.user.roles || [];
      
      // Pokud má uživatel roli 'admin', má automaticky přístup ke všemu
      if (userRoles.includes("admin")) {
        return next();
      }
      
      // V případě vývojového prostředí můžeme kontrolu přeskočit
      if (process.env.NODE_ENV === "development" && process.env.SKIP_PERMISSION_CHECK === "true") {
        return next();
      }

      // Kontrola oprávnění pro každou roli uživatele
      const permissionService = getPermissionService();
      const hasPermission = await checkUserHasPermission(
        permissionService,
        userRoles,
        entityName,
        operation,
        entityType,
        req
      );

      if (hasPermission) {
        return next();
      }

      // Uživatel nemá potřebné oprávnění
      return res.status(403).json({
        message: "Nemáte oprávnění k provedení této operace"
      });
    } catch (error) {
      logger.error("Chyba při kontrole oprávnění", { error, entityName, operation });
      return res.status(500).json({
        message: "Došlo k chybě při ověřování oprávnění"
      });
    }
  };
}

/**
 * Kontroluje, zda má uživatel s danými rolemi oprávnění k operaci
 * @param permissionService Služba pro práci s oprávněními
 * @param userRoles Role uživatele
 * @param entityName Název entity
 * @param operation Typ operace
 * @param entityType Typ entity
 * @param req HTTP požadavek (pro vyhodnocení podmínek)
 */
async function checkUserHasPermission(
  permissionService: any,
  userRoles: string[],
  entityName: string,
  operation: OperationType,
  entityType: EntityType,
  req: Request
): Promise<boolean> {
  try {
    // Pro každou roli uživatele získáme oprávnění
    for (const roleCode of userRoles) {
      // Získání role podle kódu
      const role = await findRoleByCode(roleCode);
      if (!role) continue;

      // Získání oprávnění pro roli
      const permissions = await permissionService.findPermissionsByRole(role.id);
      
      // Kontrola, zda má role oprávnění pro danou operaci na dané entitě
      const permission = permissions.find((p: any) =>
        p.entityName === entityName && 
        p.operation === operation && 
        p.entityType === entityType &&
        p.isActive
      );
      
      if (permission) {
        // Pokud má oprávnění podmínku, vyhodnotíme ji
        if (permission.condition) {
          const conditionMet = evaluateCondition(permission.condition, req);
          if (conditionMet) {
            return true;
          }
          // Podmínka nesplněna, pokračujeme na další roli
          continue;
        }
        
        // Oprávnění bez podmínky = přístup povolen
        return true;
      }
    }
    
    // Žádná role nemá požadované oprávnění
    return false;
  } catch (error) {
    logger.error("Chyba při kontrole uživatelského oprávnění", { error });
    return false;
  }
}

/**
 * Najde roli podle kódu
 * Tato implementace musí být nahrazena skutečným voláním do služby pro správu rolí
 */
async function findRoleByCode(roleCode: string): Promise<any> {
  // TODO: Implementovat získání role ze služby
  // Zde by mělo být volání do RoleService
  // Pro tento příklad vrátíme mock data
  
  if (roleCode === "admin") {
    return { id: 1, code: "admin", name: "Administrátor" };
  } else if (roleCode === "user") {
    return { id: 2, code: "user", name: "Běžný uživatel" };
  } else if (roleCode === "editor") {
    return { id: 3, code: "editor", name: "Editor" };
  }
  
  return null;
}

/**
 * Vyhodnotí podmínku oprávnění
 * @param condition Podmínka ve formátu SQL-like výrazu
 * @param req HTTP požadavek
 */
function evaluateCondition(condition: string, req: Request): boolean {
  // Zde by měla být sofistikovanější implementace vyhodnocení podmínky
  // Pro tento příklad podporujeme pouze jednoduché podmínky s userId
  
  try {
    // Příklad: "userId = :userId"
    if (condition.includes("userId = :userId")) {
      const requestedUserId = parseInt(req.params.userId || req.query.userId as string);
      const loggedUserId = req.user?.id;
      
      if (!isNaN(requestedUserId) && loggedUserId === requestedUserId) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    logger.error("Chyba při vyhodnocení podmínky oprávnění", { error, condition });
    return false;
  }
}

/**
 * Middleware pro kontrolu, zda má uživatel jednu z požadovaných rolí
 * @param roles Pole rolí, ze kterých stačí mít jednu pro povolení přístupu
 */
export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Pokud uživatel není přihlášen, nemá oprávnění
    if (!req.user) {
      return res.status(401).json({ message: "Nepřihlášený uživatel" });
    }
    
    // Získání uživatelských rolí
    const userRoles = req.user.roles || [];
    
    // Kontrola, zda uživatel má alespoň jednu z požadovaných rolí
    const hasRequiredRole = roles.some(role => userRoles.includes(role));
    
    if (hasRequiredRole) {
      return next();
    }
    
    // Uživatel nemá požadovanou roli
    return res.status(403).json({
      message: "Nemáte dostatečná oprávnění pro přístup k tomuto zdroji"
    });
  };
}