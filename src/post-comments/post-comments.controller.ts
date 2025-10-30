import { Controller, Post, Body, Param } from "@nestjs/common";
import { PostCommentsService } from "./post-comments.service";
import { CreateCommentDto } from "./dto/createComment.dto";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Comments")
@Controller("posts/:postId/comments")
export class PostCommentsController {
  constructor(private readonly postCommentsService: PostCommentsService) {}

  @Post()
  create(@Param("postId") postId: number, @Body() createCommentDto: CreateCommentDto) {
    return this.postCommentsService.createComment(postId, createCommentDto);
  }
}
