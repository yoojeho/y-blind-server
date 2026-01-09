import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostsController } from "./posts.controller";
import { PostsService } from "./posts.service";
import { Post } from "./posts.entity";
import { User } from "../users/users.entity";
import { HashTagModule } from "../hashtag/hash-tag.module";

@Module({
  imports: [TypeOrmModule.forFeature([Post, User]), HashTagModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
