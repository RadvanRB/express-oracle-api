// src/services/AbstractService.ts
import { 
    Repository, 
    SelectQueryBuilder, 
    EntityTarget, 
    Brackets ,
    WhereExpressionBuilder
  } from "typeorm";
  import { AppDataSource } from "../config/database";
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
  import { ObjectLiteral } from "typeorm";
  
  export abstract class AbstractService<T extends ObjectLiteral> {
    protected repository: Repository<T>;
    protected entityName: string;
  
    constructor(entity: EntityTarget<T>, entityName: string) {
        this.repository = AppDataSource.getRepository(entity);
        this.entityName = entityName.toLowerCase();
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
  
    // Další obecné metody pro CRUD operace, které lze použít v odvozených třídách
    async findById(id: number): Promise<T | null> {
      return this.repository.findOneBy({ id } as any);
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
  
    async update(id: number, data: any): Promise<T> {
      const entity = await this.repository.findOneBy({ id } as any);
      if (!entity) {
        throw new Error(`Entity with ID ${id} not found`);
      }
      
      this.repository.merge(entity, data);
      return this.repository.save(entity);
    }
  
    async delete(id: number): Promise<boolean> {
      const result = await this.repository.delete(id);
      return result.affected !== undefined && result.affected !== null && result.affected > 0;
    }
  }