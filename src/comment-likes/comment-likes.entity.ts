import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Unique } from "typeorm";
import { Comment } from "../post-comments/post-comments.entity";
import { User } from "../users/users.entity";

@Entity({ name: "comment_likes" })
@Unique(["comment", "user"]) // 한 유저가 같은 댓글에 여러 번 좋아요 못누르도록
export class CommentLike {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ManyToOne(() => Comment, (c) => c.likes, { onDelete: "CASCADE" })
  comment: Comment;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
