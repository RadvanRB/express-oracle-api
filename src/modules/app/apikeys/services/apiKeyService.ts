import { AbstractService, DbErrorResponse } from "../../../../services/AbstractService";
import { ApiKey } from "../models/ApiKey";
import * as crypto from "crypto";
import logger from "../../../../utils/logger";

/**
 * Servisní třída pro správu API klíčů třetích stran
 */
class ApiKeyService extends AbstractService<ApiKey> {
  constructor() {
    super(ApiKey, "apiKeys", "id","main");
  }

  /**
   * Vygeneruje nový API klíč pro třetí stranu
   * @param name Název klíče
   * @param clientId ID klienta
   * @param roles Role přiřazené ke klíči
   * @param allowedIps Povolené IP adresy (volitelné)
   * @param expiresInDays Doba platnosti v dnech (volitelné)
   * @returns Informace o vygenerovaném klíči a samotný klíč
   */
  async generateApiKey(
    name: string,
    clientId: string,
    roles: string[],
    allowedIps?: string[],
    expiresInDays?: number
  ): Promise<{ apiKeyEntity: ApiKey | DbErrorResponse; apiKey: string }> {
    try {
      // Generování náhodného klíče
      const apiKey = crypto.randomBytes(32).toString("hex");
      
      // Vytvoření hashe klíče pro uložení do databáze
      const keyHash = this.hashApiKey(apiKey);
      
      // Nastavení expirace
      let expiresAt: Date | undefined;
      if (expiresInDays) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);
      }

      // Vytvoření záznamu v databázi
      const apiKeyData = {
        name,
        keyHash,
        clientId,
        roles,
        isActive: true,
        expiresAt,
        allowedIps
      };
      
      const apiKeyEntity = await this.createOne(apiKeyData);
      
      // Vrácíme entitu a vygenerovaný klíč
      return { apiKeyEntity, apiKey };
    } catch (error) {
      logger.error("Chyba při generování API klíče", { error, clientId, name });
      throw error;
    }
  }

  /**
   * Ověří, zda je API klíč platný a vrátí informace o klíči
   * @param apiKey API klíč k ověření
   * @returns Informace o klíči nebo null pokud je klíč neplatný
   */
  async validateApiKey(apiKey: string): Promise<ApiKey | null> {
    try {
      // Vytvoření hashe z API klíče
      const keyHash = this.hashApiKey(apiKey);
      
      // Vyhledání klíče v databázi podle hashe
      const apiKeyEntity = await this.repository.findOne({
        where: { 
          keyHash,
          isActive: true
        }
      });
      
      if (!apiKeyEntity) {
        return null;
      }
      
      // Kontrola expirace
      if (apiKeyEntity.expiresAt && new Date() > apiKeyEntity.expiresAt) {
        logger.warn("Pokus o použití expirovaného API klíče", { 
          apiKeyId: apiKeyEntity.id,
          clientId: apiKeyEntity.clientId
        });
        return null;
      }
      
      return apiKeyEntity;
    } catch (error) {
      logger.error("Chyba při ověřování API klíče", { error });
      return null;
    }
  }

  /**
   * Deaktivuje API klíč
   * @param id ID klíče
   * @returns true pokud se deaktivace povedla, jinak false
   */
  async deactivateApiKey(id: number): Promise<boolean> {
    try {
      const result = await this.update(id, { isActive: false });
      return !("error" in result);
    } catch (error) {
      logger.error("Chyba při deaktivaci API klíče", { error, id });
      return false;
    }
  }

  /**
   * Vytvoří hash z API klíče
   * @param apiKey API klíč
   * @returns Hash klíče
   */
  private hashApiKey(apiKey: string): string {
    return crypto
      .createHmac("sha256", process.env.API_KEY_SECRET || "default-secret")
      .update(apiKey)
      .digest("hex");
  }

  /**
   * Získá všechny API klíče pro daného klienta
   * @param clientId ID klienta
   * @returns Seznam API klíčů klienta
   */
  async getApiKeysByClientId(clientId: string): Promise<ApiKey[]> {
    try {
      return await this.repository.find({
        where: { clientId }
      });
    } catch (error) {
      logger.error("Chyba při získávání API klíčů klienta", { error, clientId });
      return [];
    }
  }
}

// Exportujeme třídu místo instance
export { ApiKeyService };

// Proměnná pro uchování instance služby
let _apiKeyServiceInstance: ApiKeyService | null = null;

/**
 * Funkce pro získání instance ApiKeyService
 * Instance se vytvoří až při prvním volání této funkce
 */
export function getApiKeyService(): ApiKeyService {
  if (!_apiKeyServiceInstance) {
    _apiKeyServiceInstance = new ApiKeyService();
  }
  return _apiKeyServiceInstance;
}