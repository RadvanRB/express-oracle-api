import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  @Index()
  name!: string;

  @Column({ length: 500, nullable: true })
  description?: string;

  @Column({ type: "varchar", length: 50 })
  @Index()
  category!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  subCategory?: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number;

  @Column({ type: "int" })
  stock!: number;

  @Column({ type: "decimal", precision: 6, scale: 2, nullable: true })
  width?: number;

  @Column({ type: "decimal", precision: 6, scale: 2, nullable: true })
  height?: number;

  @Column({ type: "decimal", precision: 6, scale: 2, nullable: true })
  depth?: number;

  @Column({ type: "decimal", precision: 6, scale: 2, nullable: true })
  weight?: number;

  @Column({ type: "varchar", length: 20, nullable: true })
  color?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  manufacturer?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  sku?: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: "timestamp", nullable: true })
  @Index()
  manufactureDate?: Date;

  @Column({ type: "timestamp", nullable: true })
  @Index()
  expiryDate?: Date;

  @Column({ type: "timestamp", nullable: true })
  @Index()
  stockedDate?: Date;

  @Column({ type: "timestamp", nullable: true })
  @Index()
  lastSoldDate?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}