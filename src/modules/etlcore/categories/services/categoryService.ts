import { Category } from "../models/Category";
import { EntityTarget } from "typeorm";
import { CreateCategoryDto, UpdateCategoryDto } from "../models/dto/CategoryDto";
import { AbstractService } from "../../../../services/AbstractService";
import { DbErrorResponse } from "../../../../services/AbstractService";
import { productsDto } from "../../products/services/products";

/**
 * Servisní třída pro správu kategorií produktů
 * Rozšiřuje AbstractService pro využití obecné CRUD funkcionality
 */
class CategoryService extends AbstractService<Category> {
  constructor() {
    // Explicitně definujeme sloupec 'id' jako primární klíč
    super(Category as EntityTarget<Category>, "category", "id","etlowner");
  }

  /**
   * Najde kategorii podle ID
   * Využívá findByPrimaryKey metodu z AbstractService
   */
  async findById(id: number): Promise<Category | null | DbErrorResponse> {
    try {
      return await this.findByPrimaryKey(id);
    } catch (error) {
      console.error(`Chyba při hledání kategorie s ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Vytvoření nové kategorie
   * Využívá createOne metodu z AbstractService
   */
  async create(categoryData: CreateCategoryDto): Promise<Category | DbErrorResponse> {
    return this.createOne(categoryData);
  }

  /**
   * Vytvoření více kategorií najednou
   * Využívá createMany metodu z AbstractService
   */
  async createBulk(categoriesData: CreateCategoryDto[]): Promise<Category[] | DbErrorResponse> {
    return this.createMany(categoriesData);
  }

  /**
   * Najde všechny kategorie na specifikované úrovni
   */
  async findByLevel(level: number): Promise<Category[] | DbErrorResponse> {
    try {
      return await this.repository.findBy({ level });
    } catch (error) {
      console.error(`Chyba při hledání kategorií na úrovni ${level}:`, error);
      return { 
        success: false,
        message: `Chyba při hledání kategorií na úrovni ${level}`,
        error: error instanceof Error ? error.message : String(error),
        recovered: false
      };
    }
  }

  /**
   * Najde všechny podkategorie pro nadřazenou kategorii
   */
  async findByParentId(parentId: number): Promise<Category[] | DbErrorResponse> {
    try {
      return await this.repository.findBy({ parentId });
    } catch (error) {
      console.error(`Chyba při hledání podkategorií pro kategorii ${parentId}:`, error);
      return { 
        success: false,
        message: `Chyba při hledání podkategorií pro kategorii ${parentId}`,
        error: error instanceof Error ? error.message : String(error),
        recovered: false
      };
    }
  }

  /**
   * Vytvoří testovací data kategorií na základě dat produktů
   * Zajišťuje konzistenci s existujícími produkty
   * @returns Informace o výsledku operace
   */
  async seedTestData(): Promise<{ success: boolean, message: string }> {
    try {
      // Kontrola, zda již existují kategorie
      const existingCount = await this.repository.count();
      if (existingCount > 0) {
        return { 
          success: true, 
          message: `Kategorie již existují. Počet záznamů: ${existingCount}` 
        };
      }

      // Extrakce unikátních kategorií a podkategorií z produktů
      const uniqueCategories = new Set<string>();
      const categorySubcategoryMap = new Map<string, Set<string>>();

      productsDto.forEach((product) => {
        const category = product.category as string;
        const subCategory = product.subCategory as string;

        uniqueCategories.add(category);
        
        if (!categorySubcategoryMap.has(category)) {
          categorySubcategoryMap.set(category, new Set<string>());
        }
        
        if (subCategory) {
          categorySubcategoryMap.get(category)?.add(subCategory);
        }
      });

      // Příprava dat pro vložení
      const mainCategories = new Map<string, number>();
      let displayOrder = 0;

      // Nejdříve vytvoříme hlavní kategorie
      const mainCategoriesData = Array.from(uniqueCategories).map((categoryName) => {
        const categoryCode = this.generateCategoryCode(categoryName);
        return {
          name: categoryName,
          code: categoryCode,
          description: `Kategorie obsahující produkty typu ${categoryName}`,
          level: 0,
          displayOrder: displayOrder++,
          isActive: true
        };
      });

      // Vložení hlavních kategorií do databáze
      const createMainCategoriesResult = await this.createMany(mainCategoriesData);
      if (!Array.isArray(createMainCategoriesResult)) {
        return { 
          success: false, 
          message: `Chyba při vytváření hlavních kategorií: ${createMainCategoriesResult.message}` 
        };
      }
      
      const savedMainCategories = createMainCategoriesResult;
      
      // Mapování názvů kategorií na jejich ID
      savedMainCategories.forEach(category => {
        mainCategories.set(category.name, category.id);
      });

      // Vytvoření podkategorií
      const subCategoriesData: CreateCategoryDto[] = [];
      
      for (const [categoryName, subCategorySet] of categorySubcategoryMap.entries()) {
        const parentId = mainCategories.get(categoryName);
        
        if (parentId) {
          Array.from(subCategorySet).forEach(subCategoryName => {
            const subCategoryCode = this.generateCategoryCode(`${categoryName}-${subCategoryName}`);
            subCategoriesData.push({
              name: subCategoryName,
              code: subCategoryCode,
              description: `Podkategorie ${subCategoryName} v kategorii ${categoryName}`,
              parentId: parentId,
              level: 1,
              displayOrder: displayOrder++,
              isActive: true
            });
          });
        }
      }

      // Vložení podkategorií do databáze
      const createSubCategoriesResult = await this.createMany(subCategoriesData);
      if (!Array.isArray(createSubCategoriesResult)) {
        return { 
          success: false, 
          message: `Chyba při vytváření podkategorií: ${createSubCategoriesResult.message}` 
        };
      }
      
      const savedSubCategories = createSubCategoriesResult;

      return { 
        success: true, 
        message: `Úspěšně vytvořeno ${savedMainCategories.length} hlavních kategorií a ${savedSubCategories.length} podkategorií` 
      };
    } catch (error) {
      console.error("Chyba při seedování kategorií:", error);
      return { 
        success: false, 
        message: `Chyba při seedování kategorií: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  /**
   * Generuje unikátní kód kategorie na základě jejího názvu
   * @param categoryName Název kategorie
   * @returns Kód kategorie
   */
  private generateCategoryCode(categoryName: string): string {
    // Převod na velká písmena, odstranění diakritiky
    const normalizedName = categoryName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
    
    // Odstranění mezer a speciálních znaků, ponechání pouze alfanumerických znaků
    const alphanumeric = normalizedName.replace(/[^a-zA-Z0-9]/g, '_');
    
    // Odstranění vícenásobných podtržítek a omezení délky na 50 znaků
    return alphanumeric.replace(/_+/g, '_').substring(0, 50);
  }
}

// Exportujeme třídu místo instance
export { CategoryService };

// Proměnná pro uchování instance služby
let _categoryServiceInstance: CategoryService | null = null;

/**
 * Funkce pro získání instance CategoryService
 * Instance se vytvoří až při prvním volání této funkce
 */
export function getCategoryService(): CategoryService {
  if (!_categoryServiceInstance) {
    _categoryServiceInstance = new CategoryService();
  }
  return _categoryServiceInstance;
}