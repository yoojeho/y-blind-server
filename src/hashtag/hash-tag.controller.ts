import {
  Controller,
  Get,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger";
import { HashTagService } from "./hash-tag.service";

@ApiTags("Hashtags")
@Controller("hashtags")
export class HashTagController {
  constructor(private readonly hashTagService: HashTagService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "모든 해시태그 조회" })
  @ApiResponse({
    status: 200,
    description: "해시태그 목록 조회 성공",
  })
  async findAllHashtags() {
    const hashtags = await this.hashTagService.findAllHashtags();
    return {
      data: hashtags,
      total: hashtags.length,
    };
  }

  @Get("popular")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "인기 해시태그 조회" })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "조회할 개수",
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: "인기 해시태그 조회 성공",
  })
  async findPopularHashtags(@Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number) {
    const hashtags = await this.hashTagService.findPopularHashtags(limit);
    return {
      data: hashtags,
      total: hashtags.length,
    };
  }

  @Get(":name/posts")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "해시태그로 게시글 검색" })
  @ApiParam({ name: "name", description: "해시태그 이름", type: String })
  @ApiQuery({ name: "page", required: false, type: Number, description: "페이지 번호", example: 1 })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "페이지당 개수",
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: "해시태그로 게시글 검색 성공",
  })
  async findPostsByHashtag(
    @Param("name") hashtagName: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.hashTagService.findPostsByHashtag(hashtagName, page, limit);
  }
}
