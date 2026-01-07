import { Controller, Post, Param, UseGuards, Request, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { PostLikesService } from "./post-likes.service";
import { JwtAuthGuard } from "../auth/auth.guard";
import type { RequestWithUser } from "../common/requests/requestWithUser";

@ApiTags("Post Likes")
@Controller("posts/:postId/likes")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PostLikesController {
  constructor(private readonly postLikesService: PostLikesService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "게시글 좋아요 토글 (좋아요 추가/취소)" })
  @ApiParam({ name: "postId", description: "게시글 ID", type: Number })
  @ApiResponse({
    status: 200,
    description: "좋아요 토글 성공",
    schema: {
      properties: {
        message: { type: "string", example: "좋아요를 추가했습니다. 또는 취소했습니다." },
        isLiked: { type: "boolean", example: true },
        count: { type: "number", example: 1 },
      },
    },
  })
  async toggleLike(@Param("postId") postId: number, @Request() req: RequestWithUser) {
    const result = await this.postLikesService.toggleLike(postId, req.user);
    return {
      message: result.isLiked ? "좋아요를 추가했습니다." : "좋아요를 취소했습니다.",
      ...result,
    };
  }
}
