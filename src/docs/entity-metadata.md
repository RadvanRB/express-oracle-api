# Metadata entit a sloupců v aplikaci

## Úvod

Tato dokumentace popisuje implementaci systému pro přidávání metadat k entitám a jejich sloupcům. Metadata umožňují obohatit databázové entity o dodatečné informace, které mohou být využity pro:

- Automatické generování dokumentace
- Lepší popis dat v uživatelském rozhraní
- Rozšířené informace o datových zdrojích
- Validační pravidla
- Formátování hodnot při zobrazení

Systém je implementován pomocí vlastních TypeScript dekorátorů, které lze aplikovat na entity (třídy) a jejich vlastnosti (sloupce) a využívá knihovnu `reflect-metadata` pro práci s reflexními metadaty v TypeScriptu.

## Důležité požadavky

### Import reflect-metadata

Pro správné fungování metadat je nutné importovat knihovnu `reflect-metadata` na začátku aplikace (před ostatními importy):

```typescript
// src/index.ts nebo jiný vstupní bod aplikace
import "reflect-metadata";
// další importy...
```

Tento import je **kritický** pro fungování dekorátorů s metadaty. Bez něj se metadata nebudou správně ukládat ani načítat.

### Konfigurace TypeScript

V souboru `tsconfig.json` je potřeba povolit experimentální podporu dekorátorů a emitování metadat:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    // další nastavení...
  }
}
```

## Dostupné dekorátory

### EntityInfo

Dekorátor `EntityInfo` přidává metadata na úrovni celé entity (třídy). Používá se k definování informací o datovém zdroji, jako je popis tabulky, schéma, vlastník dat apod.

```typescript
@EntityInfo({
  sourceInfo: {
    description: "Popis entity",
    schemaName: "název_schématu",
    tableName: "název_tabulky",
    system: "zdrojový_systém",
    owner: "vlastník_dat",
    // další vlastní metadata...
  }
})
```

### ColumnInfo

Dekorátor `ColumnInfo` přidává metadata ke konkrétnímu sloupci (vlastnosti) entity. Umožňuje definovat popis, typ dat, formátování, validační pravidla a další informace.

```typescript
@ColumnInfo({
  description: "Popis sloupce",
  displayName: "Zobrazovaný název",
  dataType: "typ_dat",
  format: "formát_zobrazení",
  validationRules: ["required", "max:100"],
  foreignKey: {
    table: "referenced_table",
    column: "referenced_column"
  },
  // další vlastní metadata...
})
```

## Integrace s AbstractService

Systém je integrován s generickými metodami `findAll` a `findByPrimaryKey` v `AbstractService`. Při volání těchto metod jsou automaticky získána metadata entity a sloupců a přidána do výsledku v položce `source`:

```javascript
// Příklad výsledku metody findAll
{
  data: [...],  // Data entity
  total: 42,    // Celkový počet položek
  page: 1,      // Aktuální stránka
  limit: 10,    // Limit položek na stránku
  totalPages: 5, // Celkový počet stránek
  source: {     // Informace o zdroji dat
    sql: "SELECT ... FROM products ...", // SQL dotaz
    sourceInfo: {  // Metadata entity
      description: "Katalog produktů a jejich metadat",
      schemaName: "etlcore",
      tableName: "products",
      system: "ProductCatalog",
      owner: "ETL Team"
    },
    columnInfo: {  // Metadata sloupců
      "id": {
        description: "Unikátní identifikátor produktu",
        dataType: "number",
        displayName: "ID Produktu"
      },
      "name": {
        description: "Název produktu",
        dataType: "string",
        displayName: "Název",
        validationRules: ["required", "max:100"]
      },
      // další sloupce...
    }
  }
}
```

Pro metodu `findByPrimaryKey` je výsledek obdobný, ale metadata jsou přidána přímo k vrácenému objektu:

```javascript
// Příklad výsledku metody findByPrimaryKey
{
  id: 1,
  name: "Produkt 1",
  // další vlastnosti entity...
  
  source: {     // Informace o zdroji dat
    sql: "SELECT ... FROM products WHERE id = 1",
    sourceInfo: { ... },  // Metadata entity
    columnInfo: { ... }   // Metadata sloupců
  }
}
```

## Jak používat dekorátory metadat

### 1. Definice metadat entity

Dekorátor `EntityInfo` se aplikuje na třídu entity:

```typescript
import { Entity } from "typeorm";
import { EntityInfo } from "../utils/metadataDecorators";

@Entity("products")
@EntityInfo({
  sourceInfo: {
    description: "Katalog produktů a jejich metadat",
    schemaName: "etlcore",
    tableName: "products",
    system: "ProductCatalog",
    owner: "ETL Team"
  }
})
export class Product {
  // vlastnosti entity...
}
```

### 2. Definice metadat sloupců

Dekorátor `ColumnInfo` se aplikuje na vlastnosti entity:

```typescript
import { Column } from "typeorm";
import { ColumnInfo } from "../utils/metadataDecorators";

@Column({ type: "varchar", length: 100 })
@ColumnInfo({
  description: "Název produktu",
  dataType: "string",
  displayName: "Název",
  validationRules: ["required", "max:100"]
})
name!: string;
```

### Umístění dekorátorů

Pro správné fungování metadat je důležité umístění dekorátorů. Doporučený způsob:

```typescript
@Entity("tabulka")  // Nejprve TypeORM dekorátor entity
@EntityInfo({...})  // Poté náš dekorátor metadat entity

