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
  Route, 
  Security, 
  SuccessResponse, 
  Tags,
  Request  // Přidejte tento import
} from "tsoa";
  import { Product } from "../models/Product";
  import { CreateProductDto, UpdateProductDto, ProductDto } from "../models/dto/ProductDto";
  import { productService } from "../services/productService";
  import { ComparisonOperator, Filter, LogicalOperator, SortDirection, SortOption } from "../types/filters";
  
  @Route("products")
  @Tags("Products")
  export class ProductController extends Controller {
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
  // Explicitní typové přetypování
  const queryOptions = (req as any).queryOptions || {};
  
  const result = await productService.findAll(queryOptions);

  // Mapování entit na DTO
  const products: ProductDto[] = result.data.map(this.mapProductToDto);

  return {
    data: products,
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };
}
  
    /**
     * Získá detail produktu podle ID
     * @param productId ID produktu
     */
    @Get("{productId}")
    public async getProduct(@Path() productId: number): Promise<ProductDto> {
      const product = await productService.findById(productId);
      if (!product) {
        this.setStatus(404);
        throw new Error("Produkt nebyl nalezen");
      }
  
      return this.mapProductToDto(product);
    }
  
    /**
     * Vytvoří nový produkt
     * @param requestBody Data pro vytvoření produktu
     */
    @Post()
    @SuccessResponse("201", "Created")
    public async createProduct(@Body() requestBody: CreateProductDto): Promise<ProductDto> {
      const product = await productService.create(requestBody);
      this.setStatus(201);
      return this.mapProductToDto(product);
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
      const product = await productService.update(productId, requestBody);
      return this.mapProductToDto(product);
    }
  
    /**
     * Smaže produkt podle ID
     * @param productId ID produktu
     */
    @Delete("{productId}")
    @Security("jwt")
    public async deleteProduct(@Path() productId: number): Promise<void> {
      const success = await productService.delete(productId);
      if (!success) {
        this.setStatus(404);
        throw new Error("Produkt nebyl nalezen");
      }
    }
  
    /**
     * Naplní databázi testovacími daty pro testování filtrů
     */
    @Post("seed")
    @SuccessResponse("201", "Test data created")
    public async seedTestData(): Promise<{ message: string; count: number }> {
      const products = await productService.seedTestData();
      this.setStatus(201);
      return {
        message: `Bylo vytvořeno ${products.length} testovacích produktů`,
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
      const result = await productService.findAll(queryOptions);
  
      // Mapování entit na DTO
      const products: ProductDto[] = result.data.map(this.mapProductToDto);
  
      return {
        data: products,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      };
    }
  
    /**
     * Mapuje entitu Product na ProductDto
     */
    private mapProductToDto(product: Product): ProductDto {
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