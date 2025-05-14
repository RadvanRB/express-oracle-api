import { FindOperator, Like, ILike, In, Not, IsNull, MoreThan, MoreThanOrEqual, LessThan, LessThanOrEqual, Equal, Between, Raw } from "typeorm";
import { debugFilterLog } from './logger';
import {
  Filter,
  BaseFilter,
  LogicalFilter,
  LogicalOperator,
  ComparisonOperator,
  TypeORMWhereCondition,
  SortOption,
  SortDirection,
  PaginationOptions,
  QueryOptions,
} from "../types/filters";
import { DateUtils } from "./dateUtils";

/**
 * Převede řetězec logického operátoru na jeho enum hodnotu
 */
export const parseLogicalOperator = (operator: string): LogicalOperator => {
  const op = operator.toLowerCase();
  if (op === "or") return LogicalOperator.OR;
  return LogicalOperator.AND; // Výchozí hodnota je AND
};

/**
 * Převede řetězec porovnávacího operátoru na jeho enum hodnotu
 */
export const parseComparisonOperator = (operator: string): ComparisonOperator => {
  // Odstranění hranatých závorek kolem operátoru, pokud existují
  let op = operator.toLowerCase();
  op = op.replace(/\[|\]/g, ''); // Odstranění [ a ]
  
  debugFilterLog(`Zpracování operátoru: původní '${operator}', po úpravě '${op}'`);
  
  switch (op) {
    // Základní operátory
    case "eq": return ComparisonOperator.EQ;
    case "ne": return ComparisonOperator.NE;
    case "gt": return ComparisonOperator.GT;
    case "gte": return ComparisonOperator.GTE;
    case "lt": return ComparisonOperator.LT;
    case "lte": return ComparisonOperator.LTE;
    case "like": return ComparisonOperator.LIKE;
    case "ilike": return ComparisonOperator.ILIKE;
    case "in": return ComparisonOperator.IN;
    case "not_in": return ComparisonOperator.NOT_IN;
    case "is_null": return ComparisonOperator.IS_NULL;
    case "is_not_null": return ComparisonOperator.IS_NOT_NULL;
    
    // Operátory pro datová pole
    case "date_eq": 
    case "date_equals": return ComparisonOperator.DATE_EQUALS;
    
    case "date_ne": 
    case "date_not_equals": return ComparisonOperator.DATE_NOT_EQUALS;
    
    case "date_before": 
    case "date_lt": return ComparisonOperator.DATE_BEFORE;
    
    case "date_after": 
    case "date_gt": return ComparisonOperator.DATE_AFTER;
    
    case "date_between": return ComparisonOperator.DATE_BETWEEN;
    case "date_not_between": return ComparisonOperator.DATE_NOT_BETWEEN;
    
    case "date_today": return ComparisonOperator.DATE_TODAY;
    case "date_yesterday": return ComparisonOperator.DATE_YESTERDAY;
    
    case "date_this_week": return ComparisonOperator.DATE_THIS_WEEK;
    case "date_last_week": return ComparisonOperator.DATE_LAST_WEEK;
    
    case "date_this_month": return ComparisonOperator.DATE_THIS_MONTH;
    case "date_last_month": return ComparisonOperator.DATE_LAST_MONTH;
    
    case "date_this_year": return ComparisonOperator.DATE_THIS_YEAR;
    case "date_last_year": return ComparisonOperator.DATE_LAST_YEAR;
    
    // Běžné aliasy pro operátory
    case "between": return ComparisonOperator.DATE_BETWEEN;
    case "not_between": return ComparisonOperator.DATE_NOT_BETWEEN;
    case "after": return ComparisonOperator.DATE_AFTER;
    case "before": return ComparisonOperator.DATE_BEFORE;
    case "equals": return ComparisonOperator.EQ;
    case "not_equals": return ComparisonOperator.NE;
    
    default: return ComparisonOperator.EQ; // Výchozí hodnota je EQ (rovná se)
  }
};

/**
 * Parsuje hodnotu podle typu operátoru
 */
