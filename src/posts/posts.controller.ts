import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
} from "@nestjs/common";
import { PostsService } from "./posts.service";
import { CreatePostDto } from "./dto/createPost.dto";
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";
import { GetPostDto } from "./dto/getPost.dto";
import { UpdatePostDto } from "./dto/updatePost.dto";
import { PostDetailDto } from "./dto/postDetail.dto";
import { OptionalJwtAuthGuard } from "../auth/optional-jwt-auth.guard";
import type { RequestWithOptionalUser } from "../common/requests/requestWithUser";
import { JwtAuthGuard } from "src/auth/auth.guard";

@ApiTags("Posts")
@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createPost(@Body() createPostDto: CreatePostDto) {
    return this.postsService.createPost(createPostDto);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "limit", required: false, example: 10 })
  @ApiOkResponse({ type: GetPostDto, description: "게시글 목록" })
  getPosts(
    @Query("page") page: number,
    @Query("limit") limit: number,
    @Request() req: RequestWithOptionalUser,
  ) {
    const userId = req.user?.id;
    if (!page || !limit) {
      return this.postsService.findAllPosts(userId);
    }
    return this.postsService.findAllPostWithPagination(Number(page), Number(limit), userId);
  }

  @Get(":id")
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: PostDetailDto, description: "게시글 상세" })
  getPostById(@Param("id") id: number, @Request() req: RequestWithOptionalUser) {
    const userId = req.user?.id;
    return this.postsService.findPostById(id, userId);
  }

  @Patch(":id")
  updatePost(@Param("id") id: number, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.updatePost(id, updatePostDto);
  }

  @Delete(":id")
  deletePost(@Param("id") id: number) {
    return this.postsService.deletePost(id);
  }
}
