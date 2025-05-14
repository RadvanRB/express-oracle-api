/**
 * Data pro vytvoření uživatele
 */
export interface CreateUserDto {
    /**
     * Jméno uživatele
     * @example "Jan"
     */
    firstName: string;
  
    /**
     * Příjmení uživatele
     * @example "Novák"
     */
    lastName: string;
  
    /**
     * Email uživatele
     * @format email
     * @example "jan.novak@example.com"
     */
    email: string;
  
    /**
     * Heslo uživatele
     * @minLength 8
     * @example "Password123!"
     */
    password: string;
  
    /**
     * Telefonní číslo uživatele
     * @pattern ^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$
     * @example "+420123456789"
     */
    phone?: string;
  
    /**
     * Adresa uživatele
     * @example "Pražská 123, Praha"
     */
    address?: string;
  
    /**
     * Je uživatel aktivní?
     * @default true
     * @example true
     */
    isActive: boolean;
  }
  
  /**
   * Data pro aktualizaci uživatele
   */
  export interface UpdateUserDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    isActive?: boolean;
  }
  
  /**
   * Detail uživatele
   */
  export interface UserDto {
    /**
     * ID uživatele
     * @example 1
     */
    id: number;
  
    /**
     * Jméno uživatele
     * @example "Jan"
     */
    firstName: string;
  
    /**
     * Příjmení uživatele
     * @example "Novák"
     */
    lastName: string;
  
    /**
     * Email uživatele
     * @format email
     * @example "jan.novak@example.com"
     */
    email: string;
  
    /**
     * Telefonní číslo uživatele
     * @example "+420123456789"
     */
    phone?: string;
  
    /**
     * Adresa uživatele
     * @example "Pražská 123, Praha"
     */
    address?: string;
  
    /**
     * Je uživatel aktivní?
     * @example true
     */
    isActive: boolean;
  
    /**
     * Datum vytvoření záznamu
     * @format date-time
     */
    createdAt: Date;
  
    /**
     * Datum poslední aktualizace záznamu
     * @format date-time
     */
    updatedAt?: Date;
  }