export const parseFilterValue = (value: string, operator: ComparisonOperator): any => {
  // Zpracování seznamů hodnot
  if (operator === ComparisonOperator.IN || operator === ComparisonOperator.NOT_IN) {
    // Pro operátory IN a NOT_IN rozdělíme hodnotu podle čárky na pole
    return value.split(",").map((v) => v.trim());
  }
  
  // Zpracování hodnot null
  if (operator === ComparisonOperator.IS_NULL || operator === ComparisonOperator.IS_NOT_NULL) {
    // Pro operátory IS_NULL a IS_NOT_NULL nepotřebujeme hodnotu
    return null;
  }
  
  // Zpracování rozsahu dat
  if (operator === ComparisonOperator.DATE_BETWEEN || operator === ComparisonOperator.DATE_NOT_BETWEEN) {
    // Pro rozsah dat očekáváme formát "datum1,datum2"
    const [startDate, endDate] = value.split(",").map(v => v.trim());
    return {
      start: new Date(startDate),
      end: new Date(endDate)
    };
  }
  
  // Zpracování datových operátorů, které nepotřebují hodnotu
  if (
    [
      ComparisonOperator.DATE_TODAY,
      ComparisonOperator.DATE_YESTERDAY,
      ComparisonOperator.DATE_THIS_WEEK,
      ComparisonOperator.DATE_LAST_WEEK,
      ComparisonOperator.DATE_THIS_MONTH,
      ComparisonOperator.DATE_LAST_MONTH,
      ComparisonOperator.DATE_THIS_YEAR,
      ComparisonOperator.DATE_LAST_YEAR,
    ].includes(operator)
  ) {
    return null;
  }
  
  // Zpracování datových operátorů s hodnotou
  if (
    [
      ComparisonOperator.DATE_EQUALS,
      ComparisonOperator.DATE_NOT_EQUALS,
      ComparisonOperator.DATE_BEFORE,
      ComparisonOperator.DATE_AFTER,
    ].includes(operator)
  ) {
    try {
      return new Date(value);
    } catch (error) {
      console.error(`Chyba při parsování data: ${error}`);  // Ponecháno jako console.error, protože se jedná o chybu
      // Pokud se parsování nezdaří, vrátíme původní hodnotu
      return value;
    }
  }
  
  // Pro číselné operátory se pokusíme převést hodnotu na číslo
  if (
    [
      ComparisonOperator.EQ,
      ComparisonOperator.NE,
      ComparisonOperator.GT,
      ComparisonOperator.GTE,
      ComparisonOperator.LT,
      ComparisonOperator.LTE,
    ].includes(operator)
  ) {
    // Pokud je to číslo, převedeme ho
    if (!isNaN(Number(value))) {
      return Number(value);
    }
    
    // Pokud je to boolean hodnota
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
    
    // Pokud to vypadá jako datum, zkusíme ho parsovat
    if (/^\d{4}-\d{2}-\d{2}/.test(value) || /^\d{2}\.\d{2}\.\d{4}/.test(value) || /^\d{2}\/\d{2}\/\d{4}/.test(value)) {
      try {
        return new Date(value);
      } catch (error) {
        // Ignorujeme chybu a pokračujeme
      }
    }
  }
  
  // V ostatních případech vrátíme hodnotu jako řetězec
  return value;
};

/**
 * Vytvoří TypeORM FindOperator podle filtru
 */
