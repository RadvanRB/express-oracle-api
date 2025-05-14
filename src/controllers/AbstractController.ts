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
  PrimaryKeyValue,
  DbErrorResponse,
  isDbErrorResponse
} from "../services/AbstractService";

import { 
  PaginatedResult 
} from "../types/filters";

import { EntityMetadata } from "../types/metadata";

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
   * Kontroluje výsledky databázových operací a propaguje případné chyby
   * @param result Výsledek databázové operace
   * @returns Originální výsledek, pokud není chyba
   * @throws DbErrorResponse v případě databázové chyby
   */
  protected handleDatabaseResult<T>(result: T | DbErrorResponse): T {
    if (isDbErrorResponse(result)) {
      // Propagace chyby pro zpracování v errorHandler middlewaru
      throw result;
    }
    return result;
  }

  /**
   * Získá seznam všech entit s podporou filtrování, řazení a stránkování
   * Podporuje dva formáty filtrů:
   * 1. Nový formát s podporou logických operátorů AND a OR: filter[field][operator]=value, filter[or][0][field][operator]=value, atd.
   * 2. Původní formát (zpětná kompatibilita): field@operator=value
   * Vrací také informace o zdroji dat včetně SQL dotazu pro debugging a audit
   */
  public async getAll(
    @Request() req: express.Request
  ): Promise<{
    data: TResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    source?: {
      sql: string;
    };
  }> {
    // Explicitní typové přetypování
    const queryOptions = (req as any).queryOptions || {};
    
    const result = await this.service.findAll(queryOptions);
    
    // Kontrola na chyby
    const validResult = this.handleDatabaseResult(result);

    // Mapování entit na DTO
    const dtos = validResult.data.map(entity => this.mapToDto(entity));

    return {
      data: dtos,
      total: validResult.total,
      page: validResult.page,
      limit: validResult.limit,
      totalPages: validResult.totalPages,
      source: validResult.source
    };
  }

  /**
   * Získá detail entity podle ID
   * @param id ID entity
   */
  public async getById(@Path() id: TPrimaryKey): Promise<TResponseDto> {
    const result = await this.service.findByPrimaryKey(id);
    
    // Kontrola na chyby
    const entity = this.handleDatabaseResult(result);
    
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
    const result = await this.service.createOne(requestBody);
    
    // Kontrola na chyby
    const entity = this.handleDatabaseResult(result);
    
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
    const result = await this.service.update(id, requestBody);
    
    // Kontrola na chyby
    const entity = this.handleDatabaseResult(result);
    
    return this.mapToDto(entity);
  }

  /**
   * Smaže entitu podle ID
   * @param id ID entity
   */
  public async delete(@Path() id: TPrimaryKey): Promise<void> {
    const result = await this.service.delete(id);
    
    // Kontrola na chyby
    const success = this.handleDatabaseResult(result);
    
    if (!success) {
      this.setStatus(404);
      throw new Error(`${this.entityName} nebyl nalezen`);
    }
  }

  /**
   * Získá metadata entity
   * Vrací pouze sourceInfo a columnInfo bez přístupu k databázi
   */
  public async getMeta(): Promise<EntityMetadata> {
    const result = await this.service.getMeta();
    return {
      sourceInfo: result.sourceInfo,
      columnInfo: result.columnInfo
    };
  }

  /**
   * Vrátí popis dostupných filtračních operátorů
   * Tuto metodu lze volat pro zobrazení dokumentace filtrů v API
   */
  public getFilterOperators(): Record<string, string> {
    return {
      "eq": "Rovná se (nový formát: filter[field][eq]=value, původní: field@eq=value)",
      "ne": "Nerovná se (nový formát: filter[field][ne]=value, původní: field@ne=value)",
      "gt": "Větší než (nový formát: filter[field][gt]=10, původní: field@gt=10)",
      "gte": "Větší nebo rovno (nový formát: filter[field][gte]=10, původní: field@gte=10)",
      "lt": "Menší než (nový formát: filter[field][lt]=10, původní: field@lt=10)",
      "lte": "Menší nebo rovno (nový formát: filter[field][lte]=10, původní: field@lte=10)",
      "like": "Obsahuje - case sensitive (nový formát: filter[field][like]=text, původní: field@like=text)",
      "ilike": "Obsahuje - case insensitive (nový formát: filter[field][ilike]=text, původní: field@ilike=text)",
      "in": "Je v seznamu hodnot (nový formát: filter[field][in]=value1,value2,value3, původní: field@in=value1,value2,value3)",
      "not_in": "Není v seznamu hodnot (nový formát: filter[field][not_in]=value1,value2, původní: field@not_in=value1,value2)",
      "is_null": "Je NULL (nový formát: filter[field][is_null]=true, původní: field@is_null)",
      "is_not_null": "Není NULL (nový formát: filter[field][is_not_null]=true, původní: field@is_not_null)",
      "date_eq": "Datum se rovná - ignoruje čas (nový formát: filter[field][date_eq]=2023-01-01, původní: field@date_eq=2023-01-01)",
      "date_ne": "Datum se nerovná - ignoruje čas (nový formát: filter[field][date_ne]=2023-01-01, původní: field@date_ne=2023-01-01)",
      "date_before": "Datum je před (nový formát: filter[field][date_before]=2023-01-01, původní: field@date_before=2023-01-01)",
      "date_after": "Datum je po (nový formát: filter[field][date_after]=2023-01-01, původní: field@date_after=2023-01-01)",
      "date_between": "Datum je mezi dvěma daty (nový formát: filter[field][date_between]=2023-01-01,2023-01-31, původní: field@date_between=2023-01-01,2023-01-31)",
      "date_not_between": "Datum není mezi dvěma daty (nový formát: filter[field][date_not_between]=2023-01-01,2023-01-31, původní: field@date_not_between=2023-01-01,2023-01-31)",
    };
  }

  /**
   * Vrátí popis podpory logických operátorů ve filtrech (pouze nový formát)
   * Tato metoda poskytuje informace o tom, jak používat logické operátory AND a OR ve filtrech
   */
  public getLogicalOperatorsInfo(): Record<string, string> {
    return {
      "Jednoduchý filtr": "filter[pole][operator]=hodnota (např. filter[name][eq]=Test)",
      "Logický operátor OR": "filter[or][0][pole1][operator]=hodnota1&filter[or][1][pole2][operator]=hodnota2",
      "Logický operátor AND": "filter[and][0][pole1][operator]=hodnota1&filter[and][1][pole2][operator]=hodnota2",
      "Vnořený OR v AND": "filter[and][0][pole1][operator]=hodnota1&filter[and][1][or][0][pole2][operator]=hodnota2&filter[and][1][or][1][pole3][operator]=hodnota3",
      "Vnořený AND v OR": "filter[or][0][pole1][operator]=hodnota1&filter[or][1][and][0][pole2][operator]=hodnota2&filter[or][1][and][1][pole3][operator]=hodnota3",
      "Dokumentace": "Podrobná dokumentace filtrů je k dispozici v souboru src/docs/filter-usage.md"
    };
  }

  /**
   * Vrátí popis dostupných parametrů pro stránkování a řazení
   */
  public getPaginationAndSortInfo(): Record<string, string> {
    return {
      "page": "Číslo stránky (např. ?page=2)",
      "limit": "Počet záznamů na stránku (např. ?limit=20)",
      "sort": "Nový formát řazení (např. ?sort=name:asc,price:desc)",
      "sortBy": "Původní formát: pole pro řazení (např. ?sortBy=name)",
      "sortDirection": "Původní formát: směr řazení - asc nebo desc (např. ?sortDirection=desc)"
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