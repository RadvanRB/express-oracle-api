import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from "typeorm";
import { Role } from "../../roles/models/Role";

/**
 * Výčtový typ pro operace, které lze na entitách provádět
 */
export enum OperationType {
  SELECT = "SELECT",
  INSERT = "INSERT", 
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  EXECUTE = "EXECUTE"
}

/**
 * Typ entity - určuje, zda jde o model nebo proceduru
 */
export enum EntityType {
  MODEL = "MODEL",
  PROCEDURE = "PROCEDURE"
}

/**
 * Model pro definici oprávnění na entitách
 * Oprávnění popisuje, jaké operace může uživatel s určitou rolí provádět na dané entitě
 */
@Entity("app_permissions")
export class Permission {
  /**
   * Unikátní identifikátor oprávnění
   */
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * Název cílové entity, ke které se oprávnění vztahuje (např. "users", "products")
   */
  @Column({ length: 100 })
  entityName!: string;

  /**
   * Typ entity - MODEL (tabulka) nebo PROCEDURE (procedura)
   */
  @Column({
    type: "varchar",
    enum: EntityType,
    default: EntityType.MODEL
  })
  entityType!: EntityType;

  /**
   * Operace, kterou oprávnění umožňuje (SELECT, INSERT, UPDATE, DELETE, EXECUTE)
   */
  @Column({
    type: "varchar",
    enum: OperationType
  })
  operation!: OperationType;

  /**
   * Popis oprávnění
   */
  @Column({ type: "varchar", length: 255, nullable: true })
  description?: string;

  /**
   * Podmínka pro filtrování záznamů (např. "id = :userId")
   * Může být použito pro omezení přístupu pouze k určitým záznamům
   */
  @Column({ type: "varchar", length: 1000, nullable: true })
  condition?: string;

  /**
   * Role, ke kterým je toto oprávnění přiřazeno
   */
  @ManyToMany(() => Role, role => role.permissions)
  roles?: Role[];

  /**
   * Příznak, zda je oprávnění aktivní
   */
  @Column({ default: true })
  isActive!: boolean;

  /**
   * Datum vytvoření záznamu
   */
  @CreateDateColumn()
  createdAt!: Date;

  /**
   * Datum poslední aktualizace záznamu
   */
  @UpdateDateColumn()
  updatedAt?: Date;
}