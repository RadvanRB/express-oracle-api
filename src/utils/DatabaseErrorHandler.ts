import { EntityTarget, QueryRunner } from "typeorm";
import { databaseManager } from "../config/databaseManager";
import { DatabaseConnectionName } from "../config/databaseConnections";
import { databaseErrorMailConfig,databaseErrorMaxRetries,databaseErrorRetryInterval } from "../config/databaseConnections";


// Rozhraní pro konfiguraci emailového notifikátoru
export interface EmailConfig {
  enabled: boolean;
  recipient: string;
  sender: string;
  subjectPrefix?: string;
}

// Typ pro uchovávání informací o chybách
type ErrorTracker = {
  [endpointKey: string]: {
    lastError: Date;
    emailSent: boolean;
    recoveredSince: Date | null;
  }
};

/**
 * Třída pro správu chyb databáze a notifikací
 * Zajišťuje logování chyb, odesílání emailů při výpadku a zotavení
 * a pokusí se o obnovení připojení při dočasném výpadku
 */
export class DatabaseErrorHandler {
  private static instance: DatabaseErrorHandler;
  private errorTracker: ErrorTracker = {};
  private emailConfig: EmailConfig = databaseErrorMailConfig;
  private maxRetries: number = databaseErrorMaxRetries;
  private retryInterval: number = databaseErrorRetryInterval; // ms
  
  private constructor() {
    // Výchozí konfigurace emailů - v produkci by se načítala z konfiguračního souboru
    // this.emailConfig = databaseErrorMailConfig;
  }

  // Singleton pattern
  public static getInstance(): DatabaseErrorHandler {
    if (!DatabaseErrorHandler.instance) {
      DatabaseErrorHandler.instance = new DatabaseErrorHandler();
    }
    return DatabaseErrorHandler.instance;
  }

