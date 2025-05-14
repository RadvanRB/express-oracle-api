import { Entity, PrimaryColumn, Column, JoinColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../users/models/User";
import { Role } from "../../roles/models/Role";

@Entity("app_user_roles")
export class UserRole {
  // První část složeného primárního klíče
  @PrimaryColumn()
  userId!: number;

  // Druhá část složeného primárního klíče
  @PrimaryColumn()
  roleId!: number;

  // Název role (pro rychlejší zobrazení)
  @Column({ length: 50 })
  roleName!: string;

  // Aktivní/neaktivní stav
  @Column({ default: 1 })
  isActive!: number;

  // Popis přiřazení role
  @Column({ length: 255, nullable: true })
  description?: string;

  // Časové značky pro audit
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Vazba na uživatele
  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User;

  // Vazba na roli
  @ManyToOne(() => Role)
  @JoinColumn({ name: "roleId" })
  role!: Role;
}