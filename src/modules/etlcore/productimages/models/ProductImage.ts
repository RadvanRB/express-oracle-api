import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from "typeorm";
import { EntityInfo, ColumnInfo } from "../../../../utils/metadataDecorators";
import { Product } from "../../products/models/Product";

/**
 * Model obrázku produktu
 * Reprezentuje obrázky přiřazené k produktům v katalogu
 */
@Entity("product_images")
@EntityInfo({
  sourceInfo: {
    description: "Obrázky produktů",
    schemaName: "etlcore",
    tableName: "product_images",
    system: "ProductCatalog",
    owner: "ETL Team"
  }
})
export class ProductImage {
  /**
   * Unikátní identifikátor obrázku
   */
  @PrimaryGeneratedColumn()
  @ColumnInfo({
    description: "Unikátní identifikátor obrázku",
    dataType: "number",
    displayName: "ID Obrázku"
  })
  id!: number;

  /**
   * ID produktu, ke kterému obrázek patří
   */
  @Column({ name: "product_id" })
  @Index()
  @ColumnInfo({
    description: "ID produktu, ke kterému obrázek patří",
    dataType: "number",
    displayName: "ID Produktu",
    validationRules: ["required"]
  })
  productId!: number;

  /**
   * Vztah na produkt, ke kterému obrázek patří
   * Vztah many-to-one: jeden produkt může mít mnoho obrázků
   */
  @ManyToOne(() => Product, product => product.images)
  @JoinColumn({ name: "product_id" })
  product?: Product;

  /**
   * URL adresa obrázku
   */
  @Column({ length: 500 })
  @ColumnInfo({
    description: "URL adresa obrázku",
    dataType: "string",
    displayName: "URL",
    validationRules: ["required", "max:500"]
  })
  url!: string;

  /**
   * Titulek obrázku
   */
  @Column({ length: 200, nullable: true })
  @ColumnInfo({
    description: "Titulek obrázku",
    dataType: "string",
    displayName: "Titulek"
  })
  title?: string;

  /**
   * Alternativní text obrázku pro přístupnost
   */
  @Column({ name: "alt_text", length: 200, nullable: true })
  @ColumnInfo({
    description: "Alternativní text obrázku pro přístupnost",
    dataType: "string",
    displayName: "Alt Text"
  })
  altText?: string;

  /**
   * Pořadí zobrazení obrázku v galerii produktu
   */
  @Column({ name: "sort_order", default: 0 })
  @ColumnInfo({
    description: "Pořadí zobrazení obrázku v galerii produktu",
    dataType: "integer",
    displayName: "Pořadí"
  })
  sortOrder!: number;

  /**
   * Šířka obrázku v pixelech
   */
  @Column({ nullable: true })
  @ColumnInfo({
    description: "Šířka obrázku v pixelech",
    dataType: "integer",
    displayName: "Šířka"
  })
  width?: number;

  /**
   * Výška obrázku v pixelech
   */
  @Column({ nullable: true })
  @ColumnInfo({
    description: "Výška obrázku v pixelech",
    dataType: "integer",
    displayName: "Výška"
  })
  height?: number;

  /**
   * Typ obrázku (např. "hlavní", "galerie", "detail", apod.)
   */
  @Column({ name: "image_type", length: 50, nullable: true })
  @ColumnInfo({
    description: "Typ obrázku (např. 'hlavní', 'galerie', 'detail', apod.)",
    dataType: "string",
    displayName: "Typ obrázku"
  })
  imageType?: string;

  /**
   * Příznak, zda je obrázek hlavním obrázkem produktu
   * POZNÁMKA: Sloupec momentálně chybí v databázi - viz skript v src/docs/product-images-migration.md
   */
  /*
  @Column({ name: "is_main", default: false })
  @Index()
  @ColumnInfo({
    description: "Příznak, zda je obrázek hlavním obrázkem produktu",
    dataType: "boolean",
    displayName: "Hlavní obrázek"
  })
  */
  isMain?: boolean;

  /**
   * Datum vytvoření záznamu
   */
  @CreateDateColumn()
  @ColumnInfo({
    description: "Datum a čas vytvoření záznamu",
    dataType: "datetime",
    displayName: "Vytvořeno"
  })
  createdAt!: Date;

  /**
   * Datum poslední aktualizace záznamu
   */
  @UpdateDateColumn()
  @ColumnInfo({
    description: "Datum a čas poslední aktualizace",
    dataType: "datetime",
    displayName: "Aktualizováno"
  })
  updatedAt!: Date;
}