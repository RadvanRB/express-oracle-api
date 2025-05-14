/**
 * Typy pro JWT tokeny, uživatele a autentifikaci třetích stran
 */

/**
 * Rozhraní pro JWT payload
 * Definuje strukturu payloadu JWT tokenu používaného mezi NextJS a Express API
 */
export interface JwtPayload {
  /**
   * Unikátní identifikátor uživatele (subject)
   */
  sub: string;
  
  /**
   * Uživatelské jméno z Active Directory
   */
  username: string;
  
  /**
   * Email uživatele (volitelné)
   */
  email?: string;
  
  /**
   * Seznam rolí uživatele
   * Používá se pro základní kontrolu přístupu
   */
  roles: string[];
  
  /**
   * Volitelné další atributy uživatele
   */
  attributes?: Record<string, any>;
  
  /**
   * Čas vydání tokenu (issued at)
   */
  iat: number;
  
  /**
   * Čas vypršení platnosti tokenu (expiration)
   */
  exp: number;
  
  /**
   * Vydavatel tokenu (issuer)
   */
  iss: string;
  
  /**
   * Příjemce tokenu (audience)
   */
  aud: string;
}

/**
 * Rozhraní pro data uživatele v req.user
 */
export interface AuthUser {
  /**
   * Unikátní identifikátor uživatele
   */
  id?: number;
  
  /**
   * Uživatelské jméno
   */
  username: string;
  
  /**
   * Email uživatele
   */
  email?: string;
  
  /**
   * Seznam rolí uživatele
   */
  roles: string[];
  
  /**
   * Unikátní identifikátor uživatele z externího systému (sub z JWT)
   */
  sub?: string;
  
  /**
   * Další vlastnosti uživatele
   */
  [key: string]: any;
}

/**
 * Rozhraní pro API klíč třetí strany
 */
export interface ApiKey {
  /**
   * Unikátní identifikátor API klíče
   */
  id: number;
  
  /**
   * Název klíče (popis pro snadnou identifikaci)
   */
  name: string;
  
  /**
   * Samotný klíč (hash)
   */
  keyHash: string;
  
  /**
   * ID klienta, kterému klíč patří
   */
  clientId: string;
  
  /**
   * Seznam rolí přiřazených ke klíči
   */
  roles: string[];
  
  /**
   * Příznak, zda je klíč aktivní
   */
  isActive: boolean;
  
  /**
   * Datum a čas vypršení platnosti klíče
   */
  expiresAt?: Date;
  
  /**
   * Datum a čas vytvoření klíče
   */
  createdAt: Date;
  
  /**
   * Datum a čas poslední aktualizace klíče
   */
  updatedAt?: Date;
  
  /**
   * IP adresy, ze kterých může být klíč použit (volitelné omezení)
   */
  allowedIps?: string[];
}

/**
 * Typ pro operace, které může uživatel provádět
 */
export type PermissionAction = 'select' | 'insert' | 'update' | 'delete' | 'execute';

/**
 * Typ entity, na kterou se oprávnění vztahuje
 */
export type EntityType = 'model' | 'procedure';

/**
 * Funkce pro kontrolu, zda má uživatel oprávnění k operaci
 */
export type PermissionChecker = (
  user: AuthUser,
  entityName: string,
  action: PermissionAction,
  entityType?: EntityType
) => Promise<boolean>;