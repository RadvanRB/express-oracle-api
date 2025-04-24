import { Product } from "../models/Product";
import { AppDataSource } from "../config/database";
import { CreateProductDto, UpdateProductDto } from "../models/dto/ProductDto";
import { PaginatedResult, QueryOptions } from "../types/filters";
import { buildWhereCondition } from "../utils/filterBuilder";
import  {productsDto }from "../seeddata/products";
import { In } from "typeorm";

class ProductService {
  private repository = AppDataSource.getRepository(Product);

  /**
   * Najde produkt podle ID
   */
  async findById(id: number): Promise<Product | null> {
    try {
      const product = await this.repository.findOneBy({ id });
      return product;
    } catch (error) {
      console.error(`Chyba při hledání produktu s ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Najde všechny produkty s podporou filtrování, řazení a stránkování
   */
  async findAll(queryOptions?: QueryOptions): Promise<PaginatedResult<Product>> {
    const { filter, sort, pagination } = queryOptions || {};

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    // Vytvoření podmínky WHERE z filtru
    const where = filter ? buildWhereCondition(filter) : {};

    // Vytvoření možností řazení
    const order: Record<string, "ASC" | "DESC"> = {};
    if (sort && sort.length > 0) {
      sort.forEach((s) => {
        order[s.field] = s.direction === "asc" ? "ASC" : "DESC";
      });
    } else {
      // Výchozí řazení
      order["createdAt"] = "DESC";
    }

    // Dotaz na celkový počet záznamů
    const total = await this.repository.count({ where });

    // Dotaz na data s použitím filtrů, řazení a stránkování
    const data = await this.repository.find({
      where,
      order,
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Vytvoření nového produktu
   */
  async create(productData: CreateProductDto): Promise<Product> {
    const product = this.repository.create(productData as any);
    const savedProduct = await this.repository.save(product);
    // Zajistíme, že vrátíme jednu entitu, ne pole
    return Array.isArray(savedProduct) ? savedProduct[0] : savedProduct;
  }

  /**
   * Vytvoření více produktů najednou
   */
  async createBulk(productsData: CreateProductDto[]): Promise<Product[]> {
    const products = productsData.map(data => this.repository.create(data as any));
    const savedProducts = await this.repository.save(products as any);
    return savedProducts as Product[];
  }

  /**
   * Aktualizace produktu
   */
  async update(id: number, productData: UpdateProductDto): Promise<Product> {
    const product = await this.repository.findOneBy({ id });
    if (!product) {
      throw new Error(`Produkt s ID ${id} nebyl nalezen`);
    }
    
    this.repository.merge(product, productData as any);
    const savedProduct = await this.repository.save(product);
    // Zajistíme, že vrátíme jednu entitu, ne pole
    return Array.isArray(savedProduct) ? savedProduct[0] : savedProduct;
  }

  /**
   * Smazání produktu
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  /**
   * Naplnění databáze testovacími daty
   */
  async seedTestData(): Promise<Product[]> {
    // Nejprve zkontrolujeme, zda již existují nějaké produkty
    const existingCount = await this.repository.count();
    if (existingCount > 0) {
      console.log("Databáze již obsahuje produkty, přeskakuji seed.");
      return [];
    }

    const currentDate = new Date();
    
    // Vytvoření testovacích produktů
    const testProducts: CreateProductDto[] = [
      {
        name: "iPhone 15 Pro",
        description: "Nejnovější model iPhonu s čipem A17 Pro",
        category: "Elektronika",
        subCategory: "Mobilní telefony",
        price: 34990,
        stock: 50,
        width: 7.15,
        height: 14.65,
        depth: 0.83,
        weight: 0.187,
        color: "Černá",
        manufacturer: "Apple",
        sku: "APL-IP15PRO-256-BLK",
        isActive: true,
        manufactureDate: new Date(2023, 8, 1), // 1. září 2023
        stockedDate: new Date(2023, 8, 22), // 22. září 2023
        expiryDate: new Date(2028, 8, 1) // 1. září 2028
      },
      {
        name: "Samsung Galaxy S23 Ultra",
        description: "Vlajková loď Samsung s 200MP fotoaparátem",
        category: "Elektronika",
        subCategory: "Mobilní telefony",
        price: 31990,
        stock: 35,
        width: 7.81,
        height: 16.33,
        depth: 0.89,
        weight: 0.234,
        color: "Zelená",
        manufacturer: "Samsung",
        sku: "SAMS-S23U-512-GRN",
        isActive: true,
        manufactureDate: new Date(2023, 0, 15), // 15. ledna 2023
        stockedDate: new Date(2023, 1, 5) // 5. února 2023
      },
      {
        name: "MacBook Pro 16",
        description: "Výkonný notebook s čipem M2 Pro pro profesionály",
        category: "Elektronika",
        subCategory: "Notebooky",
        price: 64990,
        stock: 20,
        width: 35.57,
        height: 1.68,
        depth: 24.81,
        weight: 2.15,
        color: "Stříbrná",
        manufacturer: "Apple",
        sku: "APL-MBP16-M2P-16-SLV",
        isActive: true,
        manufactureDate: new Date(2023, 5, 10) // 10. června 2023
      },
      {
        name: "Sony PlayStation 5",
        description: "Herní konzole nové generace",
        category: "Elektronika",
        subCategory: "Herní konzole",
        price: 14490,
        stock: 15,
        width: 26.0,
        height: 39.0,
        depth: 10.4,
        weight: 4.5,
        color: "Bílá",
        manufacturer: "Sony",
        sku: "SNY-PS5-825-WHT",
        isActive: true
      },
      {
        name: "Staré zboží",
        description: "Tento produkt již není v nabídce",
        category: "Ostatní",
        subCategory: "Zboží k likvidaci",
        price: 99,
        stock: 5,
        isActive: false,
        manufactureDate: new Date(2020, 1, 1), // 1. února 2020
        expiryDate: new Date(2021, 1, 1) // 1. února 2021 (prošlé)
      }
    ];
    
    // Uložení testovacích dat do databáze
    return await this.createBulk(productsDto);
  }
}

export const productService = new ProductService();