import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { PostCommentsService } from "./post-comments.service";
import { CreateCommentDto } from "./dto/createComment.dto";
import { UpdateCommentDto } from "./dto/updateComment.dto";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/auth.guard";
import { OptionalJwtAuthGuard } from "../auth/optional-jwt-auth.guard";
import type { RequestWithUser, RequestWithOptionalUser } from "../common/requests/requestWithUser";

@ApiTags("Comments")
@Controller("posts/:postId/comments")
export class PostCommentsController {
  constructor(private readonly postCommentsService: PostCommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "댓글 작성 (대댓글 포함)",
    description: "대댓글 작성 시 'parentCommentId' 필요</br> 대댓글의 댓글은 작성 불가",
  })
  @ApiParam({ name: "postId", description: "게시글 ID", type: Number })
  @ApiResponse({ status: 400, description: "대댓글의 댓글은 작성 불가" })
  create(
    @Param("postId") postId: number,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: RequestWithUser,
  ) {
    return this.postCommentsService.createComment(postId, createCommentDto, req.user);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: "게시글의 댓글 목록 조회 (대댓글 포함)" })
  @ApiParam({ name: "postId", description: "게시글 ID", type: Number })
  findByPostId(@Param("postId") postId: number, @Request() req: RequestWithOptionalUser) {
    const userId = req.user?.id; // 로그인한 경우에만 userId 존재
    return this.postCommentsService.findByPostId(postId, userId);
  }

  @Patch(":commentId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "댓글 수정" })
  @ApiParam({ name: "postId", description: "게시글 ID", type: Number })
  @ApiParam({ name: "commentId", description: "댓글 ID", type: Number })
  update(
    @Param("commentId") commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req: RequestWithUser,
  ) {
    return this.postCommentsService.updateComment(commentId, updateCommentDto, req.user);
  }

  @Delete(":commentId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "댓글 삭제" })
  @ApiParam({ name: "postId", description: "게시글 ID", type: Number })
  @ApiParam({ name: "commentId", description: "댓글 ID", type: Number })
  async delete(@Param("commentId") commentId: number, @Request() req: RequestWithUser) {
    await this.postCommentsService.deleteComment(commentId, req.user);
  }
}
