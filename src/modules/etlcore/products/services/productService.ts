import { Product } from "../models/Product";
import { EntityTarget } from "typeorm";
import { CreateProductDto, UpdateProductDto } from "../models/dto/ProductDto";
import { productsDto } from "./products";
import { AbstractService } from "../../../../services/AbstractService";
import { DbErrorResponse } from "../../../../services/AbstractService";

/**
 * Servisní třída pro správu produktů
 * Rozšiřuje AbstractService pro využití obecné CRUD funkcionality
 */
class ProductService extends AbstractService<Product> {
  constructor() {
    // Explicitně definujeme sloupec 'id' jako primární klíč
    // Volitelně lze specifikovat název datového zdroje jako čtvrtý parametr
    super(Product as EntityTarget<Product>, "product", "id","etlowner");
  }

  /**
   * Najde produkt podle ID
   * Využívá findByPrimaryKey metodu z AbstractService
   */
  async findById(id: number): Promise<Product | null | DbErrorResponse> {
    try {
      return await this.findByPrimaryKey(id);
    } catch (error) {
      console.error(`Chyba při hledání produktu s ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Vytvoření nového produktu
   * Využívá createOne metodu z AbstractService
   */
  async create(productData: CreateProductDto): Promise<Product | DbErrorResponse> {
    return this.createOne(productData);
  }

  /**
   * Vytvoření více produktů najednou
   * Využívá createMany metodu z AbstractService
   */
  async createBulk(productsData: CreateProductDto[]): Promise<Product[] | DbErrorResponse> {
    return this.createMany(productsData);
  }

  /**
   * Naplnění databáze testovacími daty
   * Zachováváme specifickou implementaci pro ProductService
   */
  /**
   * Naplnění databáze testovacími daty
   * Upraveno pro podporu vztahu Product-Category
   */
  async seedTestData(): Promise<Product[] | DbErrorResponse> {
    try {
      // Nejprve zkontrolujeme, zda již existují nějaké produkty
      const existingCount = await this.repository.count();
      if (existingCount > 0) {
        console.log("Databáze již obsahuje produkty, přeskakuji seed.");
        return [];
      }
      
      // Získání nebo vytvoření kategorií pro produkty
      const categoryMapping = await this.ensureCategories();
      
      // Mapování produktů s přiřazením kategorie podle ID
      const productsWithCategoryIds = productsDto.map(product => {
        const categoryName = product.category as string;
        const categoryId = categoryMapping[categoryName];
        
        return {
          ...product,
          // Nahrazení textové kategorie ID kategorie
          categoryId: categoryId || 1 // Fallback na ID 1, pokud kategorie není nalezena
        };
      });
      
      // Uložení testovacích dat s ID kategorií do databáze
      return await this.createBulk(productsWithCategoryIds);
    } catch (error) {
      console.error("Chyba při seedování dat produktů:", error);
      return {
        success: false,
        message: `Chyba při seedování dat: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error),
        recovered: false
      };
    }
  }
  
  /**
   * Zajistí existenci kategorií pro seedování produktů
   * @returns Mapování názvů kategorií na jejich ID v databázi
   */
  private async ensureCategories(): Promise<Record<string, number>> {
    try {
      // Získání všech unikátních názvů kategorií z produktů
      const categoryNames = [...new Set(productsDto.map(product => product.category as string))];
      
      // Kontrola, zda již kategorie existují v databázi
      const categoryRepository = this.repository.manager.getRepository("Category");
      const existingCategories = await categoryRepository.find();
      
      const categoryMapping: Record<string, number> = {};
      
      // Pokud existují kategorie, vytvoříme mapování názvů na ID
      if (existingCategories.length > 0) {
        existingCategories.forEach((category: any) => {
          if (category.name) {
            categoryMapping[category.name] = category.id;
          }
        });
      }
      
      // Pro kategorie, které ještě neexistují, vytvoříme nové záznamy
      for (const categoryName of categoryNames) {
        if (!categoryMapping[categoryName]) {
          // Vytvoření nové kategorie, pokud neexistuje
          const newCategory = await categoryRepository.save({
            name: categoryName,
            code: categoryName.toLowerCase().replace(/\s+/g, '-'),
            description: `Kategorie pro ${categoryName}`,
            level: 1,
            isActive: true
          });
          
          categoryMapping[categoryName] = newCategory.id;
        }
      }
      
      return categoryMapping;
    } catch (error) {
      console.error("Chyba při zajišťování kategorií:", error);
      // V případě chyby vracíme prázdné mapování
      return {};
    }
  }
}

// Exportujeme třídu místo instance
export { ProductService };

// Proměnná pro uchování instance služby
let _productServiceInstance: ProductService | null = null;

/**
 * Funkce pro získání instance ProductService
 * Instance se vytvoří až při prvním volání této funkce
 */
export function getProductService(): ProductService {
  if (!_productServiceInstance) {
    _productServiceInstance = new ProductService();
  }
  return _productServiceInstance;
}