export const createFindOperator = (filter: BaseFilter): FindOperator<any> | any => {
  const { operator, value } = filter;
  
  switch (operator) {
    // Základní operátory
    case ComparisonOperator.EQ:
      return Equal(value);
    case ComparisonOperator.NE:
      return Not(Equal(value));
    case ComparisonOperator.GT:
      return MoreThan(value);
    case ComparisonOperator.GTE:
      return MoreThanOrEqual(value);
    case ComparisonOperator.LT:
      return LessThan(value);
    case ComparisonOperator.LTE:
      return LessThanOrEqual(value);
    case ComparisonOperator.LIKE:
      return Like(`%${value}%`);
    case ComparisonOperator.ILIKE:
      return ILike(`%${value}%`);
    case ComparisonOperator.IN:
      return In(value);
    case ComparisonOperator.NOT_IN:
      return Not(In(value));
    case ComparisonOperator.IS_NULL:
      return IsNull();
    case ComparisonOperator.IS_NOT_NULL:
      return Not(IsNull());
      
    // Operátory pro datová pole
    case ComparisonOperator.DATE_EQUALS: {
      const startDate = new Date(value);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(value);
      endDate.setHours(23, 59, 59, 999);
      return Between(startDate, endDate);
    }
    
    case ComparisonOperator.DATE_NOT_EQUALS: {
      const startDate = new Date(value);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(value);
      endDate.setHours(23, 59, 59, 999);
      return Not(Between(startDate, endDate));
    }
    
    case ComparisonOperator.DATE_BEFORE:
      return LessThan(value);
      
    case ComparisonOperator.DATE_AFTER:
      return MoreThan(value);
      
    case ComparisonOperator.DATE_BETWEEN:
      return Between(value.start, value.end);
      
    case ComparisonOperator.DATE_NOT_BETWEEN:
      return Not(Between(value.start, value.end));
      
    case ComparisonOperator.DATE_TODAY: {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setMilliseconds(tomorrow.getMilliseconds() - 1);
      return Between(today, tomorrow);
    }
    
    case ComparisonOperator.DATE_YESTERDAY: {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      today.setMilliseconds(today.getMilliseconds() - 1);
      return Between(yesterday, today);
    }
    
    case ComparisonOperator.DATE_THIS_WEEK: {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = neděle, 1 = pondělí, ...
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Pondělí jako první den týdne
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      return Between(startOfWeek, endOfWeek);
    }
    
    case ComparisonOperator.DATE_LAST_WEEK: {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const startOfThisWeek = new Date(now);
      startOfThisWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      startOfThisWeek.setHours(0, 0, 0, 0);
      
      const startOfLastWeek = new Date(startOfThisWeek);
      startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
      
      const endOfLastWeek = new Date(startOfThisWeek);
      endOfLastWeek.setMilliseconds(endOfLastWeek.getMilliseconds() - 1);
      
      return Between(startOfLastWeek, endOfLastWeek);
    }
    
    case ComparisonOperator.DATE_THIS_MONTH: {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      
      return Between(startOfMonth, endOfMonth);
    }
    
    case ComparisonOperator.DATE_LAST_MONTH: {
      const now = new Date();
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      
      return Between(startOfLastMonth, endOfLastMonth);
    }
    
    case ComparisonOperator.DATE_THIS_YEAR: {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      
      return Between(startOfYear, endOfYear);
    }
    
    case ComparisonOperator.DATE_LAST_YEAR: {
      const now = new Date();
      const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
      const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      
      return Between(startOfLastYear, endOfLastYear);
    }
    
    default:
      return value;
  }
};

/**
 * Vytvoří TypeORM podmínku WHERE z filtru
 */
export const buildWhereCondition = (filter: Filter): TypeORMWhereCondition => {
  // Kontrola, zda se jedná o logický filtr
  if ("operator" in filter && ("filters" in filter)) {
    const logicalFilter = filter as LogicalFilter;
    
    // Vytvoření podmínek pro všechny podřízené filtry
    const conditions = logicalFilter.filters.map((subFilter) => buildWhereCondition(subFilter));
    
    // Spojení podmínek podle logického operátoru
    if (logicalFilter.operator === LogicalOperator.OR) {
      return conditions;
    } else {
      // Pro AND operátor použijeme oddělené klíče pro stejná pole
      const result: Record<string, any> = {};
      let i = 0;
      
      for (const condition of conditions) {
        for (const [key, value] of Object.entries(condition)) {
          // Použijeme index pro zajištění unikátnosti klíčů
          const uniqueKey = Object.keys(result).includes(key) ? `${key}_${i++}` : key;
          result[uniqueKey] = value;
        }
      }
      
      return result;
    }
  } else {
    // Základní filtr pro jedno pole
    const baseFilter = filter as BaseFilter;
    return {
      [baseFilter.field]: createFindOperator(baseFilter),
    };
  }
};

/**
 * Parsuje URL parametry do strukturovaného objektu filtru
 * 
 * Formát URL parametrů:
 * - filter[field][operator]=value
 * - filter[logicalOperator][0][field][operator]=value
 * - filter[logicalOperator][1][field][operator]=value
 * - filter[logicalOperator][0][nestedLogicalOperator][0][field][operator]=value
 * 
 * Příklady:
 * - filter[name][eq]=John
 * - filter[age][gt]=18
 * - filter[or][0][name][like]=John&filter[or][1][name][like]=Jane
 * - filter[or][0][name][like]=Samsung&filter[or][1][and][0][price][gt]=100
 */
