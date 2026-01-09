import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  Index,
} from "typeorm";
import { Post } from "../posts/posts.entity";

@Entity({ name: "hashtags" })
@Index(["name"], { unique: true })
export class HashTag {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "varchar", length: 50, nullable: false, unique: true })
  name: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToMany(() => Post, (post) => post.hashtags)
  posts: Post[];

  @CreateDateColumn()
  createdAt: Date;
}
