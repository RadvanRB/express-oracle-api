import * as express from 'express';
import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  Hidden,
  Path, 
  Post, 
  Put,
  Request, 
  Route, 
  Tags 
} from "tsoa";

import { Product } from "../models/Product";
import { CreateProductDto, UpdateProductDto, ProductDto } from "../models/dto/ProductDto";
import { productService } from "../services/productService";
import { AbstractController } from "./AbstractController";

/**
 * Ukázkový controller s použitím Hidden dekorátoru
 * 
 * Tento controller dědí z AbstractController a implementuje všechny metody,
 * ale používá dekorátor @Hidden() k vyloučení některých metod z API dokumentace.
 */
@Route("products-hidden")
@Tags("Products Hidden")
export class ExampleHiddenController extends AbstractController<
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
   * 
   * Tato metoda je dekorována pomocí @Get(), takže bude zahrnuta v API dokumentaci
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
   * 
   * Tato metoda je dekorována pomocí @Get(), takže bude zahrnuta v API dokumentaci
   */
  @Get("{productId}")
  public async getProduct(@Path() productId: number): Promise<ProductDto> {
    // Využití getById metody z AbstractController
    return this.getById(productId);
  }

  /**
   * Vytvoří nový produkt
   * 
   * Tato metoda je dekorována pomocí @Post(), takže bude zahrnuta v API dokumentaci
   */
  @Post()
  public async createProduct(@Body() requestBody: CreateProductDto): Promise<ProductDto> {
    // Využití create metody z AbstractController
    return this.create(requestBody);
  }

  /**
   * Aktualizuje existující produkt
   * 
   * Tato metoda je dekorována pomocí @Put(), ale také pomocí @Hidden(),
   * takže nebude zahrnuta v API dokumentaci, i když je plně implementována
   */
  @Put("{productId}")
  @Hidden()
  public async updateProduct(
    @Path() productId: number,
    @Body() requestBody: UpdateProductDto
  ): Promise<ProductDto> {
    // Využití update metody z AbstractController
    return this.update(productId, requestBody);
  }

  /**
   * Smaže produkt podle ID
   * 
   * Tato metoda je dekorována pomocí @Delete(), ale také pomocí @Hidden(),
   * takže nebude zahrnuta v API dokumentaci, i když je plně implementována
   */
  @Delete("{productId}")
  @Hidden()
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