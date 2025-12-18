import { ApiProperty } from "@nestjs/swagger";
import { Post } from "src/posts/posts.entity";
import { Expose, Type } from "class-transformer";
import { UserDto } from "src/users/dto/user.dto";

export class CommentDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 1 })
  @Expose()
  postId: Post["id"];

  @ApiProperty({ type: () => UserDto })
  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  @ApiProperty({ example: "댓글 내용" })
  @Expose()
  content: string;

  @ApiProperty({ example: null, description: "부모 댓글 ID (대댓글인 경우)" })
  @Expose()
  parentCommentId: number | null;

  @ApiProperty({ example: [], description: "대댓글 목록", type: () => [CommentDto] })
  @Expose()
  @Type(() => CommentDto)
  replies: CommentDto[];

  @ApiProperty({ example: 0, description: "좋아요 개수" })
  @Expose()
  likeCount: number;

  @ApiProperty({ example: false, description: "내가 좋아요를 눌렀는지 여부 (로그인 시에만)" })
  @Expose()
  isLikedByMe: boolean;

  @ApiProperty({ example: "2025-10-28T19:26:42.461Z" })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: "2025-10-28T19:26:42.461Z" })
  @Expose()
  updatedAt: Date;
}
