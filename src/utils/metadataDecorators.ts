/**
 * Dekorátory pro přidání metadat k entitám a sloupcům
 * Umožňují přidat doplňující informace, které lze získat v rámci dotazů
 */
import { debugMetadataLog } from './logger';

// Symbol pro ukládání metadat entity
const ENTITY_METADATA_KEY = Symbol('entityMetadata');

// Symbol pro ukládání metadat sloupce
const COLUMN_METADATA_KEY = Symbol('columnMetadata');

/**
 * Rozhraní pro metadata entity
 */
export interface EntityMetadata {
  sourceInfo?: {
    description?: string;
    schemaName?: string;
    tableName?: string;
    system?: string;
    owner?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Rozhraní pro metadata sloupce
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
 * Funkce pro získání metadat entity
 * @param target Třída entity
 */
export function getEntityMetadata(target: any): EntityMetadata | undefined {
  return Reflect.getMetadata(ENTITY_METADATA_KEY, target);
}

/**
 * Funkce pro získání metadat sloupce
 * @param target Třída entity
 * @param propertyKey Název sloupce/vlastnosti
 */
export function getColumnMetadata(target: any, propertyKey: string): ColumnMetadata | undefined {
  return Reflect.getMetadata(COLUMN_METADATA_KEY, target, propertyKey);
}

/**
 * Funkce pro získání metadat všech sloupců entity
 * @param target Třída entity
 */
export function getAllColumnMetadata(target: any): Record<string, ColumnMetadata> {
  const columnMetadata: Record<string, ColumnMetadata> = {};
  
  // 1. Zkusíme získat metadata z konstruktoru třídy (nový způsob)
  if (target._columnMetadata) {
    debugMetadataLog('Nalezena metadata v konstruktoru entity');
    Object.assign(columnMetadata, target._columnMetadata);
  }
  
  // 2. Zkusíme získat metadata z prototypu třídy pomocí Reflect API (původní způsob)
  if (target.prototype) {
    const proto = target.prototype;
    
    // 2.1 Zkusíme získat metadata z _columnMetadata na konstruktoru prototypu
    if (proto.constructor && proto.constructor._columnMetadata) {
      debugMetadataLog('Nalezena metadata v konstruktoru prototypu');
      Object.assign(columnMetadata, proto.constructor._columnMetadata);
    }
    
    // 2.2 Zkusíme získat metadata z definovaných sloupců TypeORM
    if (proto.constructor && proto.constructor.hasOwnProperty('columns')) {
      debugMetadataLog('Procházím sloupcová metadata TypeORM');
      const columns = proto.constructor.columns || [];
      
      for (const column of columns) {
        if (column && column.propertyName) {
          // Získání metadata pro sloupec pomocí Reflect API
          const metadata = Reflect.getMetadata(
            COLUMN_METADATA_KEY, 
            proto, 
            column.propertyName
          );
          
          if (metadata) {
            debugMetadataLog(`Nalezena metadata pro sloupec ${column.propertyName} v TypeORM definici`);
            columnMetadata[column.propertyName] = metadata;
          }
        }
      }
    }
    
    // 2.3 Průchod všemi vlastnostmi prototypu
    const properties = Object.getOwnPropertyNames(proto);
    for (const prop of properties) {
      if (prop !== 'constructor' && prop !== 'prototype' && prop !== '__proto__') {
        const metadata = Reflect.getMetadata(
          COLUMN_METADATA_KEY, 
          proto, 
          prop
        );
        
        if (metadata) {
          debugMetadataLog(`Nalezena metadata pro vlastnost ${prop} pomocí Reflect API`);
          columnMetadata[prop] = metadata;
        }
      }
    }
  }
  
  // 3. Kontrolní výpis výsledků
  const count = Object.keys(columnMetadata).length;
  debugMetadataLog(`Celkem nalezeno metadat sloupců: ${count}`);
  if (count > 0) {
    debugMetadataLog('Sloupce s metadaty: ' + Object.keys(columnMetadata).join(', '));
  } else {
    debugMetadataLog('Žádná metadata sloupců nebyla nalezena!');
    debugMetadataLog('Kontrola target: ' + (target?.name || target?.constructor?.name || 'neznámý'));
    debugMetadataLog('Má prototype: ' + !!target?.prototype);
    debugMetadataLog('Má konstruktor: ' + !!target?.prototype?.constructor);
  }
  
  return columnMetadata;
}

/**
 * Dekorátor pro přidání metadat k entitě
 * @param metadata Metadata entity
 */
export function EntityInfo(metadata: EntityMetadata): ClassDecorator {
  return function(target: any) {
    Reflect.defineMetadata(ENTITY_METADATA_KEY, metadata, target);
    return target;
  };
}

/**
 * Dekorátor pro přidání metadat ke sloupci
 * @param metadata Metadata sloupce
 */
export function ColumnInfo(metadata: ColumnMetadata): PropertyDecorator {
  return function(target: any, propertyKey: string | symbol) {
    // Uložení metadat přímo na prototyp třídy
    const propName = propertyKey.toString();
    
    // Ukládání metadat dvěma způsoby pro zajištění kompatibility
    // 1. Standardní způsob s Reflect API - klíčový pro funkci getAllColumnMetadata
    Reflect.defineMetadata(COLUMN_METADATA_KEY, metadata, target, propName);
    
    // 2. Ukládání do static mapy na konstruktoru - klíčové pro TypeORM integraci
    if (!target.constructor._columnMetadata) {
      target.constructor._columnMetadata = {};
    }
    target.constructor._columnMetadata[propName] = metadata;
    
    // Debug log pro ověření ukládání
    debugMetadataLog(`Metadata pro sloupec ${propName} byla uložena`);
  };
}