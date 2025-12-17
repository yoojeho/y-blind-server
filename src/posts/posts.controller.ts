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
import { ApiOkResponse, ApiQuery, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { GetPostDto } from "./dto/getPost.dto";
import { UpdatePostDto } from "./dto/updatePost.dto";
import { PostDetailDto } from "./dto/postDetail.dto";
import { JwtAuthGuard } from "../auth/auth.guard";
import type { RequestWithUser } from "../common/requests/requestWithUser";

@ApiTags("Posts")
@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createPost(@Body() createPostDto: CreatePostDto, @Request() req: RequestWithUser) {
    return this.postsService.createPost(createPostDto, req.user);
  }

  @Get()
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "limit", required: false, example: 10 })
  @ApiOkResponse({ type: GetPostDto, description: "게시글 목록" })
  getPosts(@Query("page") page: number, @Query("limit") limit: number) {
    if (!page || !limit) {
      return this.postsService.findAllPosts();
    }
    return this.postsService.findAllPostWithPagination(Number(page), Number(limit));
  }

  @Get(":id")
  @ApiOkResponse({ type: PostDetailDto, description: "게시글 상세" })
  getPostById(@Param("id") id: number) {
    return this.postsService.findPostById(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updatePost(
    @Param("id") id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req: RequestWithUser,
  ) {
    return this.postsService.updatePost(id, updatePostDto, req.user);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deletePost(@Param("id") id: number, @Request() req: RequestWithUser) {
    return this.postsService.deletePost(id, req.user);
  }
}
