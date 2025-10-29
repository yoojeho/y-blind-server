import { Entity, Column, PrimaryGeneratedColumn, Index } from "typeorm";
import { Exclude } from "class-transformer";
import { BaseTimeEntity } from "../common/entities/base-time.entity";

@Entity()
export class User extends BaseTimeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // Required username (what signup receives as id)
  @Index({ unique: true })
  @Column({ type: "varchar", unique: true })
  username: string;

  // Hashed password (salt:key)
  @Exclude({ toPlainOnly: true })
  @Column({ type: "varchar" })
  passwordHash: string;

  // Optional display name
  @Column({ type: "varchar", nullable: true })
  nickname: string | null;
}
