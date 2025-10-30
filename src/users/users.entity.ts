import { Comment } from "src/post-comments/post-comments.entity";
import { PostLike } from "src/post-likes/post-likes.entity";
import { Post } from "src/posts/posts.entity";
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @OneToMany(() => Post, (p) => p.user)
  posts: Post[];

  @OneToMany(() => Comment, (c) => c.user)
  comments: Comment[];

  @OneToMany(() => PostLike, (l) => l.user)
  likes: PostLike[];
}
