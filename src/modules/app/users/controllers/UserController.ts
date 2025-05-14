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
  } from "tsoa";
  import { User } from "../models/User";
  import { CreateUserDto, UpdateUserDto, UserDto } from "../models/dto/UserDto";
  import { getUserService } from "../services/userService";
  import { isDbErrorResponse } from "../../../../services/AbstractService";
  
  @Route("users")
  @Tags("Users")
  export class UserController extends Controller {
    private userService = getUserService();
    /**
     * Získá seznam všech uživatelů s filtrováním a stránkováním
     * @param page Číslo stránky
     * @param limit Počet záznamů na stránku
     * @param firstName Filtr podle jména
     * @param lastName Filtr podle příjmení
     * @param email Filtr podle emailu
     */
    @Get()
    public async getUsers(
      @Query() page = 1,
      @Query() limit = 10,
      @Query() firstName?: string,
      @Query() lastName?: string,
      @Query() email?: string
    ): Promise<{
      data: UserDto[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }> {
      // Vytvoření filtru pro userService
      const filter: any = {};
      if (firstName) filter["firstName"] = { operator: "like", value: firstName };
      if (lastName) filter["lastName"] = { operator: "like", value: lastName };
      if (email) filter["email"] = { operator: "eq", value: email };
  
      const queryOptions = {
        pagination: { page, limit },
        filter: Object.keys(filter).length > 0 ? filter : undefined,
      };
  
      const result = await this.userService.findAll(queryOptions);
      
      // Kontrola na chyby
      if (isDbErrorResponse(result)) {
        throw result;
      }
  
      // Mapování entit na DTO
      const users: UserDto[] = result.data.map(this.mapUserToDto);
  
      return {
        data: users,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      };
    }
  
    /**
     * Získá detail uživatele podle ID
     * @param userId ID uživatele
     */
    @Get("{userId}")
    public async getUser(@Path() userId: number): Promise<UserDto> {
      const result = await this.userService.findById(userId);
      
      // Kontrola na chyby
      if (isDbErrorResponse(result)) {
        throw result;
      }
      
      const user = result;
      if (!user) {
        this.setStatus(404);
        throw new Error("Uživatel nebyl nalezen");
      }
  
      return this.mapUserToDto(user);
    }
  
    /**
     * Vytvoří nového uživatele
     * @param requestBody Data pro vytvoření uživatele
     */
    @Post()
    @SuccessResponse("201", "Created")
    public async createUser(@Body() requestBody: CreateUserDto): Promise<UserDto> {
      const result = await this.userService.create(requestBody);
      
      // Kontrola na chyby
      if (isDbErrorResponse(result)) {
        throw result;
      }
      
      this.setStatus(201);
      return this.mapUserToDto(result);
    }
  
    /**
     * Aktualizuje existujícího uživatele
     * @param userId ID uživatele
     * @param requestBody Data pro aktualizaci uživatele
     */
    @Put("{userId}")
    public async updateUser(
      @Path() userId: number,
      @Body() requestBody: UpdateUserDto
    ): Promise<UserDto> {
      const result = await this.userService.update(userId, requestBody);
      
      // Kontrola na chyby
      if (isDbErrorResponse(result)) {
        throw result;
      }
      
      return this.mapUserToDto(result);
    }
  
    /**
     * Smaže uživatele podle ID
     * @param userId ID uživatele
     */
    @Delete("{userId}")
    @Security("jwt")
    public async deleteUser(@Path() userId: number): Promise<void> {
      const result = await this.userService.delete(userId);
      
      // Kontrola na chyby
      if (isDbErrorResponse(result)) {
        throw result;
      }
      
      if (!result) {
        this.setStatus(404);
        throw new Error("Uživatel nebyl nalezen");
      }
    }
  
    /**
     * Mapuje entitu User na UserDto
     */
    private mapUserToDto(user: User): UserDto {
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    }
  }