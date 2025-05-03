import { Product } from "../models/Product";
import { CreateProductDto, UpdateProductDto } from "../models/dto/ProductDto";
import { productsDto } from "../seeddata/products";
import { AbstractService } from "./AbstractService";

/**
 * Servisní třída pro správu produktů
 * Rozšiřuje AbstractService pro využití obecné CRUD funkcionality
 */
class ProductService extends AbstractService<Product> {
  constructor() {
    // Explicitně definujeme sloupec 'id' jako primární klíč
    super(Product, "product", "id");
  }

  /**
   * Najde produkt podle ID
   * Využívá findByPrimaryKey metodu z AbstractService
   */
  async findById(id: number): Promise<Product | null> {
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
  async create(productData: CreateProductDto): Promise<Product> {
    return this.createOne(productData);
  }

  /**
   * Vytvoření více produktů najednou
   * Využívá createMany metodu z AbstractService
   */
  async createBulk(productsData: CreateProductDto[]): Promise<Product[]> {
    return this.createMany(productsData);
  }

  /**
   * Naplnění databáze testovacími daty
   * Zachováváme specifickou implementaci pro ProductService
   */
  async seedTestData(): Promise<Product[]> {
    // Nejprve zkontrolujeme, zda již existují nějaké produkty
    const existingCount = await this.repository.count();
    if (existingCount > 0) {
      console.log("Databáze již obsahuje produkty, přeskakuji seed.");
      return [];
    }
    
    // Uložení testovacích dat do databáze pomocí refaktorované createBulk metody
    return await this.createBulk(productsDto);
  }
}

export const productService = new ProductService();