import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "../users/users.entity";
import { Comment } from "../post-comments/post-comments.entity";
import { PostLike } from "../post-likes/post-likes.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ name: "posts" })
export class Post {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ApiProperty({ example: 1 })
  @ManyToOne(() => User, (u) => u.posts, { nullable: false, onDelete: "CASCADE" })
  user: User;

  @ApiProperty({ example: "게시글 제목" })
  @Column({ type: "varchar", length: 255, nullable: false })
  title: string;

  @ApiProperty({ example: "게시글 내용" })
  @Column({ type: "text", nullable: false })
  content: string;

  @ApiProperty({ example: "2025-10-28T19:26:42.461Z" })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: "2025-10-28T19:26:42.461Z" })
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Comment, (c) => c.post, { cascade: true })
  comments: Comment[];

  @OneToMany(() => PostLike, (l) => l.post, { cascade: true })
  likes: PostLike[];
}
