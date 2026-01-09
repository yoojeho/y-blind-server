import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HashTag } from "./hash-tag.entity";
import { Post } from "../posts/posts.entity";
import { HashTagController } from "./hash-tag.controller";
import { HashTagService } from "./hash-tag.service";

@Module({
  imports: [TypeOrmModule.forFeature([HashTag, Post])],
  controllers: [HashTagController],
  providers: [HashTagService],
  exports: [HashTagService],
})
export class HashTagModule {}
