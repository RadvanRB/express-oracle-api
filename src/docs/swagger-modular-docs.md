# Modulární Struktura Swagger Dokumentace

Tento dokument popisuje, jak organizovat Swagger dokumentaci podle modulární struktury projektu. Cílem je rozdělit API dokumentaci podle funkčních domén: `app`, `etlcore`, `interfaces` a `jlout`.

## Problematika

Aktuálně jsou API endpointy v Swagger dokumentaci organizovány pouze podle názvů entit (tags), bez ohledu na to, do které funkční domény patří. To ztěžuje orientaci v dokumentaci, zejména při větším počtu endpointů.

## Řešení

Pro oddělení jednotlivých modulů v Swagger dokumentaci stačí upravit `@Tags` dekorátor v kontrolerech. TSOA (TypeScript OpenAPI) používá tyto tagy pro seskupování endpointů v dokumentaci.

### Aktuální stav

Aktuálně vypadá dekorátor v kontrolerech například takto:

```typescript
@Route("categories")
@Tags("Categories")
export class CategoryController extends AbstractController<...> {
  // ...
}
```

### Navržené řešení

Upravíme dekorátory `@Tags` ve všech kontrolerech tak, aby obsahovaly prefix s názvem funkční domény:

```typescript
// Pro modul etlcore
@Route("categories")
@Tags("ETLCore - Categories")
export class CategoryController extends AbstractController<...> {
  // ...
}

// Pro modul interfaces
@Route("api/productfeeds")
@Tags("Interfaces - ProductFeeds")
export class ProductFeedController extends AbstractController<...> {
  // ...
}

// Pro modul app
@Route("users")
@Tags("App - Users")
export class UserController extends AbstractController<...> {
  // ...
}

// Pro modul jlout
@Route("jlout/export")
@Tags("JLOut - Export")
export class ExportController extends AbstractController<...> {
  // ...
}
```

## Implementace

Implementace vyžaduje úpravu všech kontrolerů v projektu. Po úpravě tagů je potřeba znovu vygenerovat Swagger dokumentaci pomocí TSOA a restartovat aplikaci.

### Postup implementace

1. Upravit `@Tags` dekorátor ve všech kontrolerech podle modulu:
   - `app` modul: `@Tags("App - [EntityName]")`
   - `etlcore` modul: `@Tags("ETLCore - [EntityName]")`
   - `interfaces` modul: `@Tags("Interfaces - [EntityName]")`
   - `jlout` modul: `@Tags("JLOut - [EntityName]")`

2. Vygenerovat novou Swagger dokumentaci:
   ```
   npm run tsoa
   ```

3. Restartovat aplikaci pro načtení nové Swagger dokumentace.

## Výhody

1. **Přehlednost** - API endpointy jsou seskupeny podle funkčních domén, což usnadňuje orientaci v dokumentaci.
2. **Jednoduchá implementace** - Úprava nevyžaduje zásadní změny v architektuře aplikace, stačí upravit tagy v kontrolerech.
3. **Zachování stávající struktury URL** - Není potřeba měnit cesty k endpointům, pouze jejich organizaci v dokumentaci.

## Příklad výsledné struktury v Swagger UI

Výsledná dokumentace bude mít sekce organizované podle funkčních domén:

- **App**
  - App - Users
  - App - Roles
  - ...

- **ETLCore**
  - ETLCore - Products
  - ETLCore - Categories
  - ETLCore - Suppliers
  - ...

- **Interfaces**
  - Interfaces - ProductFeeds
  - ...

- **JLOut**
  - JLOut - Export
  - ...

## Závěr

Tato jednoduchá úprava výrazně zlepší přehlednost API dokumentace, zejména v projektech s větším počtem endpointů, kdy je potřeba je logicky strukturovat podle funkčních domén.