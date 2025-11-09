import { Comment } from "src/post-comments/post-comments.entity";
import { PostLike } from "src/post-likes/post-likes.entity";
import { Post } from "src/posts/posts.entity";
import { Entity, Column, PrimaryGeneratedColumn, Index, OneToMany } from "typeorm";
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

  // Hashed refreshToken (salt: key)
  @Exclude({ toPlainOnly: true })
  @Column({ type: "varchar", nullable: true, unique: true })
  hashedRerfeshToken: string;

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