  /**
   * Zkusí obnovit připojení k databázi po výpadku
   * @param connectionName Název databázového připojení
   * @returns Informace o úspěšnosti obnovy
   */
  public async tryRecoverConnection(connectionName?: DatabaseConnectionName): Promise<boolean> {
    const dataSource = databaseManager.getDataSource(connectionName);
    
    if (dataSource.isInitialized) {
      return true; // Připojení už funguje
    }

    // Pokus o obnovení připojení s několika opakováními
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`Pokus o obnovení připojení ${connectionName || 'výchozí'} (${attempt}/${this.maxRetries})...`);
        await databaseManager.initialize(connectionName);
        console.log(`Připojení ${connectionName || 'výchozí'} úspěšně obnoveno!`);
        return true;
      } catch (error) {
        console.error(`Pokus ${attempt} o obnovení připojení ${connectionName || 'výchozí'} selhal:`, error);
        
        if (attempt < this.maxRetries) {
          // Počkáme před dalším pokusem (exponenciální nárůst intervalu)
          const delay = this.retryInterval * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.error(`Všechny pokusy o obnovení připojení ${connectionName || 'výchozí'} selhaly.`);
    return false;
  }

  /**
   * Zpracuje chybu databáze, pokusí se obnovit připojení a odešle notifikaci
   * @param error Zachycená chyba
   * @param endpoint Název koncového bodu nebo operace
   * @param connectionName Název databázového připojení
   * @returns Informace o úspěšnosti obnovy
   */
  public async handleDatabaseError(
    error: any, 
    endpoint: string, 
    connectionName?: DatabaseConnectionName
  ): Promise<{ recovered: boolean; message: string }> {
    // Logování chyby
    console.error(`[${new Date().toISOString()}] Databázová chyba v ${endpoint}:`, error);

    // Inicializace sledování chyb pro tento endpoint, pokud ještě neexistuje
    if (!this.errorTracker[endpoint]) {
      this.errorTracker[endpoint] = {
        lastError: new Date(),
        emailSent: false,
        recoveredSince: null
      };
    }

    const tracker = this.errorTracker[endpoint];
    tracker.lastError = new Date();

    // Pokus o obnovení připojení
    const recovered = await this.tryRecoverConnection(connectionName);

    // Rozhodnutí o odeslání emailu
    let shouldSendEmail = this.emailConfig.enabled && !tracker.emailSent;

    // Aktualizace stavu obnovy
    if (recovered) {
      if (tracker.recoveredSince === null) {
        tracker.recoveredSince = new Date();
        // Reset příznaku odeslaného emailu pouze pokud došlo k úspěšné obnově
        tracker.emailSent = false;
      }
    } else {
      tracker.recoveredSince = null;
      
      // Pokud je povoleno odesílání emailů a ještě nebyl odeslán pro tento výpadek
      if (shouldSendEmail) {
        await this.sendErrorEmail(error, endpoint, connectionName);
        tracker.emailSent = true;
      }
    }

    // Příprava odpovědi
    const message = recovered 
      ? `Databázové připojení bylo obnoveno po dočasném výpadku.` 
      : `Databázové připojení je stále nedostupné. Prosím zkuste to později.`;

    return { recovered, message };
  }

  /**
   * Odešle e-mail o chybě databáze
   * Poznámka: Toto je zjednodušená implementace, v produkci by se použila
   * skutečná knihovna pro odesílání e-mailů (např. nodemailer)
   */
  private async sendErrorEmail(
    error: any, 
    endpoint: string, 
    connectionName?: DatabaseConnectionName
  ): Promise<void> {
    if (!this.emailConfig.enabled) {
      return;
    }

    try {
      const subject = `${this.emailConfig.subjectPrefix} Výpadek databáze ${connectionName || 'výchozí'} v ${endpoint}`;
      const body = `
        Čas: ${new Date().toISOString()}
        Endpoint: ${endpoint}
        Připojení: ${connectionName || 'výchozí'}
        Chyba: ${error.message || error}
        Stack trace: ${error.stack || 'Není k dispozici'}
      `;

      // V reálné implementaci by zde byl kód pro odeslání e-mailu pomocí správné knihovny
      console.log(`Odesílání e-mailu na ${this.emailConfig.recipient}`);
      console.log(`Předmět: ${subject}`);
      console.log(`Tělo: ${body}`);

      // Simulace odeslání emailu pro demonstrační účely
      console.log("Email o výpadku databáze odeslán administrátorovi.");
    } catch (emailError) {
      console.error("Chyba při odesílání e-mailu o výpadku databáze:", emailError);
    }
  }

  /**
   * Odešle e-mail o obnově databáze po výpadku
   */
  public async sendRecoveryEmail(
    endpoint: string, 
    connectionName?: DatabaseConnectionName
  ): Promise<void> {
    if (!this.emailConfig.enabled) {
      return;
    }

    try {
      const tracker = this.errorTracker[endpoint];
      if (!tracker || !tracker.recoveredSince) {
        return; // Žádná zaznamenaná obnova
      }

      const downTime = Math.floor((tracker.recoveredSince.getTime() - tracker.lastError.getTime()) / 1000);

      const subject = `${this.emailConfig.subjectPrefix} Obnova databáze ${connectionName || 'výchozí'} v ${endpoint}`;
      const body = `
        Databázové připojení ${connectionName || 'výchozí'} bylo obnoveno.
        Čas obnovy: ${tracker.recoveredSince.toISOString()}
        Endpoint: ${endpoint}
        Doba výpadku: ${downTime} sekund
      `;

      // V reálné implementaci by zde byl kód pro odeslání e-mailu pomocí správné knihovny
      console.log(`Odesílání e-mailu na ${this.emailConfig.recipient}`);
      console.log(`Předmět: ${subject}`);
      console.log(`Tělo: ${body}`);

      // Simulace odeslání emailu pro demonstrační účely
      console.log("Email o obnově databáze odeslán administrátorovi.");
    } catch (emailError) {
      console.error("Chyba při odesílání e-mailu o obnově databáze:", emailError);
    }
  }

  /**
   * Zaregistruje úspěšné provedení operace pro daný endpoint
   * Pokud byl předchozí pokus neúspěšný, odešle email o obnově
   */
  public async registerSuccessfulOperation(
    endpoint: string, 
    connectionName?: DatabaseConnectionName
  ): Promise<void> {
    const tracker = this.errorTracker[endpoint];
    if (!tracker) {
      return; // Žádná předchozí chyba nebyla zaznamenána
    }

    if (tracker.emailSent && tracker.recoveredSince) {
      // Byla odeslána notifikace o chybě a databáze byla obnovena
      await this.sendRecoveryEmail(endpoint, connectionName);
      // Reset stavu sledování po obnovení a odeslání e-mailu
      tracker.emailSent = false;
    }
  }

  /**
   * Pomocná metoda pro vyhodnocení, zda by měla být databázová operace obalena do nového QueryRunner
   * @param entity Cílová entita
   * @param connectionName Název databázového připojení
   * @returns QueryRunner nebo undefined, pokud není dostupný
   */
  public static async getQueryRunnerForOperation(
    entity: EntityTarget<any>,
    connectionName?: DatabaseConnectionName
  ): Promise<QueryRunner | undefined> {
    try {
      const dataSource = databaseManager.getDataSource(connectionName);
      if (!dataSource.isInitialized) {
        // Pokus o obnovení připojení
        const handler = DatabaseErrorHandler.getInstance();
        const recovered = await handler.tryRecoverConnection(connectionName);
        if (!recovered) {
          return undefined;
        }
      }
      return dataSource.createQueryRunner();
    } catch (error) {
      console.error("Nepodařilo se vytvořit QueryRunner:", error);
      return undefined;
    }
  }
}

// Export instance správce chyb
export const databaseErrorHandler = DatabaseErrorHandler.getInstance();