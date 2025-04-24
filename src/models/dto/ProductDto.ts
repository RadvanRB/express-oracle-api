/**
 * Data pro vytvoření produktu
 */
export interface CreateProductDto {
    /**
     * Název produktu
     * @example "iPhone 15"
     */
    name: string;
  
    /**
     * Popis produktu
     * @example "Nejnovější model iPhonu s pokročilými funkcemi"
     */
    description?: string;
  
    /**
     * Kategorie produktu
     * @example "Elektronika"
     */
    category: string;
  
    /**
     * Podkategorie produktu
     * @example "Mobilní telefony"
     */
    subCategory?: string;
  
    /**
     * Cena produktu
     * @example 24999.99
     */
    price: number;
  
    /**
     * Množství na skladě
     * @example 50
     */
    stock: number;
  
    /**
     * Šířka produktu v cm
     * @example 7.5
     */
    width?: number;
  
    /**
     * Výška produktu v cm
     * @example 15.2
     */
    height?: number;
  
    /**
     * Hloubka produktu v cm
     * @example 0.8
     */
    depth?: number;
  
    /**
     * Hmotnost produktu v kg
     * @example 0.17
     */
    weight?: number;
  
    /**
     * Barva produktu
     * @example "Černá"
     */
    color?: string;
  
    /**
     * Výrobce produktu
     * @example "Apple"
     */
    manufacturer?: string;
  
    /**
     * SKU produktu (Stock Keeping Unit)
     * @example "APL-IP15-128-BLK"
     */
    sku?: string;
  
    /**
     * Je produkt aktivní?
     * @default true
     * @example true
     */
    isActive?: boolean;
  
    /**
     * Datum výroby
     * @format date-time
     * @example "2023-09-15T00:00:00Z"
     */
    manufactureDate?: Date;
  
    /**
     * Datum expirace
     * @format date-time
     * @example "2028-09-15T00:00:00Z"
     */
    expiryDate?: Date;
  
    /**
     * Datum naskladnění
     * @format date-time
     * @example "2023-09-20T00:00:00Z"
     */
    stockedDate?: Date;
  
    /**
     * Datum posledního prodeje
     * @format date-time
     * @example "2023-10-01T00:00:00Z"
     */
    lastSoldDate?: Date;
  }
  
  /**
   * Data pro aktualizaci produktu
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
   * Detail produktu
   */
  export interface ProductDto {
    /**
     * ID produktu
     * @example 1
     */
    id: number;
  
    /**
     * Název produktu
     * @example "iPhone 15"
     */
    name: string;
  
    /**
     * Popis produktu
     * @example "Nejnovější model iPhonu s pokročilými funkcemi"
     */
    description?: string;
  
    /**
     * Kategorie produktu
     * @example "Elektronika"
     */
    category: string;
  
    /**
     * Podkategorie produktu
     * @example "Mobilní telefony"
     */
    subCategory?: string;
  
    /**
     * Cena produktu
     * @example 24999.99
     */
    price: number;
  
    /**
     * Množství na skladě
     * @example 50
     */
    stock: number;
  
    /**
     * Šířka produktu v cm
     * @example 7.5
     */
    width?: number;
  
    /**
     * Výška produktu v cm
     * @example 15.2
     */
    height?: number;
  
    /**
     * Hloubka produktu v cm
     * @example 0.8
     */
    depth?: number;
  
    /**
     * Hmotnost produktu v kg
     * @example 0.17
     */
    weight?: number;
  
    /**
     * Barva produktu
     * @example "Černá"
     */
    color?: string;
  
    /**
     * Výrobce produktu
     * @example "Apple"
     */
    manufacturer?: string;
  
    /**
     * SKU produktu (Stock Keeping Unit)
     * @example "APL-IP15-128-BLK"
     */
    sku?: string;
  
    /**
     * Je produkt aktivní?
     * @example true
     */
    isActive: boolean;
  
    /**
     * Datum výroby
     * @format date-time
     */
    manufactureDate?: Date;
  
    /**
     * Datum expirace
     * @format date-time
     */
    expiryDate?: Date;
  
    /**
     * Datum naskladnění
     * @format date-time
     */
    stockedDate?: Date;
  
    /**
     * Datum posledního prodeje
     * @format date-time
     */
    lastSoldDate?: Date;
  
    /**
     * Datum vytvoření záznamu
     * @format date-time
     */
    createdAt: Date;
  
    /**
     * Datum poslední aktualizace záznamu
     * @format date-time
     */
    updatedAt?: Date;
  }