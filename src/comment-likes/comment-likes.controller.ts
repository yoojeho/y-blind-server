import { Controller, Post, Param, UseGuards, Request, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { CommentLikesService } from "./comment-likes.service";
import { JwtAuthGuard } from "../auth/auth.guard";
import type { RequestWithUser } from "../common/requests/requestWithUser";

@ApiTags("Comment Likes")
@Controller("comments/:commentId/likes")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommentLikesController {
  constructor(private readonly commentLikesService: CommentLikesService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "댓글 좋아요 토글 (좋아요 추가/취소)" })
  @ApiParam({ name: "commentId", description: "댓글 ID", type: Number })
  @ApiResponse({
    status: 200,
    description: "좋아요 토글 성공",
    schema: {
      properties: {
        message: { type: "string", example: "좋아요를 추가했습니다." },
        isLiked: { type: "boolean", example: true },
        count: { type: "number", example: 0 },
      },
    },
  })
  @ApiResponse({ status: 404, description: "댓글을 찾을 수 없음" })
  async toggleLike(@Param("commentId") commentId: number, @Request() req: RequestWithUser) {
    const result = await this.commentLikesService.toggleLike(commentId, req.user);
    return {
      message: result.isLiked ? "좋아요를 추가했습니다." : "좋아요를 취소했습니다.",
      ...result,
    };
  }
}
