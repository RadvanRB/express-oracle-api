import * as express from 'express';
import { 
  Body,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Request,
  Response,
  Route,
  Security,
  SuccessResponse,
  Tags
} from "tsoa";
import { ProductImage } from "../models/ProductImage";
import { CreateProductImageDto, UpdateProductImageDto, ProductImageDto } from "../models/dto/ProductImageDto";
import { getProductImageService } from "../services/productImageService";
import { AbstractController } from "../../../../controllers/AbstractController";
import { DbErrorResponse, isDbErrorResponse } from '../../../../services/AbstractService';

/**
 * Controller pro správu obrázků produktů
 */
@Route("product-images")
@Tags("Obrázky produktů")
export class ProductImageController extends AbstractController<
  ProductImage,
  CreateProductImageDto,
  UpdateProductImageDto,
  ProductImageDto
> {
  private productImageService = getProductImageService();

  constructor() {
    super(getProductImageService(), "Obrázek produktu");
  }

  /**
   * Získá seznam všech obrázků produktů s podporou filtrování, řazení a stránkování
   */
  @Get()
  public async getProductImages(
    @Request() req: express.Request
  ): Promise<{
    data: ProductImageDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await this.getAll(req);
  }

  /**
   * Získá obrázek produktu podle ID
   * @param id ID obrázku
   */
  @Get("{id}")
  public async getProductImage(
    @Path() id: number
  ): Promise<ProductImageDto> {
    return await this.getById(id);
  }

  /**
   * Vytvoří nový obrázek produktu
   * @param requestBody Data pro vytvoření obrázku
   */
  @Post()
  @SuccessResponse("201", "Created")
  public async createProductImage(
    @Body() requestBody: CreateProductImageDto
  ): Promise<ProductImageDto> {
    this.setStatus(201);
    return await this.create(requestBody);
  }

  /**
   * Aktualizuje existující obrázek produktu
   * @param id ID obrázku
   * @param requestBody Data pro aktualizaci obrázku
   */
  @Put("{id}")
  public async updateProductImage(
    @Path() id: number,
    @Body() requestBody: UpdateProductImageDto
  ): Promise<ProductImageDto> {
    return await this.update(id, requestBody);
  }

  /**
   * Odstraní obrázek produktu
   * @param id ID obrázku
   */
  @Delete("{id}")
  public async deleteProductImage(
    @Path() id: number
  ): Promise<void> {
    await this.delete(id);
  }

  /**
   * Získá všechny obrázky pro konkrétní produkt
   * @param productId ID produktu
   */
  @Get("product/{productId}")
  @Response<DbErrorResponse>(500, 'Chyba při načítání obrázků produktu')
  public async getProductImagesByProductId(
    @Path() productId: number
  ): Promise<ProductImageDto[]> {
    const result = await this.productImageService.getProductImages(productId);
    
    if (isDbErrorResponse(result)) {
      this.setStatus(500);
      throw new Error(result.message);
    }

    if (!result.data) {
      return [];
    }
    
    return result.data.map(image => this.mapToDto(image));
  }

  /**
   * Získá hlavní obrázek produktu
   * @param productId ID produktu
   */
  @Get("product/{productId}/main")
  @Response<DbErrorResponse>(500, 'Chyba při načítání hlavního obrázku produktu')
  public async getMainProductImage(
    @Path() productId: number
  ): Promise<ProductImageDto | null> {
    const result = await this.productImageService.getMainImage(productId);
    
    if (isDbErrorResponse(result)) {
      this.setStatus(500);
      throw new Error(result.message);
    }

    if (!result.data) {
      return null;
    }
    
    return this.mapToDto(result.data);
  }

  /**
   * Nastaví obrázek jako hlavní pro konkrétní produkt
   * @param id ID obrázku
   * @param productId ID produktu
   */
  @Put("{id}/main/product/{productId}")
  @Response<DbErrorResponse>(500, 'Chyba při nastavování hlavního obrázku')
  @Response<DbErrorResponse>(404, 'Obrázek nebyl nalezen')
  @SuccessResponse(200, 'Obrázek byl nastaven jako hlavní')
  public async setMainImage(
    @Path() id: number,
    @Path() productId: number
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.productImageService.setMainImage(id, productId);
    
    if (isDbErrorResponse(result)) {
      if (result.error === 'Not found') {
        this.setStatus(404);
      } else {
        this.setStatus(500);
      }
      throw new Error(result.message);
    }
    
    return { 
      success: true, 
      message: `Obrázek s ID ${id} byl nastaven jako hlavní pro produkt ${productId}` 
    };
  }

  /**
   * Aktualizuje pořadí zobrazení obrázků
   * @param imageIds Pole ID obrázků v požadovaném pořadí zobrazení
   */
  @Put("sort-order")
  @Response<DbErrorResponse>(500, 'Chyba při aktualizaci pořadí obrázků')
  @SuccessResponse(200, 'Pořadí obrázků úspěšně aktualizováno')
  public async updateSortOrder(
    @Body() requestBody: { imageIds: number[] }
  ): Promise<{ success: boolean; message: string }> {
    const { imageIds } = requestBody;
    
    // Kontrola, zda imageIds je pole čísel
    if (!Array.isArray(imageIds) || imageIds.some(id => typeof id !== 'number')) {
      this.setStatus(400);
      throw new Error('imageIds musí být pole čísel');
    }
    
    const result = await this.productImageService.updateSortOrder(imageIds);
    
    if (isDbErrorResponse(result)) {
      this.setStatus(500);
      throw new Error(result.message);
    }
    
    return { 
      success: true, 
      message: 'Pořadí zobrazení obrázků bylo úspěšně aktualizováno' 
    };
  }

  /**
   * Seedování testovacích dat obrázků produktů
   */
  @Post("seed")
  @Response<DbErrorResponse>(500, 'Chyba při seedování testovacích dat')
  @SuccessResponse(201, 'Testovací data úspěšně seedována')
  public async seedTestData(): Promise<{ success: boolean; message: string }> {
    const result = await this.productImageService.seedTestData();
    
    if (isDbErrorResponse(result)) {
      this.setStatus(500);
      throw new Error(result.message);
    }
    
    this.setStatus(201);
    return { 
      success: true, 
      message: result.message || 'Testovací data úspěšně seedována' 
    };
  }

  /**
   * Mapuje entitu ProductImage na ProductImageDto
   */
  protected mapToDto(productImage: ProductImage): ProductImageDto {
    return {
      id: productImage.id,
      productId: productImage.productId,
      url: productImage.url,
      title: productImage.title,
      altText: productImage.altText,
      sortOrder: productImage.sortOrder,
      width: productImage.width,
      height: productImage.height,
      imageType: productImage.imageType,
      // Dočasně nastaveno na false, dokud nebude přidán sloupec is_main do databáze
      // Viz SQL skript v docs/product-images-migration.md
      isMain: productImage.isMain ?? (productImage.imageType === 'main'),
      createdAt: productImage.createdAt,
      updatedAt: productImage.updatedAt
    };
  }
}