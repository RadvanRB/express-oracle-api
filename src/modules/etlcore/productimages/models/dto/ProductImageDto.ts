/**
 * Data Transfer Object (DTO) pro vytvoření nového obrázku produktu
 */
export interface CreateProductImageDto {
  productId: number;
  url: string;
  title?: string;
  altText?: string;
  sortOrder?: number;
  width?: number;
  height?: number;
  imageType?: string;
  isMain?: boolean;
}

/**
 * DTO pro aktualizaci existujícího obrázku produktu
 * Všechny properties jsou volitelné
 */
export interface UpdateProductImageDto {
  productId?: number;
  url?: string;
  title?: string;
  altText?: string;
  sortOrder?: number;
  width?: number;
  height?: number;
  imageType?: string;
  isMain?: boolean;
}

/**
 * DTO pro zobrazení obrázku produktu
 * Obsahuje všechny properties obrázku produktu včetně ID a timestamps
 */
export interface ProductImageDto {
  id: number;
  productId: number;
  url: string;
  title?: string;
  altText?: string;
  sortOrder: number;
  width?: number;
  height?: number;
  imageType?: string;
  isMain: boolean;
  createdAt: Date;
  updatedAt: Date;
}