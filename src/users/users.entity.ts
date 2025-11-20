import { Comment } from "src/post-comments/post-comments.entity";
import { PostLike } from "src/post-likes/post-likes.entity";
import { Post } from "src/posts/posts.entity";
import { Entity, Column, PrimaryGeneratedColumn, Index, OneToMany, OneToOne } from "typeorm";
import { Exclude } from "class-transformer";
import { BaseTimeEntity } from "../common/entities/base-time.entity";
import { RefreshToken } from "src/refresh-token/refresh-token.entity";

@Entity()
export class User extends BaseTimeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: "varchar", unique: true })
  username: string;

  // Hashed password (salt:key)
  @Exclude({ toPlainOnly: true })
  @Column({ type: "varchar", nullable: true })
  passwordHash: string | null;

  // Hashed refreshToken
  @OneToOne(() => RefreshToken, (rt) => rt.user, {
    cascade: true,
  })
  hashedRefreshToken: RefreshToken | null;

  // Optional display name
  @Column({ type: "varchar", nullable: true })
  nickname: string | null;

  @OneToMany(() => Post, (p) => p.user)
  posts: Post[];

  @OneToMany(() => Comment, (c) => c.user)
  comments: Comment[];

  @OneToMany(() => PostLike, (l) => l.user)
  likes: PostLike[];
}
