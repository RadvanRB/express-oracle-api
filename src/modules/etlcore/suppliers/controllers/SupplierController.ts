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
@Route("etlcore/suppliers")
@Tags("etlcore - Suppliers")
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