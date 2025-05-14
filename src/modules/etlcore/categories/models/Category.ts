import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from "typeorm";
import { EntityInfo, ColumnInfo } from "../../../../utils/metadataDecorators";
import { Product } from "../../../etlcore/products/models/Product";

/**
 * Model kategorie produktů
 * Reprezentuje hierarchii kategorií v katalogu produktů
 */
@Entity("categories")
@EntityInfo({
  sourceInfo: {
    description: "Kategorie produktů",
    schemaName: "etlcore",
    tableName: "categories",
    system: "ProductCatalog",
    owner: "ETL Team"
  }
})
export class Category {
  /**
   * Unikátní identifikátor kategorie
   */
  @PrimaryGeneratedColumn()
  @ColumnInfo({
    description: "Unikátní identifikátor kategorie",
    dataType: "number",
    displayName: "ID Kategorie"
  })
  id!: number;

  /**
   * Název kategorie
   */
  @Column({ length: 100 })
  @Index()
  @ColumnInfo({
    description: "Název kategorie",
    dataType: "string",
    displayName: "Název",
    validationRules: ["required", "max:100"]
  })
  name!: string;

  /**
   * Unikátní kód kategorie používaný v systému
   */
  @Column({ length: 50, unique: true })
  //@Index()
  @ColumnInfo({
    description: "Kód kategorie",
    dataType: "string",
    displayName: "Kód",
    validationRules: ["required", "max:50"]
  })
  code!: string;

  /**
   * Popis kategorie
   */
  @Column({ length: 500, nullable: true })
  @ColumnInfo({
    description: "Popis kategorie",
    dataType: "string",
    displayName: "Popis"
  })
  description?: string;

  /**
   * Odkaz na nadřazenou kategorii (self-reference)
   */
  @Column({ nullable: true })
  @ColumnInfo({
    description: "ID nadřazené kategorie",
    dataType: "number",
    displayName: "Nadřazená kategorie"
  })
  parentId?: number;

  /**
   * Úroveň kategorie v hierarchii (0 = kořenová kategorie)
   */
  @Column({ type: "int", default: 0 })
  @ColumnInfo({
    description: "Úroveň kategorie v hierarchii",
    dataType: "integer",
    displayName: "Úroveň"
  })
  level!: number;

  /**
   * Pořadí pro zobrazení kategorie
   */
  @Column({ type: "int", default: 0 })
  @ColumnInfo({
    description: "Pořadí pro zobrazení",
    dataType: "integer",
    displayName: "Pořadí"
  })
  displayOrder!: number;

  /**
   * Příznak aktivní kategorie
   */
  @Column({ default: true })
  @ColumnInfo({
    description: "Příznak aktivní kategorie",
    dataType: "boolean",
    displayName: "Aktivní"
  })
  isActive!: boolean;

  /**
   * Vztah na produkty v této kategorii
   * Vztah one-to-many: jedna kategorie může obsahovat mnoho produktů
   */
  @OneToMany(() => Product, product => product.category)
  products?: Product[];

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