export const parseUrlToFilter = (queryParams: Record<string, any>): Filter | undefined => {
  if (!queryParams.filter) return undefined;
  
  const filter = queryParams.filter;
  debugFilterLog("Parsování filtru z URL parametrů:", filter);
  
  // Kontrola, zda se jedná o logický filtr (OR, AND)
  if (filter.or || filter.and) {
    const operator = filter.or ? LogicalOperator.OR : LogicalOperator.AND;
    const filtersObj = filter.or || filter.and;
    
    // Převedení objektu na pole filtrů
    const filters: Filter[] = [];
    
    // Zpracování vnořených filtrů
    Object.keys(filtersObj).forEach((key) => {
      const subFilter = filtersObj[key];
      
      // Kontrola, zda vnořený filtr je základní nebo logický
      if (subFilter.or || subFilter.and) {
        // Rekurzivní zpracování logického filtru
        filters.push(parseUrlToFilter({ filter: subFilter }) as Filter);
      } else {
        // Zpracování základního filtru - projdeme všechna pole v tomto pod-filtru
        Object.keys(subFilter).forEach((field) => {
          const fieldConditions = subFilter[field];
          
          // Kontrola na vnořené logické operátory
          if (field === 'and' || field === 'or') {
            // Rekurzivně zpracujeme vnořený logický filtr
            const nestedFilter = { [field]: fieldConditions };
            filters.push(parseUrlToFilter({ filter: nestedFilter }) as Filter);
          } else {
            // Standardní zpracování pro pole s operátory
            Object.keys(fieldConditions).forEach((op) => {
              const value = fieldConditions[op];
              // Zde je důležité správně parseovat operátor
              const operator = parseComparisonOperator(op);
              debugFilterLog(`Parsování pole: ${field}, operátor '${op}' se převádí na enum: ${operator}, hodnota:`, value);
              
              // Vytvoření filtru s konkrétním operátorem
              const parsedFilter = {
                field,
                operator,
                value: parseFilterValue(value, operator),
              };
              debugFilterLog(`Vytvořený filtr:`, parsedFilter);
              filters.push(parsedFilter);
            });
          }
        });
      }
    });
    
    return {
      operator,
      filters,
    };
  } else {
    // Zpracování základního filtru
    const baseFilters: BaseFilter[] = [];
    
    Object.keys(filter).forEach((field) => {
      // Kontrola na vnořené logické operátory
      if (field === 'and' || field === 'or') {
        // Tento případ by měl být zachycen v předchozí podmínce
        console.warn("Neočekávaný formát filtru - logický operátor v základním filtru");  // Ponecháno jako console.warn, protože se jedná o varování
      } else {
        const fieldConditions = filter[field];
        
        Object.keys(fieldConditions).forEach((op) => {
          const value = fieldConditions[op];
          // Podobně jako výše, zajistíme správné parseování operátoru
          const operator = parseComparisonOperator(op);
          debugFilterLog(`Parsování pole: ${field}, operátor '${op}' se převádí na enum: ${operator}, hodnota:`, value);
          
          // Vytvoření filtru s konkrétním operátorem
          const parsedFilter = {
            field,
            operator,
            value: parseFilterValue(value, operator),
          };
          debugFilterLog(`Vytvořený filtr:`, parsedFilter);
          baseFilters.push(parsedFilter);
        });
      }
    });
    
    if (baseFilters.length === 1) {
      return baseFilters[0];
    } else if (baseFilters.length > 1) {
      return {
        operator: LogicalOperator.AND,
        filters: baseFilters,
      };
    }
  }
  
  return undefined;
};

/**
 * Parsuje možnosti řazení z URL parametrů
 * 
 * Formát URL parametrů:
 * - sort=field:direction,field2:direction2
 * 
 * Příklad:
 * - sort=name:asc,age:desc
 */
export const parseUrlToSort = (queryParams: Record<string, any>): SortOption[] | undefined => {
  if (!queryParams.sort) return undefined;
  
  const sortString = queryParams.sort;
  
  return sortString
    .split(",")
    .map((sortItem: string) => {
      const [field, direction] = sortItem.split(":");
      
      return {
        field,
        direction: direction?.toLowerCase() === "desc" ? SortDirection.DESC : SortDirection.ASC,
      };
    });
};

/**
 * Parsuje možnosti stránkování z URL parametrů
 * 
 * Formát URL parametrů:
 * - page=1&limit=10
 * 
 * Příklad:
 * - page=2&limit=20
 */
export const parseUrlToPagination = (queryParams: Record<string, any>): PaginationOptions | undefined => {
  if (!queryParams.page && !queryParams.limit) return undefined;
  
  return {
    page: parseInt(queryParams.page || "1"),
    limit: parseInt(queryParams.limit || "10"),
  };
};

/**
 * Parsuje URL parametry do QueryOptions objektu
 * 
 * Příklad:
 * - filter[name][eq]=John&sort=name:asc&page=1&limit=10
 */
export const parseUrlToQueryOptions = (queryParams: Record<string, any>): QueryOptions => {
  const filter = parseUrlToFilter(queryParams);
  const sort = parseUrlToSort(queryParams);
  const pagination = parseUrlToPagination(queryParams);
  
  return {
    filter,
    sort,
    pagination,
  };
};