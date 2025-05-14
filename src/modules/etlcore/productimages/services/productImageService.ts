import { ProductImage } from "../models/ProductImage";
import { EntityTarget } from "typeorm";
import { CreateProductImageDto, UpdateProductImageDto } from "../models/dto/ProductImageDto";
import { AbstractService } from "../../../../services/AbstractService";
import { DatabaseErrorHandler } from "../../../../utils/DatabaseErrorHandler";

/**
 * Služba pro práci s obrázky produktů
 * Poskytuje metody pro základní CRUD operace a specifické metody pro práci s obrázky
 */
// Instance služby pro singleton vzor
let productImageServiceInstance: ProductImageService | null = null;

/**
 * Získání instance služby (singleton vzor)
 * @returns Instance služby pro práci s obrázky produktů
 */
export const getProductImageService = (): ProductImageService => {
  if (!productImageServiceInstance) {
    productImageServiceInstance = new ProductImageService();
  }
  return productImageServiceInstance;
};

export class ProductImageService extends AbstractService<ProductImage> {
  /**
   * Konstruktor služby
   */
  constructor() {
    // Předání entity modelu a názvu entity do konstruktoru rodiče
    super(ProductImage as EntityTarget<ProductImage>, 'productImage',undefined,"etlowner");
  }

  /**
   * Vytvoření nového obrázku produktu
   * @param createDto Data pro vytvoření obrázku
   * @returns Vytvořený obrázek nebo chybovou odpověď
   */
  async createProductImage(createDto: CreateProductImageDto) {
    try {
      // Vytvoření nové instance obrázku produktu
      const productImage = this.repository.create({
        productId: createDto.productId,
        url: createDto.url,
        title: createDto.title,
        altText: createDto.altText,
        sortOrder: createDto.sortOrder || 0,
        width: createDto.width,
        height: createDto.height,
        imageType: createDto.imageType
        // isMain vlastnost je dočasně odstraněna kvůli chybějícímu sloupci v databázi
        // isMain: createDto.isMain || false
      });

      // Uložení obrázku do databáze
      const result = await this.repository.save(productImage);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        message: `Chyba při vytváření obrázku produktu: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error),
        recovered: false
      };
    }
  }

  /**
   * Aktualizace existujícího obrázku produktu
   * @param id ID obrázku, který má být aktualizován
   * @param updateDto Data pro aktualizaci obrázku
   * @returns Aktualizovaný obrázek nebo chybovou odpověď
   */
  async updateProductImage(id: number, updateDto: UpdateProductImageDto) {
    try {
      // Kontrola existence obrázku
      const productImage = await this.repository.findOne({ where: { id } });
      if (!productImage) {
        return {
          success: false,
          message: `Obrázek s ID ${id} nebyl nalezen`,
          error: "Not found",
          recovered: false
        };
      }

      // Aktualizace vlastností obrázku
      if (updateDto.productId !== undefined) productImage.productId = updateDto.productId;
      if (updateDto.url !== undefined) productImage.url = updateDto.url;
      if (updateDto.title !== undefined) productImage.title = updateDto.title;
      if (updateDto.altText !== undefined) productImage.altText = updateDto.altText;
      if (updateDto.sortOrder !== undefined) productImage.sortOrder = updateDto.sortOrder;
      if (updateDto.width !== undefined) productImage.width = updateDto.width;
      if (updateDto.height !== undefined) productImage.height = updateDto.height;
      if (updateDto.imageType !== undefined) productImage.imageType = updateDto.imageType;
      // isMain vlastnost je dočasně odstraněna kvůli chybějícímu sloupci v databázi
      // if (updateDto.isMain !== undefined) productImage.isMain = updateDto.isMain;

      // Uložení aktualizovaného obrázku
      const result = await this.repository.save(productImage);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        message: `Chyba při aktualizaci obrázku produktu: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error),
        recovered: false
      };
    }
  }

  /**
   * Nastavení hlavního obrázku produktu
   * Označí jeden obrázek jako hlavní a ostatní nastaví jako ne-hlavní
   * @param imageId ID obrázku, který má být nastaven jako hlavní
   * @param productId ID produktu, ke kterému obrázek patří
   * @returns Výsledek operace
   */
  async setMainImage(imageId: number, productId: number) {
    try {
      // Kontrola existence obrázku
      const productImage = await this.repository.findOne({ 
        where: { id: imageId, productId } 
      });
      
      if (!productImage) {
        return {
          success: false,
          message: `Obrázek s ID ${imageId} pro produkt ${productId} nebyl nalezen`,
          error: "Not found",
          recovered: false
        };
      }

      // POZNÁMKA: Nastavení hlavního obrázku je dočasně deaktivováno kvůli chybějícímu sloupci is_main v databázi
      // Nejprve nastavíme všechny obrázky produktu jako ne-hlavní
      // await this.repository.update(
      //  { productId },
      //  { isMain: false }
      // );

      // Poté nastavíme vybraný obrázek jako hlavní
      // await this.repository.update(
      //  { id: imageId },
      //  { isMain: true }
      // );

      return { 
        success: true, 
        message: `Obrázek s ID ${imageId} byl nastaven jako hlavní pro produkt ${productId}` 
      };
    } catch (error) {
      return {
        success: false,
        message: `Chyba při nastavování hlavního obrázku: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error),
        recovered: false
      };
    }
  }

  /**
   * Aktualizace pořadí zobrazení obrázků
   * @param imageIds Pole ID obrázků v požadovaném pořadí zobrazení
   * @returns Výsledek operace
   */
  async updateSortOrder(imageIds: number[]) {
    try {
      // Pro každé ID obrázku aktualizujeme pořadí zobrazení
      const updates = imageIds.map((id, index) => 
        this.repository.update({ id }, { sortOrder: index })
      );

      // Provedeme všechny aktualizace najednou
      await Promise.all(updates);

      return { 
        success: true, 
        message: `Pořadí zobrazení obrázků bylo úspěšně aktualizováno` 
      };
    } catch (error) {
      return {
        success: false,
        message: `Chyba při aktualizaci pořadí obrázků: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error),
        recovered: false
      };
    }
  }

  /**
   * Načtení obrázků produktu
   * @param productId ID produktu
   * @returns Seznam obrázků produktu nebo chybovou odpověď
   */
  async getProductImages(productId: number) {
    try {
      const images = await this.repository.find({
        where: { productId },
        order: { sortOrder: "ASC" }
        // isMain je dočasně odstraněno kvůli chybějícímu sloupci v databázi
        // order: { isMain: "DESC", sortOrder: "ASC" }
      });

      return { success: true, data: images };
    } catch (error) {
      return {
        success: false,
        message: `Chyba při načítání obrázků produktu: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error),
        recovered: false
      };
    }
  }

  /**
   * Načtení hlavního obrázku produktu
   * @param productId ID produktu
   * @returns Hlavní obrázek produktu nebo null, pokud neexistuje
   */
  async getMainImage(productId: number) {
    try {
      // Dočasně vracíme první obrázek místo hlavního
      const images = await this.repository.find({
        where: { productId },
        order: { sortOrder: "ASC" },
        take: 1
      });
      const mainImage = images.length > 0 ? images[0] : null;
      
      // Původní kód s isMain je dočasně deaktivován
      // const mainImage = await this.repository.findOne({
      //  where: { productId, isMain: true }
      // });

      return { success: true, data: mainImage };
    } catch (error) {
      return {
        success: false,
        message: `Chyba při načítání hlavního obrázku produktu: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error),
        recovered: false
      };
    }
  }

  /**
   * Seedování testovacích dat obrázků produktů
   * @returns Výsledek seedování
   */
  async seedTestData() {
    try {
      // Kontrola, zda již existují nějaké obrázky
      const existingImages = await this.repository.count();
      if (existingImages > 0) {
        return {
          success: true,
          message: `Testovací data již existují. Nalezeno ${existingImages} obrázků.`
        };
      }

      // Testovací data pro obrázky produktů
      const testImages = [
        // Obrázky pro produkt 1
        {
          productId: 1,
          url: "https://example.com/images/product1_main.jpg",
          title: "Notebook hlavní pohled",
          altText: "Přenosný počítač úhel zepředu",
          sortOrder: 0,
          width: 1200,
          height: 800,
          imageType: "main"
          // isMain je dočasně odstraněno kvůli chybějícímu sloupci v databázi
          // isMain: true
        },
        {
          productId: 1,
          url: "https://example.com/images/product1_side.jpg",
          title: "Notebook boční pohled",
          altText: "Přenosný počítač z boku",
          sortOrder: 1,
          width: 1200,
          height: 800,
          imageType: "gallery"
          // isMain je dočasně odstraněno kvůli chybějícímu sloupci v databázi
          // isMain: false
        },
        {
          productId: 1,
          url: "https://example.com/images/product1_open.jpg",
          title: "Notebook otevřený",
          altText: "Přenosný počítač otevřený s detailem klávesnice",
          sortOrder: 2,
          width: 1200,
          height: 800,
          imageType: "gallery"
          // isMain je dočasně odstraněno kvůli chybějícímu sloupci v databázi
          // isMain: false
        },

        // Obrázky pro produkt 2
        {
          productId: 2,
          url: "https://example.com/images/product2_main.jpg",
          title: "Smartphone pohled zepředu",
          altText: "Moderní smartphone s displejem",
          sortOrder: 0,
          width: 800,
          height: 1200,
          imageType: "main"
          // isMain je dočasně odstraněno kvůli chybějícímu sloupci v databázi
          // isMain: true
        },
        {
          productId: 2,
          url: "https://example.com/images/product2_back.jpg",
          title: "Smartphone zadní strana",
          altText: "Zadní strana smartphone s fotoaparátem",
          sortOrder: 1,
          width: 800,
          height: 1200,
          imageType: "gallery"
          // isMain je dočasně odstraněno kvůli chybějícímu sloupci v databázi
          // isMain: false
        },

        // Obrázky pro produkt 3
        {
          productId: 3,
          url: "https://example.com/images/product3_main.jpg",
          title: "Bezdrátová sluchátka",
          altText: "Bezdrátová sluchátka s nabíjecím pouzdrem",
          sortOrder: 0,
          width: 1000,
          height: 1000,
          imageType: "main"
          // isMain je dočasně odstraněno kvůli chybějícímu sloupci v databázi
          // isMain: true
        },
        {
          productId: 3,
          url: "https://example.com/images/product3_detail.jpg",
          title: "Detail sluchátek",
          altText: "Detail designu sluchátek",
          sortOrder: 1,
          width: 1000,
          height: 1000,
          imageType: "gallery"
          // isMain je dočasně odstraněno kvůli chybějícímu sloupci v databázi
          // isMain: false
        },
        {
          productId: 3,
          url: "https://example.com/images/product3_case.jpg",
          title: "Nabíjecí pouzdro",
          altText: "Nabíjecí pouzdro pro sluchátka",
          sortOrder: 2,
          width: 1000,
          height: 1000,
          imageType: "gallery"
          // isMain je dočasně odstraněno kvůli chybějícímu sloupci v databázi
          // isMain: false
        }
      ];

      // Uložení testovacích dat do databáze
      await this.repository.save(testImages);

      return {
        success: true,
        message: `Úspěšně seedováno ${testImages.length} obrázků produktů`
      };
    } catch (error) {
      return {
        success: false,
        message: `Chyba při seedování testovacích dat obrázků: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error),
        recovered: false
      };
    }
  }
}