# Migrace tabulky product_images

Tento dokument obsahuje SQL skript pro přidání chybějícího sloupce `is_main` do tabulky `product_images` v Oracle databázi.

## Důvod migrace

Při pokusu o seedování dat nastala chyba:
```
ORA-00904: "is_main": invalid identifier
```

Tato chyba indikuje, že v databázi neexistuje sloupec `is_main`, který je definován v entitě `ProductImage`. Pro vyřešení tohoto problému je potřeba přidat chybějící sloupec do tabulky.

## SQL skript pro přidání sloupce

```sql
-- Přidání sloupce is_main do tabulky product_images
ALTER TABLE product_images ADD (is_main NUMBER(1) DEFAULT 0 NOT NULL);

-- Přidání komentáře k sloupci
COMMENT ON COLUMN product_images.is_main IS 'Příznak, zda je obrázek hlavním obrázkem produktu';

-- Vytvoření indexu pro rychlejší vyhledávání hlavních obrázků
CREATE INDEX idx_product_images_is_main ON product_images(is_main);

-- Commit změn
COMMIT;
```

## Ověření migrace

Po provedení migrace je vhodné ověřit, že sloupec byl úspěšně přidán:

```sql
-- Ověření existence sloupce
SELECT column_name, data_type, nullable 
FROM user_tab_columns 
WHERE table_name = 'PRODUCT_IMAGES' AND column_name = 'IS_MAIN';
```

## Poznámky k Oracle specifickým konvencím

V Oracle databázi:
1. Identifikátory jsou standardně ukládány ve VELKÝCH PÍSMENECH (pokud nejsou v uvozovkách)
2. Pro typ boolean se používá NUMBER(1), kde 0 = false, 1 = true
3. Názvy indexů by měly mít prefix idx_ nebo ix_ pro lepší identifikaci