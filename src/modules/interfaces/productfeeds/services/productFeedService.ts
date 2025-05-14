import { EntityTarget, In, FindOptionsWhere } from "typeorm";
import { ProductFeed } from "../models/ProductFeed";
import { CreateProductFeedDto, UpdateProductFeedDto, ProductFeedDto } from "../models/dto/ProductFeedDto";
import { AbstractService } from "../../../../services/AbstractService";
import { Product } from "../../../etlcore/products/models/Product";

/**
 * Služba pro práci s datovými toky produktů
 * Poskytuje metody pro základní CRUD operace a specifické metody pro práci s vazbami na produkty
 * Demonstruje mezioborové vztahy (interfaces <-> etlcore)
 */

// Instance služby pro singleton vzor
let productFeedServiceInstance: ProductFeedService | null = null;

/**
 * Získání instance služby (singleton vzor)
 * @returns Instance služby pro práci s datovými toky produktů
 */
export const getProductFeedService = (): ProductFeedService => {
  if (!productFeedServiceInstance) {
    productFeedServiceInstance = new ProductFeedService();
  }
  return productFeedServiceInstance;
};

export class ProductFeedService extends AbstractService<ProductFeed> {
  /**
   * Konstruktor služby
   */
  constructor() {
    // Předání entity modelu a názvu entity do konstruktoru rodiče
    super(ProductFeed as EntityTarget<ProductFeed>, 'productFeed',undefined, "etlowner");
  }

  /**
   * Mapování entity ProductFeed na DTO
   * @param feed Entita datového toku
   * @returns DTO reprezentace datového toku
   */
  mapToDto(feed: ProductFeed): ProductFeedDto {
    return {
      id: feed.id,
      name: feed.name,
      description: feed.description || "",
      sourceSystem: feed.sourceSystem,
      targetSystem: feed.targetSystem,
      format: feed.format,
      url: feed.url || "",
      isActive: feed.isActive !== null ? feed.isActive : true,
      refreshInterval: feed.refreshInterval || 0,
      transformationScript: feed.transformationScript || "",
      filterCriteria: feed.filterCriteria || "",
      createdAt: feed.createdAt,
      updatedAt: feed.updatedAt,
      productCount: feed.products ? feed.products.length : 0,
      productIds: feed.products ? feed.products.map(p => p.id) : []
    };
  }

