import { AbstractService, DbErrorResponse } from "../../../../services/AbstractService";
import { Permission, OperationType, EntityType } from "../models/Permission";
import { getRepository } from "typeorm";
import { Role } from "../../roles/models/Role";
import logger from "../../../../utils/logger";

/**
 * Servisní třída pro správu oprávnění
 */
class PermissionService extends AbstractService<Permission> {
  constructor() {
    super(Permission, "permissions", "id","main");
  }

  /**
   * Vytvoří nové oprávnění
   * @param entityName Název entity, ke které se oprávnění vztahuje
   * @param operation Typ operace (SELECT, INSERT, UPDATE, DELETE, EXECUTE)
   * @param entityType Typ entity (MODEL, PROCEDURE)
   * @param description Volitelný popis oprávnění
   * @param condition Volitelná podmínka pro filtrování záznamů
   */
  async createPermission(
    entityName: string,
    operation: OperationType,
    entityType: EntityType = EntityType.MODEL,
    description?: string,
    condition?: string
  ): Promise<Permission | DbErrorResponse> {
    const permission = {
      entityName,
      operation,
      entityType,
      description,
      condition,
      isActive: true
    };
    
    return this.createOne(permission);
  }

  /**
   * Přiřadí oprávnění k roli
   * @param permissionId ID oprávnění
   * @param roleId ID role
   */
  async assignPermissionToRole(permissionId: number, roleId: number): Promise<boolean> {
    try {
      const permissionRepository = getRepository(Permission);
      const roleRepository = getRepository(Role);
      
      const permission = await permissionRepository.findOne({ where: { id: permissionId } });
      const role = await roleRepository.findOne({ where: { id: roleId }, relations: ["permissions"] });
      
      if (!permission || !role) {
        return false;
      }
      
      if (!role.permissions) {
        role.permissions = [];
      }
      
      // Kontrola, zda již role nemá toto oprávnění
      const hasPermission = role.permissions.some(p => p.id === permissionId);
      if (hasPermission) {
        return true; // Oprávnění již existuje
      }
      
      // Přidání oprávnění
      role.permissions.push(permission);
      await roleRepository.save(role);
      
      return true;
    } catch (error) {
      logger.error("Chyba při přiřazování oprávnění k roli", { error, permissionId, roleId });
      return false;
    }
  }

  /**
   * Odebere oprávnění z role
   * @param permissionId ID oprávnění
   * @param roleId ID role
   */
  async removePermissionFromRole(permissionId: number, roleId: number): Promise<boolean> {
    try {
      const roleRepository = getRepository(Role);
      
      const role = await roleRepository.findOne({ where: { id: roleId }, relations: ["permissions"] });
      
      if (!role || !role.permissions) {
        return false;
      }
      
      // Filtrování oprávnění
      role.permissions = role.permissions.filter(p => p.id !== permissionId);
      
      await roleRepository.save(role);
      
      return true;
    } catch (error) {
      logger.error("Chyba při odebírání oprávnění z role", { error, permissionId, roleId });
      return false;
    }
  }

  /**
   * Najde všechna oprávnění pro danou entitu
   * @param entityName Název entity
   * @param entityType Typ entity (MODEL, PROCEDURE)
   */
  async findPermissionsByEntity(
    entityName: string,
    entityType: EntityType = EntityType.MODEL
  ): Promise<Permission[]> {
    try {
      return this.repository.find({
        where: {
          entityName,
          entityType
        }
      });
    } catch (error) {
      logger.error("Chyba při hledání oprávnění pro entitu", { error, entityName, entityType });
      return [];
    }
  }

  /**
   * Najde všechna oprávnění pro danou roli
   * @param roleId ID role
   */
  async findPermissionsByRole(roleId: number): Promise<Permission[]> {
    try {
      const roleRepository = getRepository(Role);
      
      const role = await roleRepository.findOne({ where: { id: roleId }, relations: ["permissions"] });
      
      if (!role || !role.permissions) {
        return [];
      }
      
      return role.permissions;
    } catch (error) {
      logger.error("Chyba při hledání oprávnění pro roli", { error, roleId });
      return [];
    }
  }
}

// Exportujeme třídu místo instance
export { PermissionService };

// Proměnná pro uchování instance služby
let _permissionServiceInstance: PermissionService | null = null;

/**
 * Funkce pro získání instance PermissionService
 * Instance se vytvoří až při prvním volání této funkce
 */
export function getPermissionService(): PermissionService {
  if (!_permissionServiceInstance) {
    _permissionServiceInstance = new PermissionService();
  }
  return _permissionServiceInstance;
}