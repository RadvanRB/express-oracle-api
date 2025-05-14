# Debugování metadat entity

Tento dokument popisuje, jak funguje mechanismus debugování metadat entit a sloupců v API pomocí proměnné prostředí `DEBUG_METADATA`.

## Co jsou metadata entity?

Metadata entity jsou dodatečné informace o datových třídách (entitách) a jejich vlastnostech (sloupcích), které popisují jejich strukturu, zdroj dat, validační pravidla a další charakteristiky. Tyto informace jsou v aplikaci ukládány pomocí dekorátorů `@EntityInfo` a `@ColumnInfo` a lze je využít pro:

- Automatické generování dokumentace API
- Validaci vstupních dat
- Mapování mezi databázovými tabulkami a objekty
- Transformaci dat před odesláním klientovi
- Definici vztahů mezi entitami

## Jak fungují metadata v aplikaci

Metadata jsou v aplikaci implementována pomocí dekorátorů a Reflect API. Existují dva hlavní typy metadat:

1. **Metadata entity** - informace o celé entitě (např. tabulce v databázi)
2. **Metadata sloupce** - informace o konkrétní vlastnosti entity (např. sloupci v tabulce)

### Příklad definice entity s metadaty

```typescript
import { EntityInfo, ColumnInfo } from '../utils/metadataDecorators';

@EntityInfo({
  sourceInfo: {
    description: 'Produkty v systému',
    schemaName: 'ETLCORE',
    tableName: 'PRODUCTS',
    system: 'SAP',
    owner: 'ETL_ADMIN'
  }
})
export class Product {
  @ColumnInfo({
    description: 'Unikátní identifikátor produktu',
    displayName: 'ID produktu',
    dataType: 'number'
  })
  id: number;

  @ColumnInfo({
    description: 'Název produktu',
    displayName: 'Název',
    dataType: 'string',
    validationRules: ['required', 'max:100']
  })
  name: string;
  
  // další vlastnosti...
}
```

## Debugování metadat

Při implementaci komplexnějších entit a jejich metadat může být užitečné sledovat, jak jsou metadata zpracovávána a ukládána. Systém poskytuje možnost debugování, které pomáhá vývojářům sledovat proces načítání a zpracování metadat.

### Aktivace debugového režimu

Debugový režim pro metadata lze aktivovat nastavením proměnné prostředí `DEBUG_METADATA` na hodnotu `true`. Toto nastavení zapne podrobné logování procesu zpracování metadat.

#### Konfigurace v .env souboru:
```
DEBUG_METADATA=true
```

### Zobrazované informace při debugování

Při aktivním debugování systém zobrazuje následující informace:

1. **Registrace metadat entity** - informuje o úspěšném uložení metadat pro celou entitu
2. **Registrace metadat sloupce** - informuje o uložení metadat pro každý sloupec
3. **Načítání metadat** - sleduje proces získání metadat z konstruktoru entity nebo prototypu
4. **Statistiky metadat** - zobrazuje počty nalezených metadat a jejich zdroje

### Příklady debugovacích výpisů

Při spuštění aplikace s aktivovaným debugováním metadat (`DEBUG_METADATA=true`) lze očekávat následující typy výpisů:

```
[METADATA] Metadata pro sloupec id byla uložena
[METADATA] Metadata pro sloupec name byla uložena
[METADATA] Metadata pro sloupec price byla uložena
[METADATA] Nalezena metadata v konstruktoru entity
[METADATA] Nalezena metadata v konstruktoru prototypu
[METADATA] Procházím sloupcová metadata TypeORM
[METADATA] Nalezena metadata pro sloupec id v TypeORM definici
[METADATA] Nalezena metadata pro vlastnost name pomocí Reflect API
[METADATA] Celkem nalezeno metadat sloupců: 3
[METADATA] Sloupce s metadaty: id, name, price
```

V případě, že nejsou nalezena žádná metadata, zobrazí se následující:

```
[METADATA] Žádná metadata sloupců nebyla nalezena!
[METADATA] Kontrola target: Product
[METADATA] Má prototype: true
[METADATA] Má konstruktor: true
```

### Využití vypisů pro identifikaci problémů

Debugovací výpisy jsou obzvláště užitečné pro identifikaci následujících problémů:

1. **Chybějící dekorátory** - pokud pro entitu nebo některé sloupce nejsou definovány dekorátory
2. **Nesprávná struktura metadat** - pokud metadata neobsahují požadované údaje
3. **Problémy s načítáním metadat** - pokud jsou metadata uložena, ale nelze je načíst
4. **Konflikty v TypeORM definicích** - pokud existují konflikty mezi metadaty uloženými různými způsoby

## Pokročilé techniky debugování metadat

### Inspekce všech metadat entity

Pro získání všech metadat entity lze použít následující kód:

```typescript
import { getEntityMetadata, getAllColumnMetadata } from '../utils/metadataDecorators';

// Získání metadat celé entity
const entityMetadata = getEntityMetadata(Product);
console.log('Metadata entity:', entityMetadata);

// Získání metadat všech sloupců
const columnMetadata = getAllColumnMetadata(Product);
console.log('Metadata sloupců:', columnMetadata);
```

### Inspekce konkrétního sloupce

Pro kontrolu metadat specifického sloupce:

```typescript
import { getColumnMetadata } from '../utils/metadataDecorators';

// Získání metadat konkrétního sloupce
const nameColumnMetadata = getColumnMetadata(Product.prototype, 'name');
console.log('Metadata sloupce name:', nameColumnMetadata);
```

## Doporučení pro produkční prostředí

Debugování metadat by mělo být aktivováno pouze během vývoje nebo ladění, nikoliv v produkčním prostředí. V produkčním prostředí doporučujeme nastavit:

```
DEBUG_METADATA=false
```

Tím zajistíte, že:
1. Nebudou generovány nadbytečné logové záznamy
2. Aplikace nebude zahlcovat logové soubory
3. Nedojde k úniku potenciálně citlivých informací o struktuře databáze

## Nejčastější problémy a jejich řešení

| Problém | Možná příčina | Řešení |
|---------|---------------|--------|
| Metadata nejsou načtena | Chybí importy dekorátorů | Zkontrolujte, zda jsou správně importovány `EntityInfo` a `ColumnInfo` |
| Metadata jsou definována, ale nejsou viditelná | Problém s inicializací Reflect API | Ujistěte se, že je správně importován a inicializován `reflect-metadata` |
| Metadata se nepropagují do TypeORM | Nekompatibilní definice | Zkontrolujte, zda jsou dekorátory aplikovány ve správném pořadí (TypeORM dekorátory před vlastními) |
| Žádná metadata sloupců nebyla nalezena | Dekorátor je aplikován na nesprávnou úroveň | Ujistěte se, že dekorátor `ColumnInfo` je aplikován na vlastnosti třídy, ne na metody |

## Závěr

Debugování metadat je užitečný nástroj při vývoji aplikací využívajících komplexní systém metadat. Proměnná prostředí `DEBUG_METADATA` umožňuje zapnout podrobné výpisy, které mohou pomoci odhalit problémy s definicí nebo zpracováním metadat entit a sloupců.