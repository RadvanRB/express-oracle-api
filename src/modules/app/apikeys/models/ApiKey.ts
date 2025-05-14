import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

/**
 * Model pro správu API klíčů třetích stran
 * Umožňuje aplikacím třetích stran přístup k API bez použití Keycloak
 */
@Entity("app_api_keys")
export class ApiKey {
  /**
   * Unikátní identifikátor API klíče
   */
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * Název klíče (popis pro snadnou identifikaci)
   */
  @Column({ length: 100 })
  name!: string;

  /**
   * Hash API klíče (nikdy neukládáme samotný klíč)
   */
  @Column({ length: 128 })
  keyHash!: string;

  /**
   * ID klienta, kterému klíč patří
   */
  @Column({ length: 50 })
  clientId!: string;

  /**
   * Role přiřazené k API klíči ve formátu JSON
   */
  @Column({ type: "simple-json" })
  roles!: string[];

  /**
   * Příznak, zda je klíč aktivní
   */
  @Column({ default: true })
  isActive!: boolean;

  /**
   * Datum a čas vypršení platnosti klíče
   */
  @Column({ nullable: true })
  expiresAt?: Date;

  /**
   * IP adresy, ze kterých může být klíč použit (volitelné omezení)
   * Uloženo jako JSON pole
   */
  @Column({ type: "simple-json", nullable: true })
  allowedIps?: string[];

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