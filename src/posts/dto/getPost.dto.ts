import { ApiProperty } from "@nestjs/swagger";
import { PostListDto } from "./postList.dto";

export class GetPostDto {
  @ApiProperty({ type: [PostListDto] })
  data: PostListDto[];

  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}
