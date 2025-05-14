import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToMany, JoinTable } from "typeorm";
import { EntityInfo, ColumnInfo } from "../../../../utils/metadataDecorators";
import { Product } from "../../products/models/Product";

/**
 * Model dodavatele produktů
 * Reprezentuje společnosti nebo jednotlivce, kteří dodávají produkty
 */
@Entity("suppliers")
@EntityInfo({
  sourceInfo: {
    description: "Dodavatelé produktů",
    schemaName: "etlcore",
    tableName: "suppliers",
    system: "ProductCatalog",
    owner: "ETL Team"
  }
})
export class Supplier {
  /**
   * Unikátní identifikátor dodavatele
   */
  @PrimaryGeneratedColumn()
  @ColumnInfo({
    description: "Unikátní identifikátor dodavatele",
    dataType: "number",
    displayName: "ID Dodavatele"
  })
  id!: number;

  /**
   * Název dodavatele
   */
  @Column({ length: 100 })
  @Index()
  @ColumnInfo({
    description: "Název dodavatele",
    dataType: "string",
    displayName: "Název",
    validationRules: ["required", "max:100"]
  })
  name!: string;

  /**
   * Jméno kontaktní osoby
   */
  @Column({ length: 100, nullable: true })
  @ColumnInfo({
    description: "Jméno kontaktní osoby",
    dataType: "string",
    displayName: "Kontaktní osoba"
  })
  contactName?: string;

  /**
   * E-mail kontaktní osoby
   */
  @Column({ length: 100, nullable: true })
  @ColumnInfo({
    description: "E-mail kontaktní osoby",
    dataType: "string",
    displayName: "E-mail"
  })
  contactEmail?: string;

  /**
   * Telefonní číslo kontaktní osoby
   */
  @Column({ length: 30, nullable: true })
  @ColumnInfo({
    description: "Telefonní číslo kontaktní osoby",
    dataType: "string",
    displayName: "Telefon"
  })
  contactPhone?: string;

  /**
   * Adresa dodavatele
   */
  @Column({ length: 200, nullable: true })
  @ColumnInfo({
    description: "Adresa dodavatele",
    dataType: "string",
    displayName: "Adresa"
  })
  address?: string;

  /**
   * Město
   */
  @Column({ length: 100, nullable: true })
  @ColumnInfo({
    description: "Město",
    dataType: "string",
    displayName: "Město"
  })
  city?: string;

  /**
   * PSČ
   */
  @Column({ length: 20, nullable: true })
  @ColumnInfo({
    description: "PSČ",
    dataType: "string",
    displayName: "PSČ"
  })
  postalCode?: string;

  /**
   * Země
   */
  @Column({ length: 100, nullable: true })
  @Index()
  @ColumnInfo({
    description: "Země",
    dataType: "string",
    displayName: "Země"
  })
  country?: string;

  /**
   * Příznak aktivního dodavatele
   */
  @Column({ default: true })
  @ColumnInfo({
    description: "Příznak aktivního dodavatele",
    dataType: "boolean",
    displayName: "Aktivní"
  })
  isActive!: boolean;

  /**
   * Vztah na produkty, které dodavatel dodává
   * Vztah many-to-many: jeden dodavatel může dodávat mnoho produktů
   * a jeden produkt může být dodáván mnoha dodavateli
   */
  @ManyToMany(() => Product)
  @JoinTable({
    name: "supplier_products",
    joinColumn: { name: "supplier_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "product_id", referencedColumnName: "id" }
  })
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