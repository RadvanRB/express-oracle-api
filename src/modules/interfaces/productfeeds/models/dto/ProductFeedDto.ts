/**
 * Data Transfer Object (DTO) pro vytvoření nového datového toku produktů
 */
export interface CreateProductFeedDto {
  name: string;
  description?: string;
  sourceSystem: string;
  targetSystem: string;
  format: string;
  url: string;
  isActive?: boolean;
  refreshInterval?: number;
  transformationScript?: string;
  filterCriteria?: string;
  productIds?: number[]; // ID produktů k propojení
}

/**
 * DTO pro aktualizaci existujícího datového toku produktů
 * Všechny properties jsou volitelné
 */
export interface UpdateProductFeedDto {
  name?: string;
  description?: string;
  sourceSystem?: string;
  targetSystem?: string;
  format?: string;
  url?: string;
  isActive?: boolean;
  refreshInterval?: number;
  transformationScript?: string;
  filterCriteria?: string;
  productIds?: number[]; // ID produktů k propojení
}

/**
 * DTO pro zobrazení datového toku produktů
 * Obsahuje všechny properties včetně ID a timestamps
 */
export interface ProductFeedDto {
  id: number;
  name: string;
  description?: string;
  sourceSystem: string;
  targetSystem: string;
  format: string;
  url: string;
  isActive: boolean;
  refreshInterval?: number;
  transformationScript?: string;
  filterCriteria?: string;
  productIds?: number[]; // ID propojených produktů
  productCount?: number; // Počet propojených produktů
  createdAt: Date;
  updatedAt: Date;
}