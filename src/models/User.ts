import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  @Index()
  firstName!: string;

  @Column({ length: 100 })
  @Index()
  lastName!: string;

  @Column({ length: 255, unique: true })
  email!: string;

  @Column({ select: false }) // Heslo nebude ve výchozím stavu zahrnuto v dotazech
  password!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true, type: "varchar", length: 20 })
  @Index()
  phone?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  address?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}