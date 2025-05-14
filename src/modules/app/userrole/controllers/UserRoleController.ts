import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from "tsoa";
import { UserRole } from "../models/UserRole";
import { getUserRoleService } from "../services/userRoleService";
import { isDbErrorResponse } from "../../../../services/AbstractService";

interface AssignRoleRequest {
  userId: number;
  roleId: number;
  roleName: string;
  description?: string;
}

interface UpdateRoleRequest {
  roleName?: string;
  description?: string;
  isActive?: number;
}

@Route("user-roles")
@Tags("User Roles")
export class UserRoleController extends Controller {
  private userRoleService = getUserRoleService();
  
  /**
   * Získá všechny role pro konkrétního uživatele
   * @param userId ID uživatele
   */
  @Get("user/{userId}")
  public async getUserRoles(@Path() userId: number): Promise<UserRole[]> {
    const result = await this.userRoleService.getUserRoles(userId);
    
    // Kontrola na chyby
    if (isDbErrorResponse(result)) {
      throw result;
    }
    
    return result;
  }

  /**
   * Získá detail konkrétní role uživatele
   * Ukázka práce se složeným primárním klíčem
   * @param userId ID uživatele
   * @param roleId ID role
   */
  @Get("user/{userId}/role/{roleId}")
  public async getUserRole(
    @Path() userId: number,
    @Path() roleId: number
  ): Promise<UserRole> {
    const result = await this.userRoleService.findUserRole(userId, roleId);
    
    // Kontrola na chyby
    if (isDbErrorResponse(result)) {
      throw result;
    }
    
    if (!result) {
      this.setStatus(404);
      throw new Error("Role uživatele nebyla nalezena");
    }
    
    return result;
  }

  /**
   * Přiřadí roli uživateli
   * @param requestBody Data pro přiřazení role
   */
  @Post()
  @SuccessResponse("201", "Created")
  public async assignRole(@Body() requestBody: AssignRoleRequest): Promise<UserRole> {
    const result = await this.userRoleService.assignRole(
      requestBody.userId,
      requestBody.roleId,
      requestBody.roleName,
      requestBody.description
    );
    
    // Kontrola na chyby
    if (isDbErrorResponse(result)) {
      throw result;
    }
    
    this.setStatus(201);
    return result;
  }

  /**
   * Aktualizuje informace o roli uživatele
   * Ukázka práce se složeným primárním klíčem
   * @param userId ID uživatele
   * @param roleId ID role
   * @param requestBody Data pro aktualizaci role
   */
  @Put("user/{userId}/role/{roleId}")
  public async updateUserRole(
    @Path() userId: number,
    @Path() roleId: number,
    @Body() requestBody: UpdateRoleRequest
  ): Promise<UserRole> {
    const result = await this.userRoleService.updateUserRole(userId, roleId, requestBody);
    
    // Kontrola na chyby
    if (isDbErrorResponse(result)) {
      throw result;
    }
    
    return result;
  }

  /**
   * Odebere roli uživateli
   * Ukázka použití složeného primárního klíče při mazání
   * @param userId ID uživatele
   * @param roleId ID role
   */
  @Delete("user/{userId}/role/{roleId}")
  @Security("jwt")
  public async removeRole(
    @Path() userId: number,
    @Path() roleId: number
  ): Promise<void> {
    const result = await this.userRoleService.removeRole(userId, roleId);
    
    // Kontrola na chyby
    if (isDbErrorResponse(result)) {
      throw result;
    }
    
    if (!result) {
      this.setStatus(404);
      throw new Error("Role uživatele nebyla nalezena");
    }
  }

  /**
   * Deaktivuje všechny role uživatele
   * Ukázka hromadné aktualizace
   * @param userId ID uživatele
   */
  @Put("user/{userId}/deactivate")
  @Security("jwt")
  public async deactivateUserRoles(@Path() userId: number): Promise<void> {
    await this.userRoleService.deactivateUserRoles(userId);
    this.setStatus(200);
  }
}