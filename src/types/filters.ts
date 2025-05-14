import { FindOperator } from "typeorm";

/**
 * Porovnávací operátory, které lze použít ve filtrech
 */
export enum ComparisonOperator {
  EQ = "eq", // Rovná se
  NE = "ne", // Nerovná se
  GT = "gt", // Větší než
  GTE = "gte", // Větší nebo rovno
  LT = "lt", // Menší než
  LTE = "lte", // Menší nebo rovno
  LIKE = "like", // Obsahuje (case-sensitive)
  ILIKE = "ilike", // Obsahuje (case-insensitive)
  IN = "in", // Je v seznamu hodnot
  NOT_IN = "not_in", // Není v seznamu hodnot
  IS_NULL = "is_null", // Je NULL
  IS_NOT_NULL = "is_not_null", // Není NULL
  
  // Operátory specifické pro datové pole
  DATE_EQUALS = "date_eq", // Datum se rovná (ignoruje čas)
  DATE_NOT_EQUALS = "date_ne", // Datum se nerovná (ignoruje čas)
  DATE_BEFORE = "date_before", // Datum je před
  DATE_AFTER = "date_after", // Datum je po
  DATE_BETWEEN = "date_between", // Datum je mezi dvěma daty
  DATE_NOT_BETWEEN = "date_not_between", // Datum není mezi dvěma daty
  DATE_TODAY = "date_today", // Datum je dnes
  DATE_YESTERDAY = "date_yesterday", // Datum je včera
  DATE_THIS_WEEK = "date_this_week", // Datum je v tomto týdnu
  DATE_LAST_WEEK = "date_last_week", // Datum je v minulém týdnu
  DATE_THIS_MONTH = "date_this_month", // Datum je v tomto měsíci
  DATE_LAST_MONTH = "date_last_month", // Datum je v minulém měsíci
  DATE_THIS_YEAR = "date_this_year", // Datum je v tomto roce
  DATE_LAST_YEAR = "date_last_year", // Datum je v minulém roce
}

/**
 * Logické operátory pro spojování více filtrů
 */
export enum LogicalOperator {
  AND = "and",
  OR = "or",
}

/**
 * Základní filtr pro jedno pole
 */
export interface BaseFilter {
  field: string;
  operator: ComparisonOperator;
  value: any;
}

/**
 * Logický filtr, který obsahuje více podfiltrů spojených logickým operátorem
 */
export interface LogicalFilter {
  operator: LogicalOperator;
  filters: (BaseFilter | LogicalFilter)[];
}

/**
 * Rozšířený typ filtru, který může být buď základní nebo logický
 */
export type Filter = BaseFilter | LogicalFilter;

/**
 * Možnosti řazení
 */
export enum SortDirection {
  ASC = "asc",
  DESC = "desc",
}

/**
 * Definice řazení
 */
export interface SortOption {
  field: string;
  direction: SortDirection;
}

/**
 * Možnosti stránkování
 */
export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * Kompletní možnosti pro dotazování dat
 */
export interface QueryOptions {
  filter?: Filter;
  sort?: SortOption[];
  pagination?: PaginationOptions;
}

/**
 * Výsledek dotazu s podporou stránkování
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  /**
   * Informace o zdroji dat, včetně SQL dotazu
   */
  source?: {
    /**
     * Text SQL dotazu použitého pro získání dat
     */
    sql: string;
  };
}

/**
 * Typ pro TypeORM "Where" podmínku
 */
export type TypeORMWhereCondition = Record<string, any | FindOperator<any>> | Array<Record<string, any | FindOperator<any>>>;