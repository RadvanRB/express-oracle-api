# Implementace vztahů mezi entitami v REST API

Tento dokument popisuje možnosti implementace vztahů (relací) mezi entitami v REST API a poskytuje návod, jak je efektivně využívat v našem systému.

## Obsah
1. [Typy vztahů a jejich implementace](#typy-vztahů-a-jejich-implementace)
2. [Strategie načítání souvisejících entit](#strategie-načítání-souvisejících-entit)
3. [Implementace vztahů v REST API](#implementace-vztahů-v-rest-api)
4. [Příklady implementace v našem projektu](#příklady-implementace-v-našem-projektu)
5. [Vztahy mezi entitami z různých modulů](#vztahy-mezi-entitami-z-různých-modulů)
6. [Best practices](#best-practices)

## Typy vztahů a jejich implementace

V našem systému můžeme implementovat následující typy vztahů mezi entitami pomocí TypeORM:

### One-to-One (1:1)

Vztah, kdy jedna entita má přesně jednu související entitu a naopak.

```typescript
// Entita User
@OneToOne(() => UserProfile)
@JoinColumn()
profile: UserProfile;

// Entita UserProfile
@OneToOne(() => User, user => user.profile)
user: User;
```

### One-to-Many (1:N)

Vztah, kdy jedna entita může být spojena s více instancemi druhé entity, ale instance druhé entity je spojena pouze s jednou instancí první entity.

```typescript
// Entita Category
@OneToMany(() => Product, product => product.category)
products: Product[];

// Entita Product
@ManyToOne(() => Category, category => category.products)
@JoinColumn({ name: "categoryId" })
category: Category;

@Column({ name: "categoryId" })
categoryId: number;
```

### Many-to-Many (N:M)

Vztah, kdy více instancí první entity může být spojeno s více instancemi druhé entity.

```typescript
// Entita Supplier
@ManyToMany(() => Product)
@JoinTable({
  name: "supplier_products",
  joinColumn: { name: "supplierId", referencedColumnName: "id" },
  inverseJoinColumn: { name: "productId", referencedColumnName: "id" }
})
products: Product[];

// Entita Product (volitelně můžeme definovat inverzní vztah)
@ManyToMany(() => Supplier, supplier => supplier.products)
suppliers: Supplier[];
```

## Strategie načítání souvisejících entit

TypeORM nabízí dvě hlavní strategie pro načítání souvisejících entit:

### Eager Loading (horlivé načítání)

Entity jsou načteny okamžitě spolu s hlavní entitou. Hodí se pro vztahy, které jsou téměř vždy potřeba.

```typescript
@ManyToOne(() => Category, category => category.products, { eager: true })
category: Category;
```

### Lazy Loading (líné načítání)

Entity jsou načteny až když jsou vyžádány. Vyžaduje, aby property byla typu Promise.

```typescript
@ManyToOne(() => Category, category => category.products, { lazy: true })
category: Promise<Category>;
```

### Manuální načítání vztahů pomocí queryBuilder

Nejflexibilnější způsob, který umožňuje přesně specifikovat, které vztahy mají být načteny v daném dotazu.

```typescript
const productsWithCategories = await this.productRepository
  .createQueryBuilder("product")
  .leftJoinAndSelect("product.category", "category")
  .getMany();
```

## Implementace vztahů v REST API

Pro implementaci vztahů v REST API máme několik možností:

### 1. Vnořené zdroje v URL

Využití hierarchické struktury URL pro vyjádření vztahů.

```
GET /categories/1/products       # Všechny produkty v kategorii 1
GET /products/5/images           # Všechny obrázky produktu 5
POST /categories/1/products      # Přidání nového produktu do kategorie 1
```

### 2. Parametry v dotazu

Filtrování souvisejících entit pomocí query parametrů.

```
GET /products?categoryId=1       # Všechny produkty v kategorii 1
GET /products?supplierId=3       # Všechny produkty od dodavatele 3
```

### 3. Vztahy v odpovědi (HATEOAS)

Přidání odkazů na související entity do odpovědi.

```json
{
  "id": 1,
  "name": "Produkt 1",
  "_links": {
    "self": { "href": "/products/1" },
    "category": { "href": "/categories/5" },
    "images": { "href": "/products/1/images" }
  }
}
```

### 4. Expanze vztahů

Možnost vyžádat si související entity přímo v odpovědi pomocí query parametru.

```
GET /products/1?expand=category,images
```

Response:
```json
{
  "id": 1,
  "name": "Produkt 1",
  "category": {
    "id": 5,
    "name": "Elektronika"
  },
  "images": [
    { "id": 10, "url": "image1.jpg" },
    { "id": 11, "url": "image2.jpg" }
  ]
}
```

## Příklady implementace v našem projektu

V našem projektu jsme implementovali vztahy mezi entitami v následujících modelech:

### Vztah One-to-Many: Category -> Product

```typescript
// src/modules/etlcore/categories/models/Category.ts
@OneToMany(() => Product, product => product.category)
products?: Product[];

// src/modules/etlcore/products/models/Product.ts
@ManyToOne(() => Category, category => category.products)
@JoinColumn({ name: "categoryId" })
category?: Category;

@Column({ name: "categoryId" })
@Index()
categoryId!: number;
```

### Vztah Many-to-Many: Supplier <-> Product

```typescript
// src/modules/etlcore/suppliers/models/Supplier.ts
@ManyToMany(() => Product)
@JoinTable({
  name: "supplier_products",
  joinColumn: { name: "supplierId", referencedColumnName: "id" },
  inverseJoinColumn: { name: "productId", referencedColumnName: "id" }
})
products?: Product[];
```

### Vztah Many-to-One: ProductImage -> Product

```typescript
// src/modules/etlcore/productimages/models/ProductImage.ts
@ManyToOne(() => Product)
@JoinColumn({ name: "productId" })
product?: Product;

@Column({ name: "productId" })
@Index()
productId!: number;
```

## Vztahy mezi entitami z různých modulů

V našem projektu implementujeme i vztahy mezi entitami z různých funkčních domén (modulů). Příkladem je vztah mezi entitou ProductFeed z modulu interfaces a entitou Product z modulu etlcore:

```typescript
// src/modules/interfaces/productfeeds/models/ProductFeed.ts
@ManyToMany(() => Product)
@JoinTable({
  name: "interface_feed_products",
  joinColumn: { name: "feedId", referencedColumnName: "id" },
  inverseJoinColumn: { name: "productId", referencedColumnName: "id" }
})
products?: Product[];
```

Tento přístup umožňuje propojení entit napříč funkčními doménami a zajišťuje integritu dat v celém systému.

## Best practices

### 1. Správné pojmenování

Pro konzistentní pojmenování vztahů dodržujeme tyto konvence:
- Pro one-to-many vztahy používáme množné číslo (products)
- Pro many-to-one a one-to-one vztahy používáme jednotné číslo (category)
- Pro many-to-many vztahy používáme množné číslo na obou stranách

### 2. Optimalizace výkonu

- Používejte lazy loading pro velké kolekce nebo vztahy, které nejsou vždy potřeba
- Pro často používané vztahy zvažte eager loading
- Pro komplexní dotazy využívejte queryBuilder s cílenými joins

### 3. Cascade operace

Při definici vztahů můžete specifikovat, co se má stát se souvisejícími entitami při operacích jako delete nebo update:

```typescript
@OneToMany(() => ProductImage, image => image.product, {
  cascade: true, // Všechny operace (insert, update, remove)
  onDelete: "CASCADE" // Alternativně na úrovni databáze
})
images: ProductImage[];
```

### 4. Databázové indexy

Pro sloupce s cizími klíči vždy vytvářejte indexy pro optimalizaci výkonu:

```typescript
@Column({ name: "categoryId" })
@Index() // Přidání indexu na sloupec s cizím klíčem
categoryId: number;
```

### 5. DTOs a serializace

Vytvářejte DTO třídy pro příchozí a odchozí data, které přesně definují, které vztahy mají být zahrnuty v odpovědi:

```typescript
// ProductDto.ts
export class ProductDto {
  id: number;
  name: string;
  price: number;
  category?: CategoryDto; // Volitelně zahrnuta kategorie
  // Obrázky nejsou zahrnuty ve výchozím DTO
}
```

### 6. Kontrola přístupu pro vztahy

Při definici oprávnění nezapomínejte na kontrolu přístupu i pro související entity:

```typescript
// Kontrola, zda uživatel má přístup k produktu i jeho obrázkům
@Get('products/:id/images')
async getProductImages(@Param('id') id: number, @Req() req) {
  const product = await this.productService.findById(id);
  if (!product) throw new NotFoundException();
  
  // Ověření, zda uživatel má přístup k produktu
  this.authorizationService.checkPermission(req.user, 'products', 'SELECT');
  
  // Ověření, zda uživatel má přístup k obrázkům
  this.authorizationService.checkPermission(req.user, 'product_images', 'SELECT');
  
  return this.productImageService.findByProductId(id);
}