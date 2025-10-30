import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/users/users.entity";
import { Post } from "src/posts/posts.entity";
import { Expose } from "class-transformer";

export class CommentDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 1 })
  @Expose()
  postId: Post["id"];

  @ApiProperty({ example: 1 })
  @Expose()
  userId: User["id"];

  @ApiProperty({ example: "댓글 내용" })
  @Expose()
  content: string;

  @ApiProperty({ example: "2025-10-28T19:26:42.461Z" })
  @Expose()
  createdAt: Date;
}
