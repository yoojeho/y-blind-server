import { ApiProperty } from "@nestjs/swagger";
import { PostDto } from "./post.dto";

export class GetPostDto {
  @ApiProperty({ type: [PostDto] })
  data: PostDto[];

  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}