  /**
   * Filtrování datových toků podle parametrů
   * @param params Parametry pro filtrování (isActive, format)
   * @returns Seznam datových toků nebo chybovou odpověď
   */
  async findByParams(params: { 
    isActive?: boolean; 
    format?: string; 
  }) {
    try {
      // Vytvoření podmínek pro filtrování
      const where: FindOptionsWhere<ProductFeed> = {};
      
      if (params.isActive !== undefined) {
        where.isActive = params.isActive;
      }
      
      if (params.format !== undefined) {
        where.format = params.format;
      }

      // Načtení datových toků podle filtrů
      const feeds = await this.repository.find({
        where,
        relations: ['products']
      });

      return {
        success: true,
        data: feeds,
        total: feeds.length
      };
    } catch (error) {
      return {
        success: false,
        message: `Chyba při filtrování datových toků: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error),
        recovered: false
      };
    }
  }

  /**
   * Vytvoření nového datového toku včetně vazeb na produkty
   * @param createDto Data pro vytvoření datového toku
   * @returns Vytvořený datový tok nebo chybovou odpověď
   */
  async createProductFeed(createDto: CreateProductFeedDto) {
    try {
      // Vytvoření nové instance datového toku
      const productFeed = this.repository.create({
        name: createDto.name,
        description: createDto.description,
        sourceSystem: createDto.sourceSystem,
        targetSystem: createDto.targetSystem,
        format: createDto.format,
        url: createDto.url,
        isActive: createDto.isActive !== undefined ? createDto.isActive : true,
        refreshInterval: createDto.refreshInterval,
        transformationScript: createDto.transformationScript,
        filterCriteria: createDto.filterCriteria
      });

      // Uložení datového toku do databáze
      const result = await this.repository.save(productFeed);
      
      // Pokud jsou specifikovány produkty, vytvoříme vazby
      if (createDto.productIds && createDto.productIds.length > 0) {
        await this.addProductsToFeed(result.id, createDto.productIds);
      }

      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        message: `Chyba při vytváření datového toku: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error),
        recovered: false
      };
    }
  }

  /**
   * Aktualizace existujícího datového toku včetně vazeb na produkty
   * @param id ID datového toku, který má být aktualizován
   * @param updateDto Data pro aktualizaci datového toku
   * @returns Aktualizovaný datový tok nebo chybovou odpověď
   */
  async updateProductFeed(id: number, updateDto: UpdateProductFeedDto) {
    try {
      // Kontrola existence datového toku
      const productFeed = await this.repository.findOne({ where: { id }, relations: ['products'] });
      if (!productFeed) {
        return {
          success: false,
          message: `Datový tok s ID ${id} nebyl nalezen`,
          error: "Not found",
          recovered: false
        };
      }

      // Aktualizace vlastností datového toku
      if (updateDto.name !== undefined) productFeed.name = updateDto.name;
      if (updateDto.description !== undefined) productFeed.description = updateDto.description;
      if (updateDto.sourceSystem !== undefined) productFeed.sourceSystem = updateDto.sourceSystem;
      if (updateDto.targetSystem !== undefined) productFeed.targetSystem = updateDto.targetSystem;
      if (updateDto.format !== undefined) productFeed.format = updateDto.format;
      if (updateDto.url !== undefined) productFeed.url = updateDto.url;
      if (updateDto.isActive !== undefined) productFeed.isActive = updateDto.isActive;
      if (updateDto.refreshInterval !== undefined) productFeed.refreshInterval = updateDto.refreshInterval;
      if (updateDto.transformationScript !== undefined) productFeed.transformationScript = updateDto.transformationScript;
      if (updateDto.filterCriteria !== undefined) productFeed.filterCriteria = updateDto.filterCriteria;

      // Uložení aktualizovaného datového toku
      const result = await this.repository.save(productFeed);
      
      // Pokud jsou specifikovány produkty, aktualizujeme vazby
      if (updateDto.productIds !== undefined) {
        // Získáme aktuální vazby
        await this.updateProductsInFeed(id, updateDto.productIds);
      }

      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        message: `Chyba při aktualizaci datového toku: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error),
        recovered: false
      };
    }
  }

  /**
   * Přidání produktů k datovému toku
   * @param feedId ID datového toku
   * @param productIds Pole ID produktů k přidání
   * @returns Výsledek operace
   */
  async addProductsToFeed(feedId: number, productIds: number[]) {
    try {
      // Kontrola existence datového toku
      const productFeed = await this.repository.findOne({ 
        where: { id: feedId },
        relations: ['products']
      });
      
      if (!productFeed) {
        return {
          success: false,
          message: `Datový tok s ID ${feedId} nebyl nalezen`,
          error: "Not found",
          recovered: false
        };
      }

      // Inicializace pole produktů, pokud ještě neexistuje
      if (!productFeed.products) {
        productFeed.products = [];
      }

      // Načtení produktů podle ID
      const productsToAdd = await this.repository.manager.find(Product, {
        where: { id: In(productIds) }
      });

      // Kontrola, zda byly nalezeny všechny požadované produkty
      if (productsToAdd.length !== productIds.length) {
        const foundIds = productsToAdd.map(p => p.id);
        const missingIds = productIds.filter(id => !foundIds.includes(id));
        
        return {
          success: false,
          message: `Některé produkty nebyly nalezeny: ${missingIds.join(', ')}`,
          error: "Not found",
          recovered: false
        };
      }

      // Přidání produktů do kolekce datového toku
      for (const product of productsToAdd) {
        // Kontrola, zda produkt již není přidán
        const isAlreadyAdded = productFeed.products.some(p => p.id === product.id);
        if (!isAlreadyAdded) {
          productFeed.products.push(product);
        }
      }

      // Uložení aktualizovaného datového toku
      await this.repository.save(productFeed);

      return { 
        success: true, 
        message: `${productsToAdd.length} produktů bylo úspěšně přidáno k datovému toku` 
      };
    } catch (error) {
      return {
        success: false,
        message: `Chyba při přidávání produktů k datovému toku: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error),
        recovered: false
      };
    }
  }

  /**
   * Odstranění produktů z datového toku
   * @param feedId ID datového toku
   * @param productIds Pole ID produktů k odstranění
   * @returns Výsledek operace
   */
  async removeProductsFromFeed(feedId: number, productIds: number[]) {
    try {
      // Kontrola existence datového toku
      const productFeed = await this.repository.findOne({ 
        where: { id: feedId },
        relations: ['products']
      });
      
      if (!productFeed) {
        return {
          success: false,
          message: `Datový tok s ID ${feedId} nebyl nalezen`,
          error: "Not found",
          recovered: false
        };
      }

      // Kontrola, zda existují produkty k odstranění
      if (!productFeed.products || productFeed.products.length === 0) {
        return {
          success: true,
          message: 'Datový tok nemá žádné produkty k odstranění'
        };
      }

      // Odstranění produktů z kolekce datového toku
      const initialCount = productFeed.products.length;
      productFeed.products = productFeed.products.filter(p => !productIds.includes(p.id));
      const removedCount = initialCount - productFeed.products.length;

      // Uložení aktualizovaného datového toku
      await this.repository.save(productFeed);

      return { 
        success: true, 
        message: `${removedCount} produktů bylo úspěšně odstraněno z datového toku` 
      };
    } catch (error) {
      return {
        success: false,
        message: `Chyba při odstraňování produktů z datového toku: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error),
        recovered: false
      };
    }
  }

  /**
   * Aktualizace produktů v datovém toku (nahrazení stávajících)
   * @param feedId ID datového toku
   * @param productIds Nové pole ID produktů
   * @returns Výsledek operace
   */
  async updateProductsInFeed(feedId: number, productIds: number[]) {
    try {
      // Kontrola existence datového toku
      const productFeed = await this.repository.findOne({ 
        where: { id: feedId },
        relations: ['products']
      });
      
      if (!productFeed) {
        return {
          success: false,
          message: `Datový tok s ID ${feedId} nebyl nalezen`,
          error: "Not found",
          recovered: false
        };
      }

      // Pokud je pole prázdné, odstraníme všechny produkty
      if (productIds.length === 0) {
        productFeed.products = [];
        await this.repository.save(productFeed);
        
        return {
          success: true,
          message: 'Všechny produkty byly odstraněny z datového toku'
        };
      }

      // Načtení produktů podle ID
      const products = await this.repository.manager.find(Product, {
        where: { id: In(productIds) }
      });

      // Kontrola, zda byly nalezeny všechny požadované produkty
      if (products.length !== productIds.length) {
        const foundIds = products.map(p => p.id);
        const missingIds = productIds.filter(id => !foundIds.includes(id));
        
        return {
          success: false,
          message: `Některé produkty nebyly nalezeny: ${missingIds.join(', ')}`,
          error: "Not found",
          recovered: false
        };
      }

      // Aktualizace kolekce produktů
      productFeed.products = products;

      // Uložení aktualizovaného datového toku
      await this.repository.save(productFeed);

      return { 
        success: true, 
        message: `Seznam produktů v datovém toku byl úspěšně aktualizován` 
      };
    } catch (error) {
      return {
        success: false,
        message: `Chyba při aktualizaci produktů v datovém toku: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error),
        recovered: false
      };
    }
  }

  /**
   * Získání seznamu produktů pro datový tok
   * @param feedId ID datového toku
   * @returns Seznam produktů nebo chybovou odpověď
   */
  async getProductsForFeed(feedId: number) {
    try {
      // Kontrola existence datového toku a načtení jeho produktů
      const productFeed = await this.repository.findOne({ 
        where: { id: feedId },
        relations: ['products']
      });
      
      if (!productFeed) {
        return {
          success: false,
          message: `Datový tok s ID ${feedId} nebyl nalezen`,
          error: "Not found",
          recovered: false
        };
      }

      return { 
        success: true, 
        data: productFeed.products || [] 
      };
    } catch (error) {
      return {
        success: false,
        message: `Chyba při načítání produktů pro datový tok: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error),
        recovered: false
      };
    }
  }

  /**
   * Seedování testovacích dat datových toků
   * @returns Výsledek seedování
   */
  async seedTestData() {
    try {
      // Kontrola, zda již existují nějaké datové toky
      const existingFeeds = await this.repository.count();
      if (existingFeeds > 0) {
        return {
          success: true,
          message: `Testovací data již existují. Nalezeno ${existingFeeds} datových toků.`
        };
      }

      // Najdeme produkty, pro které budeme vytvářet datové toky
      const products = await this.repository.manager.find(Product, {
        take: 10 // Omezíme počet produktů
      });

      if (products.length === 0) {
        return {
          success: false,
          message: 'Nebyly nalezeny žádné produkty pro vytvoření datových toků',
          error: 'No products found',
          recovered: false
        };
      }

      // Testovací data pro datové toky
      const testFeeds = [
        {
          name: "Exportní feed XML",
          description: "Export produktů do XML formátu pro partnerský e-shop",
          sourceSystem: "ProductCatalog",
          targetSystem: "PartnerShop",
          format: "XML",
          url: "https://example.com/api/export/xml",
          isActive: true,
          refreshInterval: 60,
          transformationScript: `
          function transformData(products) {
            // Transformační skript pro XML export
            return products.map(p => ({
              id: p.id,
              title: p.name,
              description: p.description,
              price: p.price,
              inStock: p.stock > 0
            }));
          }
          `,
          filterCriteria: '{"isActive": true, "stock": {"$gt": 0}}',
          products: products.slice(0, 5) // První polovina produktů
        },
        {
          name: "Importní feed JSON",
          description: "Import produktů z JSON formátu z dodavatelského systému",
          sourceSystem: "SupplierSystem",
          targetSystem: "ProductCatalog",
          format: "JSON",
          url: "https://supplier-api.example.com/products",
          isActive: true,
          refreshInterval: 120,
          transformationScript: `
          function transformData(data) {
            // Transformační skript pro JSON import
            return data.items.map(item => ({
              name: item.title,
              description: item.desc,
              price: item.price,
              stock: item.quantity,
              category: item.category
            }));
          }
          `,
          filterCriteria: '{"status": "active"}',
          products: products.slice(3, 8) // Překrývající se část produktů
        },
        {
          name: "Cenový feed CSV",
          description: "Export cen produktů do CSV formátu pro cenové srovnávače",
          sourceSystem: "ProductCatalog",
          targetSystem: "PriceComparisonEngine",
          format: "CSV",
          url: "https://price-engine.example.com/upload",
          isActive: true,
          refreshInterval: 1440,
          transformationScript: `
          function transformData(products) {
            // Transformační skript pro CSV export
            return products.map(p => [
              p.id,
              p.name,
              p.price,
              p.stock > 0 ? "in_stock" : "out_of_stock",
              p.categoryId
            ].join(","));
          }
          `,
          filterCriteria: '{"status": "active"}',
          products: products.slice(5, 10) // Druhá polovina produktů
        }
      ];

      // Uložení testovacích dat do databáze
      const savedFeeds = await this.repository.save(testFeeds as any);

      return {
        success: true,
        message: `Úspěšně seedováno ${savedFeeds.length} datových toků s vazbami na produkty`
      };
    } catch (error) {
      return {
        success: false,
        message: `Chyba při seedování testovacích dat: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error),
        recovered: false
      };
    }
  }
}