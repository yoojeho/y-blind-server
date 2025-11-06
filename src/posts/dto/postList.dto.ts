import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { UserDto } from "src/users/dto/user.dto";

export class PostListDto {
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

  @ApiProperty({ example: 1 })
  @Expose()
  likesCount: number;

  @ApiProperty({ example: 1 })
  @Expose()
  commentsCount: number;
}
