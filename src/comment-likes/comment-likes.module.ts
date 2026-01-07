import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommentLike } from "./comment-likes.entity";
import { CommentLikesController } from "./comment-likes.controller";
import { CommentLikesService } from "./comment-likes.service";
import { Comment } from "../post-comments/post-comments.entity";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([CommentLike, Comment]), AuthModule],
  controllers: [CommentLikesController],
  providers: [CommentLikesService],
  exports: [CommentLikesService],
})
export class CommentLikesModule {}
