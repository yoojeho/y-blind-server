import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Comment } from "./post-comments.entity";
import { Post } from "../posts/posts.entity";
import { PostCommentsController } from "./post-comments.controller";
import { PostCommentsService } from "./post-comments.service";

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Post])],
  controllers: [PostCommentsController],
  providers: [PostCommentsService],
  exports: [PostCommentsService],
})
export class PostCommentsModule {}
