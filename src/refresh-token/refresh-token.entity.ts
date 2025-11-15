import { User } from "src/users/users.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  // hashed refresh token
  @Column({ type: "varchar", nullable: true })
  value: string;

  // User 1:1
  @OneToOne(() => User, (user) => user.hashedRefreshToken, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  user: User;
}
