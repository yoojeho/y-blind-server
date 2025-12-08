import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/users.entity";
import { Post } from "../posts/posts.entity";
import { DatabaseSeederService } from "./database-seeder.service";

@Module({
  imports: [TypeOrmModule.forFeature([User, Post])],
  providers: [DatabaseSeederService],
})
export class DatabaseSeederModule {}
