import * as express from 'express';
import { 
  Body,
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
import { Category } from "../models/Category";
import { CreateCategoryDto, UpdateCategoryDto, CategoryDto } from "../models/dto/CategoryDto";
import { getCategoryService } from "../services/categoryService";
import { ComparisonOperator, Filter, LogicalOperator, SortDirection } from "../../../../types/filters";
import { AbstractController } from "../../../../controllers/AbstractController";
import { isDbErrorResponse } from '../../../../services/AbstractService';
import { EntityMetadata } from "../../../../types/metadata";

/**
 * Controller pro správu kategorií produktů
 */
@Route("etlcore/categories")
@Tags("ETLCore - Categories")
export class CategoryController extends AbstractController<
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryDto
> {
  private categoryService = getCategoryService();

  constructor() {
    super(getCategoryService(), "Kategorie");
  }

  /**
   * Získá seznam všech kategorií s podporou filtrování, řazení a stránkování
   */
  @Get()
  public async getCategories(
    @Request() req: express.Request
  ): Promise<{
    data: CategoryDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await this.getAll(req);
  }
  
  /**
   * Získá metadata entity kategorie
   * Vrací pouze sourceInfo a columnInfo bez přístupu k databázi
   */
  @Get("metadata")
  public async getCategoryMeta(): Promise<EntityMetadata> {
    return await this.getMeta();
  }

  /**
   * Získá kategorii podle ID
   * @param id ID kategorie
   */
  @Get("{id}")
  public async getCategory(
    @Path() id: number
  ): Promise<CategoryDto> {
    return await this.getById(id);
  }

  /**
   * Vytvoří novou kategorii
   * @param requestBody Data pro vytvoření kategorie
   */
  @Post()
  @SuccessResponse("201", "Created")
  public async createCategory(
    @Body() requestBody: CreateCategoryDto
  ): Promise<CategoryDto> {
    this.setStatus(201);
    return await this.create(requestBody);
  }

  /**
   * Aktualizuje existující kategorii
   * @param id ID kategorie
   * @param requestBody Data pro aktualizaci kategorie
   */
  @Put("{id}")
  public async updateCategory(
    @Path() id: number,
    @Body() requestBody: UpdateCategoryDto
  ): Promise<CategoryDto> {
    return await this.update(id, requestBody);
  }

  /**
   * Odstraní kategorii
   * @param id ID kategorie
   */
  @Delete("{id}")
  public async deleteCategory(
    @Path() id: number
  ): Promise<void> {
    await this.delete(id);
  }

  /**
   * Získá všechny podkategorie pro nadřazenou kategorii
   * @param parentId ID nadřazené kategorie
   */
  @Get("subcategories/{parentId}")
  public async getSubcategories(
    @Path() parentId: number
  ): Promise<CategoryDto[]> {
    const result = await this.categoryService.findByParentId(parentId);
    
    if (isDbErrorResponse(result)) {
      this.setStatus(500);
      throw new Error(result.message);
    }
    
    return result.map(entity => this.mapToDto(entity));
  }

  /**
   * Získá všechny kategorie na specifikované úrovni
   * @param level Úroveň kategorie v hierarchii (0 = kořenová kategorie)
   */
  @Get("level/{level}")
  public async getCategoriesByLevel(
    @Path() level: number
  ): Promise<CategoryDto[]> {
    const result = await this.categoryService.findByLevel(level);
    
    if (isDbErrorResponse(result)) {
      this.setStatus(500);
      throw new Error(result.message);
    }
    
    return result.map(entity => this.mapToDto(entity));
  }

  /**
   * Vytvoří testovací data kategorií na základě dat produktů
   * Automaticky extrahuje všechny kategorie a podkategorie z existujících produktů
   */
  @Post("seed")
  @SuccessResponse("200", "Seed completed")
  public async seedTestData(): Promise<{ success: boolean, message: string }> {
    try {
      const result = await this.categoryService.seedTestData();
      return result;
    } catch (error) {
      this.setStatus(500);
      return { 
        success: false, 
        message: `Chyba při seedování kategorií: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }


  /**
   * Mapuje entitu Category na CategoryDto
   */
  protected mapToDto(category: Category): CategoryDto {
    return {
      id: category.id,
      name: category.name,
      code: category.code,
      description: category.description,
      parentId: category.parentId,
      level: category.level,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    };
  }
}