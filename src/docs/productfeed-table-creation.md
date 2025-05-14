# Vytvoření tabulky pro datové toky produktů

## Problém s vytvořením tabulky product_feeds

Tabulka `product_feeds` se nevytváří automaticky, i když je aktivována synchronizace na databázovém připojení `etlowner`. Důvodem je konfigurace v souboru `databaseConnections.ts`, kde jsou pro toto připojení definovány pouze entity z modulu `etlcore`:

```typescript
// V souboru src/config/databaseConnections.ts
// Části konfigurace pro etlowner:
synchronize: true,
entities: [path.join(__dirname, "../modules/etlcore/**/models/**/*.{js,ts}")],
```

Entita `ProductFeed` je však umístěna v modulu `interfaces`:
```
src/modules/interfaces/productfeeds/models/ProductFeed.ts
```

Proto se tabulka nevytváří automaticky, protože TypeORM nezahrnuje tuto entitu do synchronizace.

## Možnosti řešení

### 1. Upravit konfiguraci databázového připojení

Nejjednodušším řešením je upravit konfiguraci v souboru `databaseConnections.ts` tak, aby zahrnovala i entity z modulu `interfaces`:

```typescript
// Upravená konfigurace secondaryDatabaseConfig:
entities: [
  path.join(__dirname, "../modules/etlcore/**/models/**/*.{js,ts}"),
  path.join(__dirname, "../modules/interfaces/**/models/**/*.{js,ts}")
],
```

### 2. Vytvořit tabulku manuálně pomocí SQL skriptu

Alternativně lze vytvořit tabulku manuálně pomocí SQL skriptu:

```sql
-- Vytvoření tabulky product_feeds
CREATE TABLE product_feeds (
  id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR2(100) NOT NULL,
  description VARCHAR2(500),
  source_system VARCHAR2(100) NOT NULL,
  target_system VARCHAR2(100) NOT NULL,
  format VARCHAR2(50) NOT NULL,
  url VARCHAR2(500) NOT NULL,
  is_active NUMBER(1) DEFAULT 1 NOT NULL,
  refresh_interval NUMBER,
  transformation_script CLOB,
  filter_criteria CLOB,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Vytvoření indexů
CREATE INDEX idx_product_feeds_name ON product_feeds(name);
CREATE INDEX idx_product_feeds_source_system ON product_feeds(source_system);
CREATE INDEX idx_product_feeds_target_system ON product_feeds(target_system);
CREATE INDEX idx_product_feeds_is_active ON product_feeds(is_active);

-- Vytvoření spojovací tabulky pro vztah many-to-many s produkty
CREATE TABLE product_feed_products (
  feed_id NUMBER NOT NULL,
  product_id NUMBER NOT NULL,
  PRIMARY KEY (feed_id, product_id),
  CONSTRAINT fk_product_feed_products_feed 
    FOREIGN KEY (feed_id) REFERENCES product_feeds(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_product_feed_products_product 
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
);

-- Přidání komentářů k tabulce a sloupcům
COMMENT ON TABLE product_feeds IS 'Datové toky produktů pro integraci s externími systémy';
COMMENT ON COLUMN product_feeds.id IS 'Unikátní identifikátor datového toku';
COMMENT ON COLUMN product_feeds.name IS 'Název datového toku';
COMMENT ON COLUMN product_feeds.description IS 'Popis datového toku';
COMMENT ON COLUMN product_feeds.source_system IS 'Zdrojový systém dat';
COMMENT ON COLUMN product_feeds.target_system IS 'Cílový systém dat';
COMMENT ON COLUMN product_feeds.format IS 'Formát dat (např. JSON, XML, CSV)';
COMMENT ON COLUMN product_feeds.url IS 'URL koncového bodu pro datový tok';
COMMENT ON COLUMN product_feeds.is_active IS 'Určuje, zda je datový tok aktivní';
COMMENT ON COLUMN product_feeds.refresh_interval IS 'Interval automatické aktualizace v minutách';
COMMENT ON COLUMN product_feeds.transformation_script IS 'Transformační skript pro úpravu dat';
COMMENT ON COLUMN product_feeds.filter_criteria IS 'Kritéria pro filtrování dat';
COMMENT ON COLUMN product_feeds.createdAt IS 'Datum a čas vytvoření záznamu';
COMMENT ON COLUMN product_feeds.updatedAt IS 'Datum a čas poslední aktualizace';
```

## Doporučení

Doporučuji použít první řešení (upravit konfiguraci), pokud potřebujete synchronizovat více entit z modulu `interfaces`. Pokud se jedná pouze o jednorázové vytvoření tabulky, můžete použít SQL skript.

Při rozvoji aplikace zvažte jednu z těchto strategií:

1. **Organizovat entity podle databázových připojení** - entity, které mají být v jedné databázi, umístit do stejného adresáře
2. **Upravit konfiguraci databázových připojení** tak, aby zahrnovala entity z různých modulů
3. **Používat migrační skripty** místo automatické synchronizace pro větší kontrolu nad změnami schématu

Pro produkční prostředí se vždy doporučuje vypnout automatickou synchronizaci a používat migrační skripty.