/**
 * Data Transfer Object (DTO) pro vytvoření nové kategorie
 */
export interface CreateCategoryDto {
  name: string;
  code: string;
  description?: string;
  parentId?: number;
  level?: number;
  displayOrder?: number;
  isActive?: boolean;
}

/**
 * DTO pro aktualizaci existující kategorie
 * Všechny properties jsou volitelné
 */
export interface UpdateCategoryDto {
  name?: string;
  code?: string;
  description?: string;
  parentId?: number;
  level?: number;
  displayOrder?: number;
  isActive?: boolean;
}

/**
 * DTO pro zobrazení kategorie
 * Obsahuje všechny properties kategorie včetně ID a timestamps
 */
export interface CategoryDto {
  id: number;
  name: string;
  code: string;
  description?: string;
  parentId?: number;
  level: number;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}