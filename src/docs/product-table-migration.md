# Migrace tabulky products

Tento dokument obsahuje SQL skript pro migraci tabulky products v Oracle databázi. Migrace zahrnuje vytvoření nové tabulky products_new, přenesení dat z původní tabulky, odstranění původní tabulky a přejmenování nové tabulky na products.

## Důvod migrace

V rámci implementace vztahů mezi entitami bylo zjištěno, že tabulka `products` má problém s některými sloupci, které byly označeny jako "unused". Při pokusu o jejich odstranění nebo přidání nového sloupce vzniká chyba:

```
ORA-12999: cannot DROP or SET UNUSED a column that has been set unused
```

Pro vyřešení tohoto problému je nutné vytvořit novou tabulku a migrovat do ní data.

## SQL skript pro migraci

```sql
-- Krok 1: Vytvoření nové tabulky products_new se stejnou strukturou jako původní
CREATE TABLE products_new (
    id NUMBER PRIMARY KEY,
    name VARCHAR2(100),
    description VARCHAR2(500),
    subCategory VARCHAR2(50),
    price NUMBER(10,2),
    stock NUMBER,
    width NUMBER(6,2),
    height NUMBER(6,2),
    depth NUMBER(6,2),
    weight NUMBER(6,2),
    color VARCHAR2(20),
    manufacturer VARCHAR2(100),
    sku VARCHAR2(50),
    isActive NUMBER DEFAULT 1,
    manufactureDate TIMESTAMP(6),
    expiryDate TIMESTAMP(6),
    stockedDate TIMESTAMP(6),
    lastSoldDate TIMESTAMP(6),
    createdAt TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    category_id NUMBER -- Přidaný nový sloupec pro vztah s kategoriemi
);

-- Krok 2: Kopírování dat z původní tabulky do nové
INSERT INTO products_new (
    id, name, description, subCategory, price, stock, 
    width, height, depth, weight, color, manufacturer, 
    sku, isActive, manufactureDate, expiryDate, 
    stockedDate, lastSoldDate, createdAt, updatedAt
)
SELECT 
    id, name, description, subCategory, price, stock, 
    width, height, depth, weight, color, manufacturer, 
    sku, isActive, manufactureDate, expiryDate, 
    stockedDate, lastSoldDate, createdAt, updatedAt
FROM products;

-- Krok 3: Vytvoření indexů na nové tabulce
CREATE INDEX idx_products_new_name ON products_new (name);
CREATE INDEX idx_products_new_sku ON products_new (sku);
CREATE INDEX idx_products_new_manufacturer ON products_new (manufacturer);
CREATE INDEX idx_products_new_category_id ON products_new (category_id);

-- Krok 4: Vytvoření sekvence pro ID, pokud existovala
-- Poznámka: Pokud byl sloupec ID generován pomocí sekvence, je třeba ji znovu vytvořit
-- CREATE SEQUENCE products_seq START WITH <next_id_value>;

-- Krok 5: Odstranění původní tabulky
DROP TABLE products;

-- Krok 6: Přejmenování nové tabulky na products
RENAME products_new TO products;

-- Krok 7: Vytvoření cizího klíče pro vztah s kategoriemi (volitelné)
-- ALTER TABLE products 
-- ADD CONSTRAINT fk_products_category 
-- FOREIGN KEY (category_id) REFERENCES categories(id);

-- Krok 8: Vytvoření triggeru pro automatické aktualizace updatedAt (volitelné)
CREATE OR REPLACE TRIGGER products_update_trigger
BEFORE UPDATE ON products
FOR EACH ROW
BEGIN
    :NEW.updatedAt := CURRENT_TIMESTAMP;
END;
/
```

## Postup migrace

1. Zálohujte data z tabulky products před spuštěním migrace
2. Spusťte SQL skript v produkčním prostředí mimo špičku provozu
3. Ověřte, že data byla správně migrována
4. Pokud se vyskytnou problémy, proveďte rollback ze zálohy

## Doporučení po migraci

1. Aktualizujte hodnoty ve sloupci category_id pro existující záznamy
2. Vytvořte cizí klíč na sloupci category_id, pokud je to žádoucí
3. Aktualizujte entity v TypeORM pro správné mapování nové struktury

## Poznámky k implementaci

1. Sloupec category_id je vytvořen jako volitelný (nullable), aby se předešlo problémům s existujícími záznamy
2. Primární klíč a indexy jsou znovu vytvořeny na nové tabulce
3. Pokud tabulka používá sekvence, constrainty nebo triggery, je třeba je ručně znovu vytvořit