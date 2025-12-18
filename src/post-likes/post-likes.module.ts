import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostLike } from "./post-likes.entity";
import { Post } from "../posts/posts.entity";
import { PostLikesController } from "./post-likes.controller";
import { PostLikesService } from "./post-likes.service";

@Module({
  imports: [TypeOrmModule.forFeature([PostLike, Post])],
  controllers: [PostLikesController],
  providers: [PostLikesService],
  exports: [PostLikesService],
})
export class PostLikesModule {}
