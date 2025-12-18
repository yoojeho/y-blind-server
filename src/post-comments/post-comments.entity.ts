import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "../posts/posts.entity";
import { User } from "../users/users.entity";
import { CommentLike } from "../comment-likes/comment-likes.entity";

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

  // 부모 댓글 (대댓글인 경우에만 값이 있음)
  @ManyToOne(() => Comment, (c) => c.replies, { nullable: true, onDelete: "CASCADE" })
  parentComment: Comment | null;

  // 자식 댓글들 (대댓글 목록)
  @OneToMany(() => Comment, (c) => c.parentComment)
  replies: Comment[];

  // 댓글 좋아요
  @OneToMany(() => CommentLike, (l) => l.comment, { cascade: true })
  likes: CommentLike[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
