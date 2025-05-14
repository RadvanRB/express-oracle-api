import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from "typeorm";
import { Permission } from "../../permissions/models/Permission";
import { User } from "../../users/models/User";

/**
 * Model pro definici rolí v systému
 * Role sdružuje sadu oprávnění, která lze přiřadit uživatelům
 */
@Entity("app_roles")
export class Role {
  /**
   * Unikátní identifikátor role
   */
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * Kód role - unikátní identifikátor používaný v kódu
   * Příklady: ADMIN, USER, EDITOR, atd.
   */
  @Column({ length: 50, unique: true })
  code!: string;

  /**
   * Název role - lidsky čitelný popis role
   */
  @Column({ length: 100 })
  name!: string;

  /**
   * Popis role a jejího účelu
   */
  @Column({ type: "varchar", length: 255, nullable: true })
  description?: string;

  /**
   * Příznak, zda je role systémová
   * Systémové role nelze odstranit ani upravovat standardními operacemi
   */
  @Column({ default: false })
  isSystem!: boolean;

  /**
   * Příznak, zda je role aktivní
   */
  @Column({ default: true })
  isActive!: boolean;

  /**
   * Seznam oprávnění přiřazených této roli
   */
  @ManyToMany(() => Permission, permission => permission.roles)
  @JoinTable({
    name: "app_role_permissions",
    joinColumn: { name: "roleId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "permissionId", referencedColumnName: "id" }
  })
  permissions?: Permission[];

  /**
   * Seznam uživatelů s touto rolí
   */
  @ManyToMany(() => User)
  @JoinTable({
    name: "app_user_roles",
    joinColumn: { name: "roleId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "userId", referencedColumnName: "id" }
  })
  users?: User[];

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