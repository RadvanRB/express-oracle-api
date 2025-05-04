import * as express from 'express';
import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  Path, 
  Post, 
  Put, 
  Request, 
  Route, 
  Security, 
  SuccessResponse, 
  Tags 
} from "tsoa";

import { Product } from "../models/Product";
import { CreateProductDto, UpdateProductDto, ProductDto } from "../models/dto/ProductDto";
import { productService } from "../services/productService";
import { AbstractController } from "./AbstractController";

/**
 * Ukázková implementace generického controlleru pro produkt
 * 
 * Tato třída rozšiřuje AbstractController a poskytuje konkrétní implementaci pro entity Product
 */
@Route("products-generic")
@Tags("Products Generic")
export class ProductControllerGeneric extends AbstractController<
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductDto
> {
  constructor() {
    // Předání service a názvu entity do abstraktního controlleru
    super(productService, "Produkt");
  }

  /**
   * Získá seznam všech produktů s podporou filtrování a stránkování
   * Podporuje generické filtry ve formátu field@operator=value
   * 
   * Příklady:
   * - manufactureDate@AFTER=2023-01-01T00:00:00.000Z
   * - price@BETWEEN=1000,5000
   * - manufacturer@IN=Apple,Samsung,Sony
   * - name@ILIKE=iPhone
   */
  @Get()
  public async getProducts(
    @Request() req: express.Request
  ): Promise<{
    data: ProductDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Využití getAll metody z AbstractController
    return this.getAll(req);
  }

  /**
   * Získá detail produktu podle ID
   * @param productId ID produktu
   */
  @Get("{productId}")
  public async getProduct(@Path() productId: number): Promise<ProductDto> {
    // Využití getById metody z AbstractController
    return this.getById(productId);
  }

  /**
   * Vytvoří nový produkt
   * @param requestBody Data pro vytvoření produktu
   */
  @Post()
  @SuccessResponse("201", "Created")
  public async createProduct(@Body() requestBody: CreateProductDto): Promise<ProductDto> {
    // Využití create metody z AbstractController
    return this.create(requestBody);
  }

  /**
   * Aktualizuje existující produkt
   * @param productId ID produktu
   * @param requestBody Data pro aktualizaci produktu
   */
  @Put("{productId}")
  public async updateProduct(
    @Path() productId: number,
    @Body() requestBody: UpdateProductDto
  ): Promise<ProductDto> {
    // Využití update metody z AbstractController
    return this.update(productId, requestBody);
  }

  /**
   * Smaže produkt podle ID
   * @param productId ID produktu
   */
  @Delete("{productId}")
  @Security("jwt")
  public async deleteProduct(@Path() productId: number): Promise<void> {
    // Využití delete metody z AbstractController
    return this.delete(productId);
  }

  /**
   * Vrátí seznam dostupných operátorů pro filtrování
   */
  @Get("filter-operators")
  public async getAvailableFilterOperators(): Promise<Record<string, string>> {
    // Využití getFilterOperators metody z AbstractController
    return this.getFilterOperators();
  }

  /**
   * Naplní databázi testovacími daty pro testování filtrů
   */
  @Post("seed")
  @SuccessResponse("201", "Test data created")
  public async seedTestData(): Promise<{ message: string; count: number }> {
    // Tato metoda není v abstraktním controlleru, proto ji implementujeme přímo
    const products = await (this.service as typeof productService).seedTestData();
    this.setStatus(201);
    return {
      message: `Bylo vytvořeno ${products.length} testovacích produktů`,
      count: products.length
    };
  }

  /**
   * Implementace abstraktní metody mapToDto
   * Mapuje entitu Product na ProductDto
   */
  protected mapToDto(product: Product): ProductDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      subCategory: product.subCategory,
      price: product.price,
      stock: product.stock,
      width: product.width,
      height: product.height,
      depth: product.depth,
      weight: product.weight,
      color: product.color,
      manufacturer: product.manufacturer,
      sku: product.sku,
      isActive: product.isActive,
      manufactureDate: product.manufactureDate,
      expiryDate: product.expiryDate,
      stockedDate: product.stockedDate,
      lastSoldDate: product.lastSoldDate,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}