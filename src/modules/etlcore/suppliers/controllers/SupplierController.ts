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
import { Supplier } from "../models/Supplier";
import { CreateSupplierDto, UpdateSupplierDto, SupplierDto } from "../models/dto/SupplierDto";
import { getSupplierService } from "../services/supplierService";
import { AbstractController } from "../../../../controllers/AbstractController";
import { isDbErrorResponse } from '../../../../services/AbstractService';

/**
 * Controller pro správu dodavatelů
 */
@Route("suppliers")
@Tags("Suppliers")
export class SupplierController extends AbstractController<
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierDto
> {
  private supplierService = getSupplierService();

  constructor() {
    super(getSupplierService(), "Dodavatel");
  }

  /**
   * Získá seznam všech dodavatelů s podporou filtrování, řazení a stránkování
   */
  @Get()
  public async getSuppliers(
    @Request() req: express.Request
  ): Promise<{
    data: SupplierDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await this.getAll(req);
  }

  /**
   * Získá dodavatele podle ID
   * @param id ID dodavatele
   */
  @Get("{id}")
  public async getSupplier(
    @Path() id: number
  ): Promise<SupplierDto> {
    return await this.getById(id);
  }

  /**
   * Vytvoří nového dodavatele
   * @param requestBody Data pro vytvoření dodavatele
   */
  @Post()
  @SuccessResponse("201", "Created")
  public async createSupplier(
    @Body() requestBody: CreateSupplierDto
  ): Promise<SupplierDto> {
    this.setStatus(201);
    return await this.create(requestBody);
  }

  /**
   * Aktualizuje existujícího dodavatele
   * @param id ID dodavatele
   * @param requestBody Data pro aktualizaci dodavatele
   */
  @Put("{id}")
  public async updateSupplier(
    @Path() id: number,
    @Body() requestBody: UpdateSupplierDto
  ): Promise<SupplierDto> {
    return await this.update(id, requestBody);
  }

  /**
   * Odstraní dodavatele
   * @param id ID dodavatele
   */
  @Delete("{id}")
  public async deleteSupplier(
    @Path() id: number
  ): Promise<void> {
    await this.delete(id);
  }

  /**
   * Naplní databázi testovacími daty dodavatelů
   */
  @Post("seed")
  @SuccessResponse("201", "Test data created")
  public async seedTestData(): Promise<{ message: string; count: number }> {
    const suppliers = await this.supplierService.seedTestData();
    if (isDbErrorResponse(suppliers)) {
      this.setStatus(500);
      return {
        message: "Chyba při vytváření testovacích dodavatelů",
        count: 0
      };
    }
    this.setStatus(201);
    return {
      message: `Bylo vytvořeno ${suppliers.length} testovacích dodavatelů`,
      count: suppliers.length
    };
  }

  /**
   * Získá pouze aktivní dodavatele
   */
  @Get("active")
  public async getActiveSuppliers(): Promise<SupplierDto[]> {
    const result = await this.supplierService.findActive();
    
    if (isDbErrorResponse(result)) {
      this.setStatus(500);
      throw new Error(result.message);
    }
    
    return result.map(entity => this.mapToDto(entity));
  }

  /**
   * Získá dodavatele podle země
   * @param country Země dodavatele
   */
  @Get("country/{country}")
  public async getSuppliersByCountry(
    @Path() country: string
  ): Promise<SupplierDto[]> {
    const result = await this.supplierService.findByCountry(country);
    
    if (isDbErrorResponse(result)) {
      this.setStatus(500);
      throw new Error(result.message);
    }
    
    return result.map(entity => this.mapToDto(entity));
  }

  /**
   * Mapuje entitu Supplier na SupplierDto
   */
  protected mapToDto(supplier: Supplier): SupplierDto {
    return {
      id: supplier.id,
      name: supplier.name,
      contactName: supplier.contactName,
      contactEmail: supplier.contactEmail,
      contactPhone: supplier.contactPhone,
      address: supplier.address,
      city: supplier.city,
      postalCode: supplier.postalCode,
      country: supplier.country,
      isActive: supplier.isActive,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt
    };
  }
}