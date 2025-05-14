// src/modules/app/userrole/services/userRoleService.ts
import { AbstractService, PrimaryKeyValue, isDbErrorResponse, DbErrorResponse } from "../../../../services/AbstractService";
import { UserRole } from "../models/UserRole";

/**
 * Servisní třída pro správu uživatelských rolí
 * Demonstrace použití AbstractService se složeným primárním klíčem
 */
class UserRoleService extends AbstractService<UserRole> {
  constructor() {
    // Definujeme složený primární klíč ['userId', 'roleId']
    super(UserRole, "userRole", ['userId', 'roleId'],"main");
  }

  /**
   * Najde roli uživatele podle userId a roleId
   * Příklad využití složeného primárního klíče
   */
  async findUserRole(userId: number, roleId: number): Promise<UserRole | DbErrorResponse | null> {
    // Vytvoření objektu pro složený primární klíč
    const compositeKey: PrimaryKeyValue = {
      userId,
      roleId
    };
    
    // Použití generické metody findByPrimaryKey se složeným klíčem
    return this.findByPrimaryKey(compositeKey);
  }

  /**
   * Přiřadí roli uživateli
   */
  async assignRole(userId: number, roleId: number, roleName: string, description?: string): Promise<UserRole | DbErrorResponse> {
    const roleData = {
      userId,
      roleId,
      roleName,
      description,
      isActive: 1
    };
    
    return this.createOne(roleData);
  }

  /**
   * Aktualizuje informace o roli uživatele
   */
  async updateUserRole(userId: number, roleId: number, data: Partial<UserRole>): Promise<UserRole | DbErrorResponse> {
    // Vytvoření objektu pro složený primární klíč
    const compositeKey: PrimaryKeyValue = {
      userId,
      roleId
    };
    
    // Použití metody update se složeným klíčem
    return this.update(compositeKey, data);
  }

  /**
   * Odebere roli uživateli
   */
  async removeRole(userId: number, roleId: number): Promise<boolean | DbErrorResponse> {
    // Vytvoření objektu pro složený primární klíč
    const compositeKey: PrimaryKeyValue = {
      userId,
      roleId
    };
    
    // Použití metody delete se složeným klíčem
    return this.delete(compositeKey);
  }
  
  /**
   * Získá všechny role pro konkrétního uživatele
   */
  async getUserRoles(userId: number): Promise<UserRole[] | DbErrorResponse> {
    // Vytvoření QueryBuilder pro zúžený dotaz
    const queryBuilder = this.repository.createQueryBuilder(this.entityName)
      .where(`${this.entityName}.userId = :userId`, { userId });
      
    return queryBuilder.getMany();
  }
  
  /**
   * Deaktivuje všechny role uživatele
   */
  async deactivateUserRoles(userId: number): Promise<void> {
    // Ukázka hromadné aktualizace
    await this.repository.update(
      { userId },
      { isActive: 0 }
    );
  }
}

// Exportujeme třídu místo instance
export { UserRoleService };

// Proměnná pro uchování instance služby
let _userRoleServiceInstance: UserRoleService | null = null;

/**
 * Funkce pro získání instance UserRoleService
 * Instance se vytvoří až při prvním volání této funkce
 */
export function getUserRoleService(): UserRoleService {
  if (!_userRoleServiceInstance) {
    _userRoleServiceInstance = new UserRoleService();
  }
  return _userRoleServiceInstance;
}