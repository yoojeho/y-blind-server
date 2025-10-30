import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Post } from "../posts/posts.entity";
import { User } from "../users/users.entity";

@Entity({ name: "comments" })
export class Comment {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ManyToOne(() => Post, (p) => p.comments, { onDelete: "CASCADE" })
  post: Post;

  @ManyToOne(() => User, (u) => u.comments, { nullable: false, onDelete: "CASCADE" })
  user: User;

  @Column({ type: "text" })
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
