import * as express from 'express';
import { 
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Query,
  Request,
  Route,
  SuccessResponse,
  Tags,
  Response
} from 'tsoa';
import { AbstractController } from '../../../../controllers/AbstractController';
import { getProductFeedService, ProductFeedService } from '../services/productFeedService';
import { CreateProductFeedDto, ProductFeedDto, UpdateProductFeedDto } from '../models/dto/ProductFeedDto';
import { ProductFeed } from '../models/ProductFeed';
import { isDbErrorResponse } from '../../../../services/AbstractService';

/**
 * Controller pro práci s datovými toky produktů
 * Demonstruje mezioborové vztahy entit (modul interfaces <-> modul etlcore)
 */
@Route("interfaces/productfeeds")
@Tags("Interfaces - ProductFeeds")
export class ProductFeedController extends AbstractController<
  ProductFeed,
  ProductFeedDto,
  CreateProductFeedDto,
  UpdateProductFeedDto
> {
  private feedService: ProductFeedService;

  /**
   * Konstruktor controlleru
   */
  constructor() {
    // Získání instance služby pomocí singleton vzoru
    const feedService = getProductFeedService();
    // Inicializace rodiče s instancí služby a názvem entity
    super(feedService, 'Datový tok');
    // Uložení reference na službu pro speciální metody
    this.feedService = feedService;
  }

  /**
   * Převod entity ProductFeed na DTO
   * @param feed Entita datového toku
   * @returns DTO reprezentace datového toku
   */
  protected mapToDto(feed: ProductFeed): ProductFeedDto {
    return this.feedService.mapToDto(feed);
  }

  /**
   * Získání všech datových toků produktů
   * @param req Express Request objekt pro filtrování a stránkování
   * @param isActive Filtrování podle aktivního stavu
   * @param format Filtrování podle formátu
   * @returns Seznam datových toků produktů s paginací
   */
  @Get()
  @Response("500", "Server error")
  public async getProductFeeds(
    @Request() req: express.Request,
    @Query() isActive?: boolean,
    @Query() format?: string
  ): Promise<{
    data: ProductFeedDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Pokud jsou specifikovány filtry, použijeme vlastní implementaci
    if (isActive !== undefined || format !== undefined) {
      const result = await this.feedService.findByParams({ isActive, format });
      
      if (isDbErrorResponse(result)) {
        this.setStatus(500);
        throw new Error(result.message);
      }
      
      // Kontrola, zda máme platná data
      if (!result.success || !result.data) {
        return {
          data: [],
          total: 0,
          page: 1,
          limit: 0,
          totalPages: 0
        };
      }
      
      return {
        data: result.data.map((feed: ProductFeed) => this.mapToDto(feed)) as ProductFeedDto[],
        total: result.total ?? 0,
        page: 1,
        limit: result.data.length || 0,
        totalPages: result.total && result.data.length ? Math.ceil(result.total / result.data.length) : 1
      };
    }
    
    // Pokud nejsou specifikovány žádné filtry, použijeme metodu getAll z AbstractController
    const result = await this.getAll(req);
    
    // Překonvertujeme data na správný typ
    return {
      ...result,
      data: result.data as unknown as ProductFeedDto[]
    };
  }

  /**
   * Získání konkrétního datového toku podle ID
   * @param id ID datového toku
   * @returns Datový tok nebo chybovou odpověď
   */
  @Get("{id}")
  @Response("404", "Not Found")
  @Response("500", "Server error")
  public async getProductFeed(
    @Path() id: number
  ): Promise<ProductFeedDto> {
    const result = await this.getById(id);
    return result as unknown as ProductFeedDto;
  }

  /**
   * Vytvoření nového datového toku
   * @param requestBody Data pro vytvoření datového toku
   * @returns Vytvořený datový tok nebo chybovou odpověď
   */
  @Post()
  @SuccessResponse("201", "Created")
  @Response("400", "Bad Request")
  @Response("500", "Server error")
  public async createProductFeed(
    @Body() requestBody: CreateProductFeedDto
  ): Promise<ProductFeedDto> {
    this.setStatus(201);
    const result = await this.feedService.createProductFeed(requestBody);
    
    if (isDbErrorResponse(result)) {
      this.setStatus(500);
      throw new Error(result.message);
    }
    
    if (!result.success || !result.data) {
      this.setStatus(400);
      throw new Error("Nepodařilo se vytvořit datový tok");
    }
    
    return this.mapToDto(result.data) as ProductFeedDto;
  }

  /**
   * Aktualizace existujícího datového toku
   * @param id ID datového toku
   * @param requestBody Data pro aktualizaci datového toku
   * @returns Aktualizovaný datový tok nebo chybovou odpověď
   */
  @Put("{id}")
  @Response("404", "Not Found")
  @Response("500", "Server error")
  public async updateProductFeed(
    @Path() id: number,
    @Body() requestBody: UpdateProductFeedDto
  ): Promise<ProductFeedDto> {
    const result = await this.feedService.updateProductFeed(id, requestBody);
    
    if (isDbErrorResponse(result)) {
      this.setStatus(500);
      throw new Error(result.message);
    }
    
    if (!result.success || !result.data) {
      this.setStatus(404);
      throw new Error(`Datový tok s ID ${id} nebyl nalezen`);
    }
    
    return this.mapToDto(result.data);
  }

  /**
   * Odstranění datového toku
   * @param id ID datového toku
   */
  @Delete("{id}")
  @Response("404", "Not Found")
  @Response("500", "Server error")
  public async deleteProductFeed(
    @Path() id: number
  ): Promise<void> {
    await this.delete(id);
  }

  /**
   * Získání produktů pro konkrétní datový tok
   * @param id ID datového toku
   * @returns Seznam produktů napojených na datový tok
   */
  @Get("{id}/products")
  @Response("404", "Not Found")
  @Response("500", "Server error")
  public async getProductsForFeed(
    @Path() id: number
  ): Promise<any[]> {
    const result = await this.feedService.getProductsForFeed(id);
    
    if (isDbErrorResponse(result)) {
      this.setStatus(500);
      throw new Error(result.message);
    }
    
    if (!result.success) {
      this.setStatus(404);
      throw new Error(`Datový tok s ID ${id} nebyl nalezen`);
    }
    
    return result.data || [];
  }

  /**
   * Přidání produktů k datovému toku
   * @param id ID datového toku
   * @param requestBody Pole ID produktů k přidání
   * @returns Výsledek operace
   */
  @Post("{id}/products")
  @Response("404", "Not Found")
  @Response("500", "Server error")
  public async addProductsToFeed(
    @Path() id: number,
    @Body() requestBody: { productIds: number[] }
  ): Promise<{ success: boolean, message: string }> {
    const result = await this.feedService.addProductsToFeed(id, requestBody.productIds);
    
    if (!result.success) {
      this.setStatus(result.error === "Not found" ? 404 : 500);
      return result;
    }
    
    return result;
  }

  /**
   * Aktualizace produktů v datovém toku (nahrazení stávajících)
   * @param id ID datového toku
   * @param requestBody Pole ID produktů
   * @returns Výsledek operace
   */
  @Put("{id}/products")
  @Response("404", "Not Found")
  @Response("500", "Server error")
  public async updateProductsInFeed(
    @Path() id: number,
    @Body() requestBody: { productIds: number[] }
  ): Promise<{ success: boolean, message: string }> {
    const result = await this.feedService.updateProductsInFeed(id, requestBody.productIds);
    
    if (!result.success) {
      this.setStatus(result.error === "Not found" ? 404 : 500);
      return result;
    }
    
    return result;
  }

  /**
   * Odstranění produktů z datového toku
   * @param id ID datového toku
   * @param requestBody Pole ID produktů k odstranění
   * @returns Výsledek operace
   */
  @Delete("{id}/products")
  @Response("404", "Not Found")
  @Response("500", "Server error")
  public async removeProductsFromFeed(
    @Path() id: number,
    @Body() requestBody: { productIds: number[] }
  ): Promise<{ success: boolean, message: string }> {
    const result = await this.feedService.removeProductsFromFeed(id, requestBody.productIds);
    
    if (!result.success) {
      this.setStatus(result.error === "Not found" ? 404 : 500);
      return result;
    }
    
    return result;
  }

  /**
   * Seedování testovacích dat datových toků
   * @returns Výsledek seedování
   */
  @Post("seed")
  @Response("500", "Server error")
  public async seedProductFeeds(): Promise<{ success: boolean, message: string }> {
    const result = await this.feedService.seedTestData();
    
    if (!result.success) {
      this.setStatus(500);
    }
    
    return result;
  }
}