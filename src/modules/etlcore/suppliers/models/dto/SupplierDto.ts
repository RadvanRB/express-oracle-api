/**
 * Data Transfer Object (DTO) pro vytvoření nového dodavatele
 */
export interface CreateSupplierDto {
  name: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  isActive?: boolean;
}

/**
 * DTO pro aktualizaci existujícího dodavatele
 * Všechny properties jsou volitelné
 */
export interface UpdateSupplierDto {
  name?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  isActive?: boolean;
}

/**
 * DTO pro zobrazení dodavatele
 * Obsahuje všechny properties dodavatele včetně ID a timestamps
 */
export interface SupplierDto {
  id: number;
  name: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}