import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Comment } from "./post-comments.entity";
import { PostCommentsController } from "./post-comments.controller";
import { PostCommentsService } from "./post-comments.service";
import { PostsModule } from "../posts/posts.module";

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), PostsModule],
  controllers: [PostCommentsController],
  providers: [PostCommentsService],
})
export class PostCommentsModule {}
