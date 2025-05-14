# Implementace vztahu mezi produkty a kategoriemi

V rámci implementace vztahů mezi entitami bylo zjištěno, že v tabulce `products` chybí sloupec pro vazbu na kategorie. Pro úspěšnou implementaci vztahu mezi produkty a kategoriemi je potřeba:

1. Přidat sloupec pro ID kategorie do tabulky products
2. Upravit entitu Product tak, aby správně mapovala tento sloupec

## SQL pro přidání sloupce kategorie do tabulky produktů

```sql
-- Přidání sloupce category_id do tabulky products
ALTER TABLE "products" ADD (category_id NUMBER);

-- Vytvoření indexu na sloupci category_id pro optimalizaci vyhledávání
CREATE INDEX idx_products_category_id ON "products" (category_id);

-- Vytvoření cizího klíče pro zajištění integrity dat (volitelné)
-- Tento krok lze přeskočit, pokud je integrita zajištěna na aplikační úrovni
ALTER TABLE "products" 
ADD CONSTRAINT fk_products_category 
FOREIGN KEY (category_id) REFERENCES "categories"("id");
```

## Úprava entity Product

Pro správné mapování vztahu je potřeba upravit entitu Product následujícím způsobem:

```typescript
/**
 * Reference na kategorii produktu
 */
@ManyToOne(() => Category, category => category.products)
@JoinColumn({ name: "category_id" }) // Konzistentní s názvoslovím v aplikaci
category?: Category;

/**
 * ID kategorie, ke které produkt patří
 */
@Column({ name: "category_id", nullable: true }) // Použití stejného názvu sloupce jako v @JoinColumn
@Index()
@ColumnInfo({
  description: "ID kategorie produktu",
  dataType: "number",
  displayName: "Kategorie"
})
categoryId?: number; // Nastavení na volitelné, dokud nebudou všechny produkty přiřazeny ke kategorii
```

## Poznámky k implementaci

1. V aplikaci používáme konzistentně lowercase názvy sloupců, i když Oracle databáze obvykle ukládá názvy sloupců velkými písmeny
2. Sloupec je nastaven jako volitelný (`nullable: true`), aby se předešlo problémům s existujícími záznamy
3. Po implementaci a migraci je vhodné aktualizovat existující záznamy přiřazením ke kategorii