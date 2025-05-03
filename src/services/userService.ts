// src/services/userService.ts
import { AbstractService } from "./AbstractService";
import { User } from "../models/User";

/**
 * Servisní třída pro správu uživatelů
 * Rozšiřuje AbstractService s explicitní konfigurací primárního klíče
 */
class UserService extends AbstractService<User> {
  constructor() {
    // Explicitně definujeme sloupec 'id' jako primární klíč
    // V případě potřeby lze snadno přejít na složený primární klíč
    super(User, "user", "id");
  }

  // Specifické metody pro UserService mohou být přidány zde
  // Například vyhledání uživatele podle emailu, ověření hesla atd.
}

export const userService = new UserService();