@Column(...)        // Nejprve TypeORM dekorátor pro sloupec
@Index()            // Pak případné další TypeORM dekorátory
@ColumnInfo({...})  // Nakonec náš dekorátor metadat sloupce
property!: type;    // A pak samotná definice vlastnosti
```

### 3. Práce s metadaty v aplikaci

Příklad použití metadat na straně klienta pro dynamické vytvoření formuláře:

```typescript
// Získání dat a metadat z API
const response = await api.get("/api/products/1");
const product = response.data;
const metadata = product.source;

// Vytvoření formuláře na základě metadat
function createFormField(fieldName, value, metadata) {
  const fieldMetadata = metadata.columnInfo[fieldName];
  if (!fieldMetadata) return null;
  
  const label = fieldMetadata.displayName || fieldName;
  const description = fieldMetadata.description;
  const type = mapDataTypeToInputType(fieldMetadata.dataType);
  const validation = fieldMetadata.validationRules || [];
  
  // Vykreslení pole formuláře s příslušnými validacemi
  return (
    <div>
      <label>{label}</label>
      <input 
        type={type}
        value={value}
        required={validation.includes("required")}
        // další atributy podle metadat...
      />
      {description && <span className="hint">{description}</span>}
    </div>
  );
}
```

## Příklad implementace na entitě Product

```typescript
import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";
import { EntityInfo, ColumnInfo } from "../../../../utils/metadataDecorators";

@Entity("products")
@EntityInfo({
  sourceInfo: {
    description: "Katalog produktů a jejich metadat",
    schemaName: "etlcore",
    tableName: "products",
    system: "ProductCatalog",
    owner: "ETL Team"
  }
})
export class Product {
  @PrimaryGeneratedColumn()
  @ColumnInfo({
    description: "Unikátní identifikátor produktu",
    dataType: "number",
    displayName: "ID Produktu"
  })
  id!: number;

  @Column({ length: 100 })
  @Index()
  @ColumnInfo({
    description: "Název produktu",
    dataType: "string",
    displayName: "Název",
    validationRules: ["required", "max:100"]
  })
  name!: string;

  // Další sloupce s metadata...
}
```

## Rozšiřitelnost

Systém metadat je navržen tak, aby byl snadno rozšiřitelný. Rozhraní `EntityMetadata` a `ColumnMetadata` umožňují přidávat další vlastní metadata podle potřeby konkrétní aplikace.

Pro přidání nového typu metadat:

1. Rozšiřte rozhraní v `metadataDecorators.ts`
2. Přidejte nová metadata do dekorátorů v modelech
3. Upravte kód, který s metadaty pracuje (např. komponenty UI)

## Technická implementace metadat

### Jak jsou metadata ukládána

Metadata jsou ukládána dvěma způsoby pro zajištění maximální kompatibility:

1. **Reflect API** - Standardní způsob pomocí Reflect.defineMetadata:
   ```typescript
   Reflect.defineMetadata(METADATA_KEY, metadata, target, propertyName);
   ```

2. **Přímé ukládání na konstruktor** - Záložní metoda pro lepší přístupnost:
   ```typescript
   target.constructor._columnMetadata[propertyName] = metadata;
   ```

### Jak jsou metadata získávána

Metadata jsou získávána pomocí funkce `getAllColumnMetadata`, která prohledává několik možných umístění:

1. Metadata přímo na třídě
2. Metadata na prototypu třídy pomocí Reflect API
3. Metadata uložená v konstruktoru prototypu
4. Metadata získaná z definic sloupců TypeORM

Tato vícestupňová strategie zajišťuje, že metadata budou správně získána i v různých kontextech a implementacích.

## Řešení problémů

### Metadata se nezobrazují v odpovědi API

Pokud se metadata entity nebo sloupců nezobrazují v odpovědi API, zkontrolujte následující:

1. **Import reflect-metadata** - Ověřte, že je knihovna `reflect-metadata` importována na začátku hlavního souboru aplikace
   ```typescript
   // src/index.ts nebo jiný vstupní bod
   import "reflect-metadata";
   ```

2. **Pořadí dekorátorů** - Zkontrolujte, že dekorátory jsou ve správném pořadí (TypeORM dekorátory před našimi dekorátory metadat)

3. **Zapnutí ladících výpisů** - V souboru `metadataDecorators.ts` jsou ladící výpisy, které mohou pomoci identifikovat problém:
   ```
   console.log('Nalezeno metadat sloupců:', Object.keys(columnMetadata).length);
   console.log('Sloupce s metadaty:', Object.keys(columnMetadata).join(', '));
   ```

4. **Zkontrolujte strukturu entity** - Zjistěte, zda je struktura entity kompatibilní s TypeORM a našimi dekorátory

### Metadata entity fungují, ale metadata sloupců ne

Tento problém často nastává, když:
- Dekorátory ColumnInfo jsou aplikovány po dekorátorech Column
- Reflect-metadata není správně inicializována
- TypeORM nerozpoznává sloupce správně

Řešení:
- Ověřte import reflect-metadata
- Zkontrolujte pořadí dekorátorů
- Ujistěte se, že dekorátor ColumnInfo je aplikován na vlastnost, ne na getter/setter
- Restartujte aplikaci pro úplné znovunačtení metadat

## Shrnutí

Implementace metadat v entitách přináší významné výhody pro vývoj a údržbu aplikace:

- Informace o datech jsou definovány na jednom místě spolu s modelem
- Metadata jsou automaticky dostupná v odpovědích API
- Klientské aplikace mohou metadata využít pro dynamické vytváření UI
- Validační pravidla jsou jasně definována v modelu
- Metadata poskytují dokumentaci přímo v kódu
- Díky rozšířené implementaci jsou metadata spolehlivě získávána a předávána klientům