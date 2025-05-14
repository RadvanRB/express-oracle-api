# Testování modulární Swagger dokumentace

Tento dokument popisuje, jak otestovat implementované změny pro oddělení API dokumentace podle funkčních domén (modulů) v Swagger UI.

## Přehled provedených změn

Pro oddělení API endpointů podle funkčních domén (`app`, `etlcore`, `interfaces`, `jlout`) byly upraveny tagy v kontrolerech. Konkrétně:

1. Kontrolery v modulu `etlcore` nyní používají tagy s prefixem "ETLCore - ", například:
   ```typescript
   @Tags("ETLCore - Categories")
   ```

2. Kontrolery v modulu `interfaces` nyní používají tagy s prefixem "Interfaces - ", například:
   ```typescript
   @Tags("Interfaces - ProductFeeds")
   ```

Podobný přístup by měl být aplikován na všechny kontrolery v projektu, aby byla dokumentace konzistentní.

## Regenerace Swagger dokumentace

Po úpravě tagů v kontrolerech je nutné znovu vygenerovat Swagger dokumentaci. Použijte následující příkaz:

```bash
npm run tsoa:build
```

Tento příkaz spustí generování Swagger specifikace a routes pomocí TSOA knihovny. Výsledkem bude aktualizovaný soubor `public/swagger.json` a vygenerované routy.

## Spuštění a testování

Pro otestování změn je potřeba spustit aplikaci:

```bash
npm run dev
```

Po spuštění přejděte na URL dokumentace API (typicky `/api-docs`) a zkontrolujte, zda jsou endpointy správně rozděleny podle funkčních domén.

### Očekávaný výsledek

V Swagger UI by nyní měly být endpointy organizovány podle tagů, které začínají prefixem odpovídajícím funkční doméně:

- Sekce `ETLCore - Categories`
- Sekce `Interfaces - ProductFeeds`
- atd.

Toto rozdělení usnadňuje orientaci v dokumentaci, zejména při větším počtu endpointů.

## Automatické sledování změn při vývoji

Pro automatickou regeneraci Swagger dokumentace při změnách v kontrolerech je možné využít příkaz:

```bash
npm run tsoa:watch
```

Tento příkaz sleduje změny v kontrolerech a automaticky regeneruje Swagger dokumentaci. 

**Poznámka:** Aktuální konfigurace v package.json sleduje pouze kontrolery v adresáři `src/controllers`. Pokud chcete sledovat i kontrolery v modulech, můžete upravit příkaz `tsoa:watch` v souboru package.json:

```json
"tsoa:watch": "nodemon --exec \"tsoa spec-and-routes\" --ext ts --watch src/controllers src/modules"
```

## Další kroky

Pro aplikování tohoto řešení na celý projekt by bylo potřeba:

1. Upravit všechny zbývající kontrolery v projektu, aby používaly tagy s odpovídajícími prefixy podle modulu
2. Regenerovat Swagger dokumentaci
3. Otestovat, že všechny endpointy jsou správně kategorizovány v dokumentaci

Pro automatizaci tohoto procesu při budoucím vývoji zvažte vytvoření standardu nebo šablony pro nové kontrolery, která bude automaticky používat správné tagy podle umístění v adresářové struktuře.