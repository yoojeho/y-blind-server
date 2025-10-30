import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Unique } from "typeorm";
import { Post } from "../posts/posts.entity";
import { User } from "../users/users.entity";

@Entity({ name: "likes" })
@Unique(["post", "user"]) // 한 유저가 같은 포스트에 여러 번 좋아요 못누르도록
export class PostLike {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ManyToOne(() => Post, (p) => p.likes, { onDelete: "CASCADE" })
  post: Post;

  @ManyToOne(() => User, (u) => u.likes, { onDelete: "CASCADE" })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
