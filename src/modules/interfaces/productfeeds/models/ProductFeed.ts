import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToMany, JoinTable } from "typeorm";
import { EntityInfo, ColumnInfo } from "../../../../utils/metadataDecorators";
import { Product } from "../../../etlcore/products/models/Product";

/**
 * Model datového toku produktů
 * Reprezentuje konfiguraci pro import/export produktových dat z/do externích systémů
 * Demonstruje vztah mezi entitami z různých funkčních domén (interfaces <-> etlcore)
 */
@Entity("product_feeds")
@EntityInfo({
  sourceInfo: {
    description: "Datové toky produktů pro integraci s externími systémy",
    schemaName: "interfaces",
    tableName: "product_feeds",
    system: "IntegrationHub",
    owner: "Integration Team"
  }
})
export class ProductFeed {
  /**
   * Unikátní identifikátor datového toku
   */
  @PrimaryGeneratedColumn()
  @ColumnInfo({
    description: "Unikátní identifikátor datového toku",
    dataType: "number",
    displayName: "ID"
  })
  id!: number;

  /**
   * Název datového toku
   */
  @Column({ length: 100 })
  @Index()
  @ColumnInfo({
    description: "Název datového toku",
    dataType: "string",
    displayName: "Název",
    validationRules: ["required", "max:100"]
  })
  name!: string;

  /**
   * Popis datového toku
   */
  @Column({ length: 500, nullable: true })
  @ColumnInfo({
    description: "Popis datového toku",
    dataType: "string",
    displayName: "Popis"
  })
  description?: string;

  /**
   * Zdrojový systém
   */
  @Column({ name: "source_system", length: 100 })
  @Index()
  @ColumnInfo({
    description: "Zdrojový systém dat",
    dataType: "string",
    displayName: "Zdrojový systém",
    validationRules: ["required", "max:100"]
  })
  sourceSystem!: string;

  /**
   * Cílový systém
   */
  @Column({ name: "target_system", length: 100 })
  @Index()
  @ColumnInfo({
    description: "Cílový systém dat",
    dataType: "string",
    displayName: "Cílový systém",
    validationRules: ["required", "max:100"]
  })
  targetSystem!: string;

  /**
   * Formát dat (např. JSON, XML, CSV)
   */
  @Column({ length: 50 })
  @ColumnInfo({
    description: "Formát dat (např. JSON, XML, CSV)",
    dataType: "string",
    displayName: "Formát",
    validationRules: ["required", "max:50"]
  })
  format!: string;

  /**
   * URL koncového bodu pro datový tok
   */
  @Column({ length: 500 })
  @ColumnInfo({
    description: "URL koncového bodu pro datový tok",
    dataType: "string",
    displayName: "URL",
    validationRules: ["required", "max:500"]
  })
  url!: string;

  /**
   * Aktivační flag - určuje, zda je datový tok aktivní
   */
  @Column({ name: "is_active", default: true })
  @Index()
  @ColumnInfo({
    description: "Určuje, zda je datový tok aktivní",
    dataType: "boolean",
    displayName: "Aktivní"
  })
  isActive!: boolean;

  /**
   * Interval automatické aktualizace v minutách
   */
  @Column({ name: "refresh_interval", nullable: true })
  @ColumnInfo({
    description: "Interval automatické aktualizace v minutách",
    dataType: "integer",
    displayName: "Interval aktualizace"
  })
  refreshInterval?: number;

  /**
   * Transformační skript pro úpravu dat
   * Používáme CLOB pro velké textové řetězce (kompatibilní s Oracle)
   */
  @Column({ name: "transformation_script", type: "clob", nullable: true })
  @ColumnInfo({
    description: "Transformační skript pro úpravu dat",
    dataType: "string",
    displayName: "Transformační skript"
  })
  transformationScript?: string;

  /**
   * Kritéria pro filtrování dat
   * Používáme CLOB pro velké textové řetězce (kompatibilní s Oracle)
   */
  @Column({ name: "filter_criteria", type: "clob", nullable: true })
  @ColumnInfo({
    description: "Kritéria pro filtrování dat",
    dataType: "string",
    displayName: "Filtrovací kritéria"
  })
  filterCriteria?: string;

  /**
   * Vztah Many-to-Many s produkty
   * Demonstruje vztah mezi entitami z různých funkčních domén
   */
  @ManyToMany(() => Product)
  @JoinTable({
    name: "product_feed_products",
    joinColumn: {
      name: "feed_id",
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "product_id",
      referencedColumnName: "id"
    }
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