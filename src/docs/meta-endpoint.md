# Metadata Endpoint

## Popis

Endpoint "metadata" poskytuje informace o struktuře databázových tabulek bez přístupu k samotným datům. Jedná se o generický endpoint, který je k dispozici pro všechny entity v API a vrací pouze metadata o zdrojové tabulce (`sourceInfo`) a jejích sloupcích (`columnInfo`).

## Implementace

Metadata endpoint již připraven v abstraktním kontroleru (`AbstractController`) a je dostupný ve všech kontrolerech, které z něj dědí. Pro zpřístupnění endpointu stačí v konkrétním kontroleru přidat metodu, která volá generickou metodu `getMeta()`.

### Příklad implementace

```typescript
// V konkrétním kontroleru (např. CategoryController)
@Get("metadata")
public async getEntityMeta(): Promise<EntityMetadata> {
  return await this.getMeta();
}
```

## Použití

Pro získání metadat o entitě stačí zavolat endpoint `metadata` pro danou entitu:

```
GET /api/categories/metadata
GET /api/products/metadata
GET /api/suppliers/metadata
```

**Důležité**: Používáme konkrétní název cesty "metadata", který není interpretován jako parametr. Toto řešení zabraňuje kolizi s parametrickými cestami jako `{id}`. Předchozí pokusy s cestami jako "meta" nebo "_meta" způsobovaly problémy, protože TSOA framework je interpretoval jako hodnotu parametru ID.

## Struktura odpovědi

Odpověď z meta endpointu obsahuje dvě hlavní části:

### sourceInfo

Obsahuje informace o zdrojové tabulce:

```json
{
  "sourceInfo": {
    "description": "Katalog produktů a jejich metadat",
    "schemaName": "etlcore",
    "tableName": "products",
    "system": "ProductCatalog",
    "owner": "ETL Team"
  }
}
```

### columnInfo

Obsahuje informace o jednotlivých sloupcích tabulky:

```json
{
  "columnInfo": {
    "id": {
      "description": "Unikátní identifikátor produktu",
      "dataType": "number",
      "displayName": "ID Produktu"
    },
    "name": {
      "description": "Název produktu",
      "dataType": "string",
      "displayName": "Název",
      "validationRules": ["required", "max:100"]
    }
  }
}
```

## Příklady použití

### Získání metadat produktů

```
GET /api/products/metadata
```

Odpověď:

```json
{
  "sourceInfo": {
    "description": "Katalog produktů a jejich metadat",
    "schemaName": "etlcore",
    "tableName": "products",
    "system": "ProductCatalog",
    "owner": "ETL Team"
  },
  "columnInfo": {
    "id": {
      "description": "Unikátní identifikátor produktu",
      "dataType": "number",
      "displayName": "ID Produktu"
    },
    "name": {
      "description": "Název produktu",
      "dataType": "string",
      "displayName": "Název",
      "validationRules": ["required", "max:100"]
    },
    "price": {
      "description": "Cena produktu",
      "dataType": "decimal",
      "displayName": "Cena",
      "format": "#,##0.00",
      "validationRules": ["required", "min:0"]
    }
  }
}
```

## Rozšíření metadat v entitách

Metadata pro entity a sloupce se definují pomocí dekorátorů `@EntityInfo` a `@ColumnInfo`:

```typescript
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
}