// src/services/userRoleService.ts
import { AbstractService, PrimaryKeyValue } from "./AbstractService";
import { UserRole } from "../models/UserRole";

/**
 * Servisní třída pro správu uživatelských rolí
 * Demonstrace použití AbstractService se složeným primárním klíčem
 */
class UserRoleService extends AbstractService<UserRole> {
  constructor() {
    // Definujeme složený primární klíč ['userId', 'roleId']
    super(UserRole, "userRole", ['userId', 'roleId']);
  }

  /**
   * Najde roli uživatele podle userId a roleId
   * Příklad využití složeného primárního klíče
   */
  async findUserRole(userId: number, roleId: number): Promise<UserRole | null> {
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
  async assignRole(userId: number, roleId: number, roleName: string, description?: string): Promise<UserRole> {
    const roleData = {
      userId,
      roleId,
      roleName,
      description,
      isActive: true
    };
    
    return this.createOne(roleData);
  }

  /**
   * Aktualizuje informace o roli uživatele
   */
  async updateUserRole(userId: number, roleId: number, data: Partial<UserRole>): Promise<UserRole> {
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
  async removeRole(userId: number, roleId: number): Promise<boolean> {
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
  async getUserRoles(userId: number): Promise<UserRole[]> {
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
      { isActive: false }
    );
  }
}

export const userRoleService = new UserRoleService();