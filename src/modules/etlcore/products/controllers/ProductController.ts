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
import { Product } from "../models/Product";
import { CreateProductDto, UpdateProductDto, ProductDto } from "../models/dto/ProductDto";
import { getProductService } from "../services/productService";
import { ComparisonOperator, Filter, LogicalOperator, SortDirection, SortOption } from "../../../../types/filters";
import { AbstractController } from "../../../../controllers/AbstractController";
import { isDbErrorResponse } from '../../../../services/AbstractService';

@Route("products")
@Tags("Products")
export class ProductController extends AbstractController<
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductDto
> {
  private productService = getProductService();

  constructor() {
    super(getProductService(), "Produkt");
  }

  /**
   * Získá seznam všech produktů s podporou filtrování, řazení a stránkování
   * Podporuje generické filtry ve formátu field@operator=value
   * Např. /products?price@GT=1000&price@LT=5000
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
    return await this.getAll(req);
  }

  /**
   * Naplní databázi testovacími daty pro testování filtrů
   */
  @Post("seed")
  @SuccessResponse("201", "Test data created")
  public async seedTestData(): Promise<{ message: string; count: number }> {
    const products = await this.productService.seedTestData();
    if (isDbErrorResponse(products)) {
      this.setStatus(500);
      return {
        message: "Chyba při vytváření testovacích produktů",
        count: 0
      };
    }
    this.setStatus(201);
    return {
      message: `Bylo vytvořeno ${products} testovacích produktů`,
      count: products.length
    };
  }

  /**
   * Pokročilý filtr pro produkty - demonstrace komplexního filtrování
   */
  @Post("advanced-filter")
  public async advancedFilter(
    @Body() filterOptions: {
      priceRange?: { min?: number; max?: number };
      categories?: string[];
      manufacturers?: string[];
      dateFilters?: {
        manufacturedAfter?: string;
        manufacturedBefore?: string;
        expiryDateAfter?: string;
        expiryDateBefore?: string;
        stockedDateAfter?: string;
        stockedDateBefore?: string;
      };
      dimensions?: {
        maxWidth?: number;
        maxHeight?: number;
        maxDepth?: number;
        maxWeight?: number;
      };
      searchText?: string;
      inStock?: boolean;
      isActive?: boolean;
      page?: number;
      limit?: number;
      sort?: { field: string; direction: string }[];
    }
  ): Promise<{
    data: ProductDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const filters: any[] = [];
    const {
      priceRange,
      categories,
      manufacturers,
      dateFilters,
      dimensions,
      searchText,
      inStock,
      isActive,
      page = 1,
      limit = 10,
      sort
    } = filterOptions;

    // Filtrování podle rozsahu ceny
    if (priceRange) {
      if (priceRange.min !== undefined) {
        filters.push({
          field: 'price',
          operator: ComparisonOperator.GTE,
          value: priceRange.min
        });
      }
      if (priceRange.max !== undefined) {
        filters.push({
          field: 'price',
          operator: ComparisonOperator.LTE,
          value: priceRange.max
        });
      }
    }

    // Filtrování podle kategorií (OR)
    if (categories && categories.length > 0) {
      filters.push({
        field: 'category',
        operator: ComparisonOperator.IN,
        value: categories
      });
    }

    // Filtrování podle výrobců (OR)
    if (manufacturers && manufacturers.length > 0) {
      filters.push({
        field: 'manufacturer',
        operator: ComparisonOperator.IN,
        value: manufacturers
      });
    }

    // Filtrování podle datumů
    if (dateFilters) {
      // Datum výroby
      if (dateFilters.manufacturedAfter) {
        filters.push({
          field: 'manufactureDate',
          operator: ComparisonOperator.DATE_AFTER,
          value: new Date(dateFilters.manufacturedAfter)
        });
      }
      if (dateFilters.manufacturedBefore) {
        filters.push({
          field: 'manufactureDate',
          operator: ComparisonOperator.DATE_BEFORE,
          value: new Date(dateFilters.manufacturedBefore)
        });
      }

      // Datum expirace
      if (dateFilters.expiryDateAfter) {
        filters.push({
          field: 'expiryDate',
          operator: ComparisonOperator.DATE_AFTER,
          value: new Date(dateFilters.expiryDateAfter)
        });
      }
      if (dateFilters.expiryDateBefore) {
        filters.push({
          field: 'expiryDate',
          operator: ComparisonOperator.DATE_BEFORE,
          value: new Date(dateFilters.expiryDateBefore)
        });
      }

      // Datum naskladnění
      if (dateFilters.stockedDateAfter) {
        filters.push({
          field: 'stockedDate',
          operator: ComparisonOperator.DATE_AFTER,
          value: new Date(dateFilters.stockedDateAfter)
        });
      }
      if (dateFilters.stockedDateBefore) {
        filters.push({
          field: 'stockedDate',
          operator: ComparisonOperator.DATE_BEFORE,
          value: new Date(dateFilters.stockedDateBefore)
        });
      }
    }

    // Filtrování podle rozměrů
    if (dimensions) {
      if (dimensions.maxWidth !== undefined) {
        filters.push({
          field: 'width',
          operator: ComparisonOperator.LTE,
          value: dimensions.maxWidth
        });
      }
      if (dimensions.maxHeight !== undefined) {
        filters.push({
          field: 'height',
          operator: ComparisonOperator.LTE,
          value: dimensions.maxHeight
        });
      }
      if (dimensions.maxDepth !== undefined) {
        filters.push({
          field: 'depth',
          operator: ComparisonOperator.LTE,
          value: dimensions.maxDepth
        });
      }
      if (dimensions.maxWeight !== undefined) {
        filters.push({
          field: 'weight',
          operator: ComparisonOperator.LTE,
          value: dimensions.maxWeight
        });
      }
    }

    // Filtrování podle textu (název nebo popis obsahuje text)
    if (searchText) {
      filters.push({
        operator: LogicalOperator.OR,
        filters: [
          {
            field: 'name',
            operator: ComparisonOperator.ILIKE,
            value: searchText
          },
          {
            field: 'description',
            operator: ComparisonOperator.ILIKE,
            value: searchText
          }
        ]
      });
    }

    // Filtrování podle dostupnosti na skladě
    if (inStock !== undefined) {
      filters.push({
        field: 'stock',
        operator: inStock ? ComparisonOperator.GT : ComparisonOperator.EQ,
        value: inStock ? 0 : 0
      });
    }

    // Filtrování podle aktivity
    if (isActive !== undefined) {
      filters.push({
        field: 'isActive',
        operator: ComparisonOperator.EQ,
        value: isActive
      });
    }

    // Vytvoření finálního filtru s logickým operátorem AND
    let filter: Filter | undefined;
    if (filters.length > 0) {
      if (filters.length === 1) {
        filter = filters[0];
      } else {
        filter = {
          operator: LogicalOperator.AND,
          filters: filters
        };
      }
    }

    // Vytvoření QueryOptions pro repozitář
    // Upravíme sort, aby používal SortDirection enum
    const formattedSort = sort?.map(item => ({
      field: item.field,
      direction: item.direction.toLowerCase() === 'desc' ? SortDirection.DESC : SortDirection.ASC
    })) as SortOption[] | undefined;
    
    const queryOptions = {
      filter,
      sort: formattedSort,
      pagination: { page, limit }
    };

    // Získání dat z repozitáře
    const result = await this.productService.findAll(queryOptions);
    const validResult = this.handleDatabaseResult(result);

    // Mapování entit na DTO
    const products = validResult.data.map((entity: Product) => this.mapToDto(entity));

    return {
      data: products,
      total: validResult.total,
      page: validResult.page,
      limit: validResult.limit,
      totalPages: validResult.totalPages,
    };
  }

  /**
   * Mapuje entitu Product na ProductDto
   */
  protected mapToDto(product: Product): ProductDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      // Extrahujeme ID nebo název kategorie, pokud je dostupný, jinak použijeme categoryId jako string
      category: product.category ? product.category.name : product.categoryId ? product.categoryId.toString() : "",
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