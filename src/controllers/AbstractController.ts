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
  SuccessResponse 
} from "tsoa";

import { ObjectLiteral } from "typeorm";

import { 
  AbstractService, 
  PrimaryKeyValue 
} from "../services/AbstractService";

import { 
  PaginatedResult 
} from "../types/filters";

/**
 * Abstraktní controller poskytující základní CRUD operace
 * Generický na typ entity, create DTO, update DTO a response DTO
 * 
 * @template TEntity - Typ entity
 * @template TCreateDto - Typ pro vytvoření entity
 * @template TUpdateDto - Typ pro aktualizaci entity
 * @template TResponseDto - Typ pro odpověď (DTO)
 * @template TPrimaryKey - Typ primárního klíče (string, number nebo složený klíč)
 */
export abstract class AbstractController<
  TEntity extends ObjectLiteral,
  TCreateDto,
  TUpdateDto,
  TResponseDto,
  TPrimaryKey extends PrimaryKeyValue = number
> extends Controller {
  
  /**
   * Service pro manipulaci s danou entitou
   */
  protected readonly service: AbstractService<TEntity>;
  
  /**
   * Název entity pro použití v chybových hláškách
   */
  protected readonly entityName: string;
  
  /**
   * Vytvoří novou instanci abstraktního controlleru
   * 
   * @param service Service pro manipulaci s entitami
   * @param entityName Název entity pro použití v chybových hláškách (např. "produkt", "uživatel")
   */
  constructor(service: AbstractService<TEntity>, entityName: string) {
    super();
    this.service = service;
    this.entityName = entityName;
  }

  /**
   * Získá seznam všech entit s podporou filtrování, řazení a stránkování
   * Podporuje generické filtry ve formátu field@operator=value
   */
  public async getAll(
    @Request() req: express.Request
  ): Promise<{
    data: TResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Explicitní typové přetypování
    const queryOptions = (req as any).queryOptions || {};
    
    const result = await this.service.findAll(queryOptions);

    // Mapování entit na DTO
    const dtos = result.data.map(entity => this.mapToDto(entity));

    return {
      data: dtos,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  /**
   * Získá detail entity podle ID
   * @param id ID entity
   */
  public async getById(@Path() id: TPrimaryKey): Promise<TResponseDto> {
    const entity = await this.service.findByPrimaryKey(id);
    if (!entity) {
      this.setStatus(404);
      throw new Error(`${this.entityName} nebyl nalezen`);
    }

    return this.mapToDto(entity);
  }

  /**
   * Vytvoří novou entitu
   * @param requestBody Data pro vytvoření entity
   */
  @SuccessResponse("201", "Created")
  public async create(@Body() requestBody: TCreateDto): Promise<TResponseDto> {
    const entity = await this.service.createOne(requestBody);
    this.setStatus(201);
    return this.mapToDto(entity);
  }

  /**
   * Aktualizuje existující entitu
   * @param id ID entity
   * @param requestBody Data pro aktualizaci entity
   */
  public async update(
    @Path() id: TPrimaryKey,
    @Body() requestBody: TUpdateDto
  ): Promise<TResponseDto> {
    const entity = await this.service.update(id, requestBody);
    return this.mapToDto(entity);
  }

  /**
   * Smaže entitu podle ID
   * @param id ID entity
   */
  public async delete(@Path() id: TPrimaryKey): Promise<void> {
    const success = await this.service.delete(id);
    if (!success) {
      this.setStatus(404);
      throw new Error(`${this.entityName} nebyl nalezen`);
    }
  }

  /**
   * Vrátí popis dostupných filtračních operátorů
   * Tuto metodu lze volat pro zobrazení dokumentace filtrů v API
   */
  public getFilterOperators(): Record<string, string> {
    return {
      "eq": "Rovná se (např. field@eq=value)",
      "ne": "Nerovná se (např. field@ne=value)",
      "gt": "Větší než (např. field@gt=10)",
      "gte": "Větší nebo rovno (např. field@gte=10)",
      "lt": "Menší než (např. field@lt=10)",
      "lte": "Menší nebo rovno (např. field@lte=10)",
      "like": "Obsahuje - case sensitive (např. field@like=text)",
      "ilike": "Obsahuje - case insensitive (např. field@ilike=text)",
      "in": "Je v seznamu hodnot (např. field@in=value1,value2,value3)",
      "not_in": "Není v seznamu hodnot (např. field@not_in=value1,value2)",
      "is_null": "Je NULL (např. field@is_null)",
      "is_not_null": "Není NULL (např. field@is_not_null)",
      "date_eq": "Datum se rovná - ignoruje čas (např. date@date_eq=2023-01-01)",
      "date_ne": "Datum se nerovná - ignoruje čas (např. date@date_ne=2023-01-01)",
      "date_before": "Datum je před (např. date@date_before=2023-01-01)",
      "date_after": "Datum je po (např. date@date_after=2023-01-01)",
      "date_between": "Datum je mezi dvěma daty (např. date@date_between=2023-01-01,2023-01-31)",
      "date_not_between": "Datum není mezi dvěma daty (např. date@date_not_between=2023-01-01,2023-01-31)",
    };
  }

  /**
   * Vrátí popis dostupných parametrů pro stránkování a řazení
   */
  public getPaginationAndSortInfo(): Record<string, string> {
    return {
      "page": "Číslo stránky (např. ?page=2)",
      "limit": "Počet záznamů na stránku (např. ?limit=20)",
      "sortBy": "Pole pro řazení (např. ?sortBy=name)",
      "sortDirection": "Směr řazení - asc nebo desc (např. ?sortDirection=desc)"
    };
  }

  /**
   * Mapuje entitu na DTO objekt
   * Tuto metodu je nutné implementovat v odvozené třídě
   * 
   * @param entity Entity pro mapování
   * @returns DTO objekt
   */
  protected abstract mapToDto(entity: TEntity): TResponseDto;
}