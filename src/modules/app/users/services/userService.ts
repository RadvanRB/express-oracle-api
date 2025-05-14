// src/modules/app/users/services/userService.ts
import { AbstractService } from "../../../../services/AbstractService";
import { User } from "../models/User";

/**
 * Servisní třída pro správu uživatelů
 * Rozšiřuje AbstractService s explicitní konfigurací primárního klíče
 */
class UserService extends AbstractService<User> {
  constructor() {
    // Explicitně definujeme sloupec 'id' jako primární klíč
    // V případě potřeby lze snadno přejít na složený primární klíč
    super(User, "users", "id","main");
  }

  // Specifické metody pro UserService mohou být přidány zde
  // Například vyhledání uživatele podle emailu, ověření hesla atd.
}

// Exportujeme třídu místo instance
export { UserService };

// Proměnná pro uchování instance služby
let _userServiceInstance: UserService | null = null;

/**
 * Funkce pro získání instance UserService
 * Instance se vytvoří až při prvním volání této funkce
 */
export function getUserService(): UserService {
  if (!_userServiceInstance) {
    _userServiceInstance = new UserService();
  }
  return _userServiceInstance;
}