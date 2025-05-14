import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";

/**
 * Entita reprezentující uživatele v systému
 */
@Entity("app_users")
export class User {
  /**
   * Unikátní identifikátor uživatele
   */
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * Křestní jméno uživatele
   */
  @Column({ length: 100 })
  @Index()
  firstName!: string;

  /**
   * Příjmení uživatele
   */
  @Column({ length: 100 })
  @Index()
  lastName!: string;

  /**
   * Emailová adresa uživatele (unikátní)
   */
  @Column({ length: 255, unique: true })
  email!: string;

  /**
   * Heslo uživatele (nezahrnuto ve výchozích dotazech)
   */
  @Column({ select: false }) // Heslo nebude ve výchozím stavu zahrnuto v dotazech
  password!: string;

  /**
   * Indikátor, zda je uživatel aktivní
   */
  @Column({ default: true })
  isActive!: boolean;

  /**
   * Telefonní číslo uživatele
   */
  @Column({ nullable: true, type: "varchar", length: 20 })
  @Index()
  phone?: string;

  /**
   * Adresa uživatele
   */
  @Column({ type: "varchar", length: 255, nullable: true })
  address?: string;

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