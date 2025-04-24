import { DataSource, ObjectLiteral, QueryRunner } from "typeorm";
import { AppDataSource } from "../config/database";

// Typ pro parametry procedury
export type ProcedureParam = {
  name: string;
  value: any;
  type?: string; // Oracle datový typ (nepovinné - automatická detekce)
  direction?: 'IN' | 'OUT' | 'IN OUT'; // Směr parametru (výchozí je 'IN')
};

// Typ pro výsledek procedury
export type ProcedureResult<T = any> = {
  success: boolean;
  outParams?: Record<string, any>; // OUT parametry
  resultSet?: T[]; // Výsledná data (pokud procedura vrací cursor)
  error?: Error;
};

export abstract class AbstractProcedureService {
  protected dataSource: DataSource;

  constructor() {
    this.dataSource = AppDataSource;
  }

  /**
   * Volá databázovou proceduru
   * @param procedureName Název procedury
   * @param params Parametry procedury
   * @returns Výsledek volání procedury
   */
  protected async callProcedure<T = any>(
    procedureName: string,
    params: ProcedureParam[] = []
  ): Promise<ProcedureResult<T>> {
    let queryRunner: QueryRunner | undefined;

    try {
      // Získání queryRunner a otevření připojení
      queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      
      // Příprava SQL pro volání procedury
      const { sql, bindParams, outParamIndices } = this.prepareProcedureCall(procedureName, params);
      
      // Volání procedury
      const result = await queryRunner.query(sql, bindParams);
      
      // Zpracování výsledku
      return this.processProcedureResult<T>(result, params, outParamIndices);
    } catch (error) {
      console.error(`Chyba při volání procedury ${procedureName}:`, error);
      return {
        success: false,
        error: error as Error
      };
    } finally {
      // Uvolnění spojení
      if (queryRunner) {
        await queryRunner.release();
      }
    }
  }

  /**
   * Volá databázovou funkci, která vrací hodnotu
   * @param functionName Název funkce
   * @param params Parametry funkce
   * @returns Výsledek volání funkce
   */
  protected async callFunction<T = any>(
    functionName: string,
    params: ProcedureParam[] = []
  ): Promise<T | null> {
    let queryRunner: QueryRunner | undefined;

    try {
      // Získání queryRunner a otevření připojení
      queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      
      // Příprava SQL pro volání funkce
      const { sql, bindParams } = this.prepareFunctionCall(functionName, params);
      
      // Volání funkce
      const result = await queryRunner.query(sql, bindParams);
      
      // Vrácení hodnoty (první řádek, první sloupec)
      if (result && result.length > 0) {
        // Získání prvního klíče prvního záznamu
        const firstKey = Object.keys(result[0])[0];
        return result[0][firstKey] as T;
      }
      
      return null;
    } catch (error) {
      console.error(`Chyba při volání funkce ${functionName}:`, error);
      return null;
    } finally {
      // Uvolnění spojení
      if (queryRunner) {
        await queryRunner.release();
      }
    }
  }

  /**
   * Připraví SQL dotaz a parametry pro volání procedury
   */
  private prepareProcedureCall(
    procedureName: string,
    params: ProcedureParam[]
  ): { sql: string; bindParams: any[]; outParamIndices: Record<string, number> } {
    const bindParams: any[] = [];
    const outParamIndices: Record<string, number> = {};
    
    // Vytvoření placeholderů pro parametry
    const placeholders = params.map((param, index) => {
      // Pro OUT a IN OUT parametry potřebujeme speciální syntaxi
      if (param.direction === 'OUT' || param.direction === 'IN OUT') {
        outParamIndices[param.name] = index;
        bindParams.push(param.value); // Hodnota pro IN OUT, null pro OUT
        return `:${index} ${param.direction || 'IN'}`;
      } else {
        bindParams.push(param.value);
        return `:${index}`;
      }
    });
    
    // Sestavení SQL dotazu
    const sql = `BEGIN ${procedureName}(${placeholders.join(', ')}); END;`;
    
    return { sql, bindParams, outParamIndices };
  }

  /**
   * Připraví SQL dotaz a parametry pro volání funkce
   */
  private prepareFunctionCall(
    functionName: string,
    params: ProcedureParam[]
  ): { sql: string; bindParams: any[] } {
    const bindParams: any[] = [];
    
    // Vytvoření placeholderů pro parametry
    const placeholders = params.map((param, index) => {
      bindParams.push(param.value);
      return `:${index}`;
    });
    
    // Sestavení SQL dotazu pro funkci - vracíme výsledek funkce
    const sql = `SELECT ${functionName}(${placeholders.join(', ')}) as result FROM DUAL`;
    
    return { sql, bindParams };
  }

  /**
   * Zpracuje výsledek volání procedury
   */
  private processProcedureResult<T>(
    result: any,
    params: ProcedureParam[],
    outParamIndices: Record<string, number>
  ): ProcedureResult<T> {
    // Základní objekt výsledku
    const procResult: ProcedureResult<T> = {
      success: true
    };
    
    // Zpracování OUT parametrů
    if (Object.keys(outParamIndices).length > 0) {
      procResult.outParams = {};
      
      for (const [paramName, index] of Object.entries(outParamIndices)) {
        // Extrakce hodnoty OUT parametru
        // Pro Oracle by tato logika mohla být složitější podle typu parametru
        procResult.outParams[paramName] = result?.[index];
      }
    }
    
    // Zpracování výsledné sady (pokud procedura vrací cursor)
    // Pro Oracle bude potřeba speciální zpracování REF CURSOR
    if (result && Array.isArray(result) && result.length > 0 && !outParamIndices[0]) {
      procResult.resultSet = result as T[];
    }
    
    return procResult;
  }
}