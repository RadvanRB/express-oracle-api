import { Entity, Column, PrimaryColumn, JoinColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity("user_roles")
export class UserRole {
  // První část složeného primárního klíče
  @PrimaryColumn()
  userId!: number;

  // Druhá část složeného primárního klíče
  @PrimaryColumn()
  roleId!: number;
  
  // Název role pro zjednodušení příkladu
  @Column({ length: 50 })
  roleName!: string;

  // Příznak, zda je role aktivní
  @Column({ default: true })
  isActive!: boolean;

  // Volitelný popis role pro daného uživatele
  @Column({ nullable: true, length: 255 })
  description?: string;

  // Vazba na uživatele
  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}