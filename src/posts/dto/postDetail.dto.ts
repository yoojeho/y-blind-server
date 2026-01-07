import { ApiProperty } from "@nestjs/swagger";
import { CommentDto } from "src/post-comments/dto/comment.dto";
import { Expose, Type } from "class-transformer";
import { UserDto } from "src/users/dto/user.dto";

export class PostDetailDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ type: () => UserDto })
  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  @ApiProperty({ example: "게시글 제목" })
  @Expose()
  title: string;

  @ApiProperty({ example: "게시글 내용" })
  @Expose()
  content: string;

  @ApiProperty({ example: "2025-10-28T19:26:42.461Z" })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: "2025-10-28T19:26:42.461Z" })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ example: 0, description: "좋아요 개수" })
  @Expose()
  likeCount: number;

  @ApiProperty({ example: false, description: "내가 좋아요를 눌렀는지 여부 (로그인 시에만)" })
  @Expose()
  isLikedByMe: boolean;

  @ApiProperty({ type: [CommentDto] })
  @Expose()
  comments: CommentDto[];
}
