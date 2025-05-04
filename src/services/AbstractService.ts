// src/services/AbstractService.ts
import { 
    Repository, 
    SelectQueryBuilder, 
    EntityTarget, 
    Brackets,
    WhereExpressionBuilder,
    FindOptionsWhere,
    ObjectLiteral,
    DataSource
  } from "typeorm";
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
  import { DatabaseConnectionName } from "../config/databaseConnections";
  
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
  
  export abstract class AbstractService<T extends ObjectLiteral> {
    protected repository: Repository<T>;
    protected entityName: string;
    protected primaryKeys: string[] = [];
    protected dataSource: DataSource;
  
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
      this.dataSource = databaseManager.getDataSource(dataSourceName);
      this.repository = this.dataSource.getRepository(entity);
      this.entityName = entityName.toLowerCase();
      
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
          console.warn(`No primary keys defined for entity ${entityName}, using 'id' as default primary key`);
        }
      }
    }
  
    /**
     * Najde všechny entity s podporou filtrování, řazení a stránkování
     */
    async findAll(queryOptions?: QueryOptions): Promise<PaginatedResult<T>> {
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
      };
    }
  
    /**
     * Aplikuje filtr na QueryBuilder
     */
    protected applyFilterToQueryBuilder(
        queryBuilder: WhereExpressionBuilder,
        filter: Filter, 
        paramPrefix: string = 'p'
      ): void {
      // Pro logický filtr (AND/OR)
      if ("operator" in filter && "filters" in filter) {
        const logicalFilter = filter as LogicalFilter;
        
        // Pro každý podfiltr vytvoříme podmínku
        const conditions: string[] = [];
        const parameters: Record<string, any> = {};
        let paramCounter = 0;
        
        // Zpracování všech podfiltrů
        for (const subFilter of logicalFilter.filters) {
          if ("field" in subFilter) {
            // Pro základní filtr
            const baseFilter = subFilter as BaseFilter;
            const paramName = `${paramPrefix}${paramCounter++}`;
            
            const condition = this.getConditionForFilter(baseFilter, paramName);
            if (condition) {
              conditions.push(condition.sql);
              
              // Pro BETWEEN a další složené podmínky
              if (typeof condition.value === 'object' && condition.value !== null && !Array.isArray(condition.value)) {
                Object.assign(parameters, condition.value);
              } else {
                parameters[paramName] = condition.value;
              }
            }
          } else {
            // Pro vnořený logický filtr
            const subPrefix = `${paramPrefix}${paramCounter++}_`;
            
            // Použijeme Brackets pro vytvoření závorek kolem podmínek
            queryBuilder[logicalFilter.operator === LogicalOperator.AND ? 'andWhere' : 'orWhere'](
              new Brackets(qb => {
                this.applyFilterToQueryBuilder(qb, subFilter, subPrefix);
              })
            );
          }
        }
        
        // Připojíme všechny podmínky k dotazu
        if (conditions.length > 0) {
          const condition = conditions.length === 1 
            ? conditions[0] 
            : `(${conditions.join(logicalFilter.operator === LogicalOperator.AND ? ' AND ' : ' OR ')})`;
          
          queryBuilder[logicalFilter.operator === LogicalOperator.AND ? 'andWhere' : 'orWhere'](
            condition, parameters
          );
        }
      } else {
        // Pro základní filtr
        const baseFilter = filter as BaseFilter;
        const paramName = `${paramPrefix}0`;
        
        const condition = this.getConditionForFilter(baseFilter, paramName);
        if (condition) {
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
    async findByPrimaryKey(id: PrimaryKeyValue): Promise<T | null> {
      const condition = this.createPrimaryKeyCondition(id);
      return this.repository.findOneBy(condition);
    }
    
    /**
     * Alias pro findByPrimaryKey, pro zpětnou kompatibilitu
     * @deprecated Použijte findByPrimaryKey
     */
    async findById(id: number): Promise<T | null> {
      return this.findByPrimaryKey(id);
    }
  
    // Pro jednu entitu
    async createOne(data: any): Promise<T> {
        const entity = this.repository.create(data);
        const result = await this.repository.save(entity);
        // Zkontrolujeme, zda je výsledek pole, a pokud ano, vrátíme první prvek
        return (Array.isArray(result) ? result[0] : result) as T;
    }

    // Pro více entit
    async createMany(dataArray: any[]): Promise<T[]> {
        const entities = this.repository.create(dataArray);
        return this.repository.save(entities) as Promise<T[]>;
    }

    // Alias pro zpětnou kompatibilitu
    async create(data: any): Promise<T> {
        return this.createOne(data);
    }
  
    /**
     * Aktualizuje entitu podle primárního klíče
     * @param id Hodnota primárního klíče (jednoduchá hodnota nebo objekt pro složené klíče)
     * @param data Data pro aktualizaci
     */
    async update(id: PrimaryKeyValue, data: any): Promise<T> {
      const condition = this.createPrimaryKeyCondition(id);
      const entity = await this.repository.findOneBy(condition);
      
      if (!entity) {
        const keyDescription = typeof id === 'object' 
          ? JSON.stringify(id) 
          : id.toString();
        throw new Error(`Entity with primary key ${keyDescription} not found`);
      }
      
      this.repository.merge(entity, data);
      return this.repository.save(entity);
    }
  
    /**
     * Smaže entitu podle primárního klíče
     * @param id Hodnota primárního klíče (jednoduchá hodnota nebo objekt pro složené klíče)
     */
    async delete(id: PrimaryKeyValue): Promise<boolean> {
      if (this.primaryKeys.length === 1 && (typeof id === 'string' || typeof id === 'number')) {
        // Pro jednoduchý primární klíč - můžeme použít this.repository.delete přímo
        const result = await this.repository.delete(id);
        return result.affected !== undefined && result.affected !== null && result.affected > 0;
      } else {
        // Pro složené primární klíče - musíme použít remove s entitou
        const entity = await this.findByPrimaryKey(id);
        if (!entity) return false;
        
        await this.repository.remove(entity);
        return true;
      }
    }
  }