import { CreateDateColumn, UpdateDateColumn } from "typeorm";

export abstract class BaseTimeEntity {
  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
