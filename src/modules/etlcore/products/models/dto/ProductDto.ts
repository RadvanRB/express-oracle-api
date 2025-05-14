/**
 * Data Transfer Object (DTO) pro vytvoření nového produktu
 */
export interface CreateProductDto {
  name: string;
  description?: string;
  category: string;
  subCategory?: string;
  price: number;
  stock: number;
  width?: number;
  height?: number;
  depth?: number;
  weight?: number;
  color?: string;
  manufacturer?: string;
  sku?: string;
  isActive?: boolean;
  manufactureDate?: Date;
  expiryDate?: Date;
  stockedDate?: Date;
  lastSoldDate?: Date;
}

/**
 * DTO pro aktualizaci existujícího produktu
 * Všechny properties jsou volitelné
 */
export interface UpdateProductDto {
  name?: string;
  description?: string;
  category?: string;
  subCategory?: string;
  price?: number;
  stock?: number;
  width?: number;
  height?: number;
  depth?: number;
  weight?: number;
  color?: string;
  manufacturer?: string;
  sku?: string;
  isActive?: boolean;
  manufactureDate?: Date;
  expiryDate?: Date;
  stockedDate?: Date;
  lastSoldDate?: Date;
}

/**
 * DTO pro zobrazení produktu
 * Obsahuje všechny properties produktu včetně ID a timestamps
 */
export interface ProductDto {
  id: number;
  name: string;
  description?: string;
  category: string;
  subCategory?: string;
  price: number;
  stock: number;
  width?: number;
  height?: number;
  depth?: number;
  weight?: number;
  color?: string;
  manufacturer?: string;
  sku?: string;
  isActive: boolean;
  manufactureDate?: Date;
  expiryDate?: Date;
  stockedDate?: Date;
  lastSoldDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}