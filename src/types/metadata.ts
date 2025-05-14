/**
 * Definice typů pro metadata entit a jejich sloupců
 * Používá se pro endpoint 'meta', který vrací informace o struktuře tabulky
 */

/**
 * Informace o zdroji (tabulce)
 */
export interface SourceMetadata {
  description?: string;
  schemaName?: string;
  tableName?: string;
  system?: string;
  owner?: string;
  [key: string]: any;
}

/**
 * Informace o sloupci
 */
export interface ColumnMetadata {
  description?: string;
  displayName?: string;
  dataType?: string;
  format?: string;
  validationRules?: string[];
  foreignKey?: {
    table: string;
    column: string;
  };
  [key: string]: any;
}

/**
 * Kompletní metadata entity
 * Vrací se z endpointu 'meta'
 */
export interface EntityMetadata {
  sourceInfo?: SourceMetadata;
  columnInfo?: Record<string, ColumnMetadata>;
}