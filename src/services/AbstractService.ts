// src/services/AbstractService.ts
import { 
    Repository, 
    SelectQueryBuilder, 
    EntityTarget, 
    Brackets,
    WhereExpressionBuilder,
    FindOptionsWhere,
    ObjectLiteral,
    DataSource,
    QueryRunner
  } from "typeorm";
  import { debugFilterLog } from "../utils/logger";
  import { databaseManager } from "../config/databaseManager";
  import {
    QueryOptions, 
    Filter, 
    LogicalFilter, 
    BaseFilter, 
    LogicalOperator, 
    ComparisonOperator, 
    SortDirection, 
    PaginatedResult 
  } from "../types/filters";
  import { 
    getEntityMetadata, 
    getAllColumnMetadata,
    EntityMetadata as DecoratorEntityMetadata,
    ColumnMetadata as DecoratorColumnMetadata
  } from "../utils/metadataDecorators";
  import { DatabaseConnectionName } from "../config/databaseConnections";
  import { databaseErrorHandler, DatabaseErrorHandler } from "../utils/DatabaseErrorHandler";
  import { EntityMetadata } from "../types/metadata";
  
  /**
   * Rozšířené rozhraní pro odpověď se zdrojovými informacemi
   */
  export interface SourceInfo {
    sql: string;
    sourceInfo?: DecoratorEntityMetadata['sourceInfo'];
    columnInfo?: Record<string, DecoratorColumnMetadata>;
  }

  /**
   * Typ pro konfiguraci primárních klíčů
   * Může být buď název jednoho sloupce (string) nebo pole názvů sloupců (pro složené primární klíče)
   */
  export type PrimaryKeyConfig = string | string[];
  
  /**
   * Typ pro hodnoty primárních klíčů
   * Pro jednoduchý primární klíč (jeden sloupec): jednoduchá hodnota
   * Pro složené primární klíče: objekt s páry klíč-hodnota
   */
  export type PrimaryKeyValue = string | number | Record<string, any>;

  /**
   * Rozhraní pro odpověď s informací o chybě databáze
   */
  export interface DbErrorResponse {
    success: false;
    message: string;
    error: string;
    recovered: boolean;
  }

  /**
   * Kontrola, zda odpověď obsahuje chybu databáze
   * @param result Výsledek operace
   */
  export function isDbErrorResponse(result: any): result is DbErrorResponse {
    return result && 
      typeof result === 'object' && 
      result.success === false && 
      'error' in result && 
      'recovered' in result;
  }
  
  export abstract class AbstractService<T extends ObjectLiteral> {
  protected repository: Repository<T>;
  protected entityName: string;
  protected primaryKeys: string[] = [];
  protected dataSource: DataSource;
  protected dataSourceName?: DatabaseConnectionName;
  protected entity: EntityTarget<T>;
  protected serviceEndpointPrefix: string;

  /**
   * Získá metadata entity
   * 
   * Vrací pouze sourceInfo a columnInfo metadata bez přístupu k databázi
   * @returns Objekt obsahující sourceInfo a columnInfo
   */
  async getMeta(): Promise<SourceInfo> {
    // Získání metadat entity a sloupců
    const entityMetadata = getEntityMetadata(this.entity);
    const columnMetadata = getAllColumnMetadata(this.entity);
    
    return {
      sql: "", // Prázdný SQL dotaz, protože nepřistupujeme k databázi
      sourceInfo: entityMetadata?.sourceInfo,
      columnInfo: columnMetadata
    };
  }
  
    /**
     * @param entity TypeORM entita
     * @param entityName Název entity pro použití v dotazech
     * @param primaryKeyConfig Volitelná konfigurace primárních klíčů - pokud není uvedena, 
     * pokusí se je získat z metadat entity
     * @param dataSourceName Název databázového připojení, které má být použito (volitelné)
     */
    constructor(
      entity: EntityTarget<T>, 
      entityName: string,
      primaryKeyConfig?: PrimaryKeyConfig,
      dataSourceName?: DatabaseConnectionName
    ) {
      this.entity = entity;
      this.dataSourceName = dataSourceName;
      this.dataSource = databaseManager.getDataSource(dataSourceName);
      this.repository = this.dataSource.getRepository(entity);
      this.entityName = entityName.toLowerCase();
      this.serviceEndpointPrefix = `${this.constructor.name}`;
      
      // Inicializace primárních klíčů
      if (primaryKeyConfig) {
        // Použití explicitně zadané konfigurace
        this.primaryKeys = Array.isArray(primaryKeyConfig) 
          ? primaryKeyConfig 
          : [primaryKeyConfig];
      } else {
        // Pokus o získání z metadat entity
        const primaryColumns = this.repository.metadata.primaryColumns;
        if (primaryColumns.length > 0) {
          this.primaryKeys = primaryColumns.map(column => column.propertyName);
        } else {
          // Fallback na 'id', pokud nejsou definovány primární klíče
          this.primaryKeys = ['id'];
          console.warn(`Žádné primární klíče nejsou definovány pro entitu ${entityName}, používám 'id' jako výchozí primární klíč`);
        }
      }
    }

    /**
     * Vytvoří endpointový identifikátor pro účely sledování chyb
     * @param method Název metody nebo operace
     * @param id Volitelný identifikátor objektu
     */
    protected getEndpointIdentifier(method: string, id?: PrimaryKeyValue): string {
      let idStr = '';
      if (id !== undefined) {
        idStr = typeof id === 'object' ? JSON.stringify(id) : id.toString();
      }
      return `${this.serviceEndpointPrefix}.${method}${idStr ? `(${idStr})` : ''}`;
    }

    /**
     * Wrapper pro zpracování databázových operací s podporou zotavení z výpadku
     * @param operation Funkce provádějící databázovou operaci
     * @param methodName Název metody pro identifikaci endpointu
     * @param id Volitelný identifikátor objektu
     */
    protected async executeDatabaseOperation<R>(
      operation: (queryRunner?: QueryRunner) => Promise<R>,
      methodName: string,
      id?: PrimaryKeyValue
    ): Promise<R | DbErrorResponse> {
      const endpoint = this.getEndpointIdentifier(methodName, id);
      
      try {
        // Pokus o získání QueryRunner pro transakci
        const queryRunner = await DatabaseErrorHandler.getQueryRunnerForOperation(
          this.entity, 
          this.dataSourceName
        );

        // Pokud se nepodaří získat QueryRunner, použijeme standardní operaci
        const result = await operation(queryRunner);
        
        // Zaregistrujeme úspěšnou operaci
        await databaseErrorHandler.registerSuccessfulOperation(endpoint, this.dataSourceName);
        
        return result;
      } catch (error) {
        // Zpracování chyby databáze
        const { recovered, message } = await databaseErrorHandler.handleDatabaseError(
          error,
          endpoint,
          this.dataSourceName
        );

        return {
          success: false,
          message,
          error: error instanceof Error ? error.message : String(error),
          recovered
        };
      }
    }
  
    /**
     * Najde všechny entity s podporou filtrování, řazení a stránkování
     * Vrací také zdrojový SQL dotaz pro debugging a audit
     */
    async findAll(queryOptions?: QueryOptions): Promise<PaginatedResult<T> | DbErrorResponse> {
      return this.executeDatabaseOperation(async () => {
        const { filter, sort, pagination } = queryOptions || {};
    
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 10;
        const skip = (page - 1) * limit;
    
        // Vytvoření QueryBuilder
        const queryBuilder = this.repository.createQueryBuilder(this.entityName);
    
        // Aplikace filtru
        if (filter) {
          this.applyFilterToQueryBuilder(queryBuilder, filter);
        }
    
        // Aplikace řazení
        if (sort && sort.length > 0) {
          for (const sortOption of sort) {
            queryBuilder.orderBy(`${this.entityName}.${sortOption.field}`, 
              sortOption.direction === SortDirection.ASC ? "ASC" : "DESC");
          }
        } else {
          // Výchozí řazení
          queryBuilder.orderBy(`${this.entityName}.createdAt`, "DESC");
        }
        
        // Získání SQL dotazu a metadat entity pro položku source
        const sqlQuery = queryBuilder.getSql();
        
        // Získání metadat entity a sloupců
        const entityMetadata = getEntityMetadata(this.entity);
        const columnMetadata = getAllColumnMetadata(this.entity);
        
        // Provedení dotazů
        const [data, total] = await Promise.all([
          queryBuilder.skip(skip).take(limit).getMany(),
          queryBuilder.getCount()
        ]);
    
        return {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          source: {
            sql: sqlQuery,
            sourceInfo: entityMetadata?.sourceInfo,
            columnInfo: columnMetadata
          }
        };
      }, 'findAll');
    }
  
    /**
     * Aplikuje filtr na QueryBuilder
     */
  /**
   * Aplikuje filtr na QueryBuilder
   * Komplexně zpracovává logické operátory a vnořené filtry
   */
  protected applyFilterToQueryBuilder(
        queryBuilder: WhereExpressionBuilder,
        filter: Filter, 
        paramPrefix: string = 'p'
      ): void {
      debugFilterLog('Applying filter:', filter);

      // Pro logický filtr (AND/OR)
      if ("operator" in filter && "filters" in filter) {
        const logicalFilter = filter as LogicalFilter;
        
        // Použijeme Brackets pro vytvoření skupiny podmínek s logickým operátorem
        queryBuilder.andWhere(new Brackets(qb => {
          const isAndOperator = logicalFilter.operator === LogicalOperator.AND;
          // Metoda, kterou budeme používat pro spojení podmínek (AND nebo OR)
          const whereMethod = isAndOperator ? 'andWhere' : 'orWhere';
          
          // Zpracování všech podfiltrů
          for (let i = 0; i < logicalFilter.filters.length; i++) {
            const subFilter = logicalFilter.filters[i];
            
            if ("field" in subFilter) {
              // Základní filtr (pole + operátor + hodnota)
              const baseFilter = subFilter as BaseFilter;
              const paramName = `${paramPrefix}_${i}`;
              
              // Získání SQL podmínky pro tento filtr
              const condition = this.getConditionForFilter(baseFilter, paramName);
              if (condition) {
                // Aplikace podmínky na QueryBuilder
                if (typeof condition.value === 'object' && condition.value !== null && !Array.isArray(condition.value)) {
                  // Pro složené podmínky (BETWEEN apod.)
                  qb[whereMethod](condition.sql, condition.value);
                } else {
                  // Pro jednoduché podmínky
                  qb[whereMethod](condition.sql, { [paramName]: condition.value });
                }
              }
            } else {
              // Vnořený logický filtr (AND/OR)
              // Použijeme Brackets pro oddělení vnořeného filtru
              qb[whereMethod](new Brackets(innerQb => {
                const nestedPrefix = `${paramPrefix}_${i}_`;
                // Rekurzivně zpracujeme vnořený filtr
                this.applyFilterToQueryBuilder(innerQb, subFilter, nestedPrefix);
              }));
            }
          }
        }));
      } else {
        // Pro základní filtr (není logický)
        const baseFilter = filter as BaseFilter;
        const paramName = `${paramPrefix}_0`;
        
        // Získání SQL podmínky
        const condition = this.getConditionForFilter(baseFilter, paramName);
        if (condition) {
          // Aplikace podmínky na QueryBuilder
          if (typeof condition.value === 'object' && condition.value !== null && !Array.isArray(condition.value)) {
            queryBuilder.andWhere(condition.sql, condition.value);
          } else {
            queryBuilder.andWhere(condition.sql, { [paramName]: condition.value });
          }
        }
      }
    }
  
    /**
     * Vytvoří SQL podmínku pro základní filtr
     */
    protected getConditionForFilter(filter: BaseFilter, paramName: string): { sql: string, value: any } | null {
      const { field, operator, value } = filter;
      
      switch (operator) {
        case ComparisonOperator.EQ:
          return { sql: `${this.entityName}.${field} = :${paramName}`, value };
        case ComparisonOperator.NE:
          return { sql: `${this.entityName}.${field} != :${paramName}`, value };
        case ComparisonOperator.GT:
          return { sql: `${this.entityName}.${field} > :${paramName}`, value };
        case ComparisonOperator.GTE:
          return { sql: `${this.entityName}.${field} >= :${paramName}`, value };
        case ComparisonOperator.LT:
          return { sql: `${this.entityName}.${field} < :${paramName}`, value };
        case ComparisonOperator.LTE:
          return { sql: `${this.entityName}.${field} <= :${paramName}`, value };
        case ComparisonOperator.LIKE:
          return { sql: `${this.entityName}.${field} LIKE :${paramName}`, value: `%${value}%` };
        case ComparisonOperator.ILIKE:
          return { sql: `UPPER(${this.entityName}.${field}) LIKE UPPER(:${paramName})`, value: `%${value}%` };
        case ComparisonOperator.IN:
          return { sql: `${this.entityName}.${field} IN (:...${paramName})`, value };
        case ComparisonOperator.NOT_IN:
          return { sql: `${this.entityName}.${field} NOT IN (:...${paramName})`, value };
        case ComparisonOperator.IS_NULL:
          return { sql: `${this.entityName}.${field} IS NULL`, value: null };
        case ComparisonOperator.IS_NOT_NULL:
          return { sql: `${this.entityName}.${field} IS NOT NULL`, value: null };
        
        // Datumové operátory
        case ComparisonOperator.DATE_EQUALS: {
          const startDate = new Date(value);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(value);
          endDate.setHours(23, 59, 59, 999);
          return { 
            sql: `${this.entityName}.${field} BETWEEN :${paramName}_start AND :${paramName}_end`,
            value: { [`${paramName}_start`]: startDate, [`${paramName}_end`]: endDate }
          };
        }
        case ComparisonOperator.DATE_NOT_EQUALS: {
          const startDate = new Date(value);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(value);
          endDate.setHours(23, 59, 59, 999);
          return { 
            sql: `${this.entityName}.${field} NOT BETWEEN :${paramName}_start AND :${paramName}_end`,
            value: { [`${paramName}_start`]: startDate, [`${paramName}_end`]: endDate }
          };
        }
        case ComparisonOperator.DATE_BEFORE:
          return { sql: `${this.entityName}.${field} < :${paramName}`, value };
        case ComparisonOperator.DATE_AFTER:
          return { sql: `${this.entityName}.${field} > :${paramName}`, value };
        case ComparisonOperator.DATE_BETWEEN:
          return { 
            sql: `${this.entityName}.${field} BETWEEN :${paramName}_start AND :${paramName}_end`,
            value: { [`${paramName}_start`]: value.start, [`${paramName}_end`]: value.end }
          };
        case ComparisonOperator.DATE_NOT_BETWEEN:
          return { 
            sql: `${this.entityName}.${field} NOT BETWEEN :${paramName}_start AND :${paramName}_end`,
            value: { [`${paramName}_start`]: value.start, [`${paramName}_end`]: value.end }
          };
        
        // Přidejte další operátory podle potřeby
        
        default:
          return null;
      }
    }
  
    /**
     * Vytvoří where podmínku pro primární klíč
     * @param primaryKeyValue Hodnota primárního klíče (jednoduchá hodnota nebo objekt pro složené klíče)
     * @returns Where podmínka pro TypeORM
     */
    protected createPrimaryKeyCondition(primaryKeyValue: PrimaryKeyValue): FindOptionsWhere<T> {
      if (this.primaryKeys.length === 1 && (typeof primaryKeyValue === 'string' || typeof primaryKeyValue === 'number')) {
        // Pro jednoduchý primární klíč a jednoduchou hodnotu
        return { [this.primaryKeys[0]]: primaryKeyValue } as FindOptionsWhere<T>;
      } else if (typeof primaryKeyValue === 'object' && !Array.isArray(primaryKeyValue)) {
        // Pro složené primární klíče jako objekt
        // Ověříme, že objekt obsahuje všechny potřebné klíče
        for (const key of this.primaryKeys) {
          if (primaryKeyValue[key] === undefined) {
            throw new Error(`Missing primary key ${key} in condition object`);
          }
        }
        return primaryKeyValue as FindOptionsWhere<T>;
      } else {
        throw new Error(`Invalid primary key value. Expected ${this.primaryKeys.length > 1 
          ? 'an object with keys: ' + this.primaryKeys.join(', ') 
          : 'a single value for key: ' + this.primaryKeys[0]}`);
      }
    }
  
    // Metody pro CRUD operace, které lze použít v odvozených třídách
    
    /**
     * Najde entitu podle primárního klíče
     * @param id Jednoduchá hodnota pro jednoduchý primární klíč nebo objekt pro složené primární klíče
     */
    async findByPrimaryKey(id: PrimaryKeyValue): Promise<(T & { source?: SourceInfo }) | null | DbErrorResponse> {
      return this.executeDatabaseOperation(async () => {
        const condition = this.createPrimaryKeyCondition(id);
        const result = await this.repository.findOneBy(condition);
        
        if (result) {
          // Získání metadat entity a sloupců
          const entityMetadata = getEntityMetadata(this.entity);
          const columnMetadata = getAllColumnMetadata(this.entity);
          
          // Pokud existují, přidáme metadata do výsledku
          if (entityMetadata?.sourceInfo || Object.keys(columnMetadata).length > 0) {
            // Vytvoření SQL dotazu pro debugging a audit
            const queryBuilder = this.repository.createQueryBuilder(this.entityName);
            for (const key in condition) {
              queryBuilder.andWhere(`${this.entityName}.${key} = :${key}`, { [key]: (condition as any)[key] });
            }
            const sqlQuery = queryBuilder.getSql();
            
            // Přidání source informací do výsledku
            (result as any).source = {
              sql: sqlQuery,
              sourceInfo: entityMetadata?.sourceInfo,
              columnInfo: columnMetadata
            };
          }
        }
        
        return result;
      }, 'findByPrimaryKey', id);
    }
    
    /**
     * Alias pro findByPrimaryKey, pro zpětnou kompatibilitu
     * @deprecated Použijte findByPrimaryKey
     */
    async findById(id: number): Promise<T | null | DbErrorResponse> {
      return this.findByPrimaryKey(id);
    }
  
    // Pro jednu entitu
    async createOne(data: any): Promise<T | DbErrorResponse> {
      return this.executeDatabaseOperation(async (queryRunner) => {
        if (queryRunner) {
          await queryRunner.connect();
          await queryRunner.startTransaction();
          
          try {
            const entity = this.repository.create(data);
            const result = await queryRunner.manager.save(entity);
            
            await queryRunner.commitTransaction();
            // Zkontrolujeme, zda je výsledek pole, a pokud ano, vrátíme první prvek
            return (Array.isArray(result) ? result[0] : result) as T;
          } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
          } finally {
            await queryRunner.release();
          }
        } else {
          // Fallback, pokud není dostupný QueryRunner
          const entity = this.repository.create(data);
          const result = await this.repository.save(entity);
          return (Array.isArray(result) ? result[0] : result) as T;
        }
      }, 'createOne');
    }

    // Pro více entit
    async createMany(dataArray: any[]): Promise<T[] | DbErrorResponse> {
      return this.executeDatabaseOperation(async (queryRunner) => {
        if (queryRunner) {
          await queryRunner.connect();
          await queryRunner.startTransaction();
          
          try {
            const entities = this.repository.create(dataArray);
            const result = await queryRunner.manager.save(entities);
            
            await queryRunner.commitTransaction();
            return result as T[];
          } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
          } finally {
            await queryRunner.release();
          }
        } else {
          // Fallback, pokud není dostupný QueryRunner
          const entities = this.repository.create(dataArray);
          return this.repository.save(entities) as Promise<T[]>;
        }
      }, 'createMany');
    }

    // Alias pro zpětnou kompatibilitu
    async create(data: any): Promise<T | DbErrorResponse> {
        return this.createOne(data);
    }
  
    /**
     * Aktualizuje entitu podle primárního klíče
     * @param id Hodnota primárního klíče (jednoduchá hodnota nebo objekt pro složené klíče)
     * @param data Data pro aktualizaci
     */
    async update(id: PrimaryKeyValue, data: any): Promise<T | DbErrorResponse> {
      return this.executeDatabaseOperation(async (queryRunner) => {
        const condition = this.createPrimaryKeyCondition(id);
        
        if (queryRunner) {
          await queryRunner.connect();
          await queryRunner.startTransaction();
          
          try {
            const entity = await queryRunner.manager.findOneBy(
              this.repository.target, 
              condition
            );
            
            if (!entity) {
              const keyDescription = typeof id === 'object' 
                ? JSON.stringify(id) 
                : id.toString();
              throw new Error(`Entita s primárním klíčem ${keyDescription} nebyla nalezena`);
            }
            
            queryRunner.manager.merge(this.repository.target, entity, data);
            const result = await queryRunner.manager.save(entity);
            
            await queryRunner.commitTransaction();
            return result;
          } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
          } finally {
            await queryRunner.release();
          }
        } else {
          // Fallback, pokud není dostupný QueryRunner
          const entity = await this.repository.findOneBy(condition);
          
          if (!entity) {
            const keyDescription = typeof id === 'object' 
              ? JSON.stringify(id) 
              : id.toString();
            throw new Error(`Entita s primárním klíčem ${keyDescription} nebyla nalezena`);
          }
          
          this.repository.merge(entity, data);
          return this.repository.save(entity);
        }
      }, 'update', id);
    }
  
    /**
     * Smaže entitu podle primárního klíče
     * @param id Hodnota primárního klíče (jednoduchá hodnota nebo objekt pro složené klíče)
     */
    async delete(id: PrimaryKeyValue): Promise<boolean | DbErrorResponse> {
      return this.executeDatabaseOperation(async (queryRunner) => {
        if (this.primaryKeys.length === 1 && (typeof id === 'string' || typeof id === 'number')) {
          // Pro jednoduchý primární klíč
          if (queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
            
            try {
              const result = await queryRunner.manager.delete(
                this.repository.target, 
                id
              );
              
              await queryRunner.commitTransaction();
              return result.affected !== undefined && result.affected !== null && result.affected > 0;
            } catch (error) {
              await queryRunner.rollbackTransaction();
              throw error;
            } finally {
              await queryRunner.release();
            }
          } else {
            // Fallback, pokud není dostupný QueryRunner
            const result = await this.repository.delete(id);
            return result.affected !== undefined && result.affected !== null && result.affected > 0;
          }
        } else {
          // Pro složené primární klíče
          const findResult = await this.findByPrimaryKey(id);
          
          // Kontrola, zda je výsledek chyba
          if (isDbErrorResponse(findResult)) {
            throw new Error(findResult.message);
          }
          
          const entity = findResult;
          if (!entity) return false;
          
          if (queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
            
            try {
              await queryRunner.manager.remove(entity);
              
              await queryRunner.commitTransaction();
              return true;
            } catch (error) {
              await queryRunner.rollbackTransaction();
              throw error;
            } finally {
              await queryRunner.release();
            }
          } else {
            // Fallback, pokud není dostupný QueryRunner
            await this.repository.remove(entity);
            return true;
          }
        }
      }, 'delete', id);
    }
  }