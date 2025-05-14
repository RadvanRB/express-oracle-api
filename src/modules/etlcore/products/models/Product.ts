import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { EntityInfo, ColumnInfo } from "../../../../utils/metadataDecorators";
import { Category } from "../../categories/models/Category";
import { ProductImage } from "../../productimages/models/ProductImage";

@Entity("products")
@EntityInfo({
  sourceInfo: {
    description: "Katalog produktů a jejich metadat",
    schemaName: "etlcore",
    tableName: "products",
    system: "ProductCatalog",
    owner: "ETL Team"
  }
})
export class Product {
  @PrimaryGeneratedColumn()
  @ColumnInfo({
    description: "Unikátní identifikátor produktu",
    dataType: "number",
    displayName: "ID Produktu"
  })
  id!: number;

  /**
   * Kolekce obrázků přiřazených k produktu
   * Vztah one-to-many: jeden produkt může mít mnoho obrázků
   */
  @OneToMany(() => ProductImage, productImage => productImage.product)
  images?: ProductImage[];

  @Column({ length: 100 })
  @Index()
  @ColumnInfo({
    description: "Název produktu",
    dataType: "string",
    displayName: "Název",
    validationRules: ["required", "max:100"]
  })
  name!: string;

  @Column({ length: 500, nullable: true })
  @ColumnInfo({
    description: "Detailní popis produktu",
    dataType: "string",
    displayName: "Popis"
  })
  description?: string;

  /**
   * Reference na kategorii produktu
   */
  @ManyToOne(() => Category, category => category.products)
  @JoinColumn({ name: "categoryId" })
  category?: Category;

  /**
   * ID kategorie, ke které produkt patří
   */
  @Column({ name: "categoryId" })
  @Index()
  @ColumnInfo({
    description: "ID kategorie produktu",
    dataType: "number",
    displayName: "Kategorie",
    validationRules: ["required"]
  })
  categoryId!: number;

  @Column({ type: "varchar", length: 50, nullable: true })
  subCategory?: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  @ColumnInfo({
    description: "Cena produktu",
    dataType: "decimal",
    displayName: "Cena",
    format: "#,##0.00",
    validationRules: ["required", "min:0"]
  })
  price!: number;

  @Column({ type: "int" })
  @ColumnInfo({
    description: "Dostupné množství na skladě",
    dataType: "integer",
    displayName: "Skladem",
    validationRules: ["required", "min:0"]
  })
  stock!: number;

  @Column({ type: "decimal", precision: 6, scale: 2, nullable: true })
  width?: number;

  @Column({ type: "decimal", precision: 6, scale: 2, nullable: true })
  height?: number;

  @Column({ type: "decimal", precision: 6, scale: 2, nullable: true })
  depth?: number;

  @Column({ type: "decimal", precision: 6, scale: 2, nullable: true })
  weight?: number;

  @Column({ type: "varchar", length: 20, nullable: true })
  color?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  manufacturer?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  @ColumnInfo({
    description: "Skladové číslo (Stock Keeping Unit)",
    dataType: "string",
    displayName: "SKU",
    validationRules: ["unique"]
  })
  sku?: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: "timestamp", nullable: true })
  @Index()
  manufactureDate?: Date;

  @Column({ type: "timestamp", nullable: true })
  @Index()
  expiryDate?: Date;

  @Column({ type: "timestamp", nullable: true })
  @Index()
  stockedDate?: Date;

  @Column({ type: "timestamp", nullable: true })
  @Index()
  lastSoldDate?: Date;

  @CreateDateColumn()
  @ColumnInfo({
    description: "Datum a čas vytvoření záznamu",
    dataType: "datetime",
    displayName: "Vytvořeno"
  })
  createdAt!: Date;

  @UpdateDateColumn()
  @ColumnInfo({
    description: "Datum a čas poslední aktualizace",
    dataType: "datetime",
    displayName: "Aktualizováno"
  })
  updatedAt!: Date;
}