import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, UpdateResult, IsNull } from "typeorm";
import { Comment } from "./post-comments.entity";
import { Post } from "../posts/posts.entity";
import { CreateCommentDto } from "./dto/createComment.dto";
import { UpdateCommentDto } from "./dto/updateComment.dto";
import { CommentDto } from "./dto/comment.dto";
import { plainToInstance } from "class-transformer";
import { JwtPayload } from "../auth/dto/jwtPayload.dto";

@Injectable()
export class PostCommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async createComment(
    postId: number,
    createCommentDto: CreateCommentDto,
    user: JwtPayload,
  ): Promise<Comment> {
    // 게시글 존재 여부 확인
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`ID ${postId}에 해당하는 게시글을 찾을 수 없습니다.`);
    }

    const { parentCommentId, content } = createCommentDto;

    // 대댓글인 경우
    if (parentCommentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: parentCommentId },
        relations: ["parentComment"],
      });

      if (!parentComment) {
        throw new NotFoundException(`ID ${parentCommentId}에 해당하는 댓글을 찾을 수 없습니다.`);
      }

      // 부모 댓글이 이미 대댓글이면 3단계가 되므로 막기
      if (parentComment.parentComment !== null) {
        throw new BadRequestException("대댓글의 댓글은 작성할 수 없습니다.");
      }

      const entity = this.commentRepository.create({
        post: { id: postId },
        user: { id: user.id },
        content,
        parentComment: { id: parentCommentId },
      });

      return await this.commentRepository.save(entity);
    }

    // 일반 댓글
    const entity = this.commentRepository.create({
      post: { id: postId },
      user: { id: user.id },
      content,
    });

    return await this.commentRepository.save(entity);
  }

  async findByPostId(postId: number, userId?: number): Promise<CommentDto[]> {
    // 부모 댓글만 조회 (대댓글은 replies로 가져옴)
    const comments = await this.commentRepository.find({
      where: {
        post: { id: postId },
        parentComment: IsNull(),
      },
      relations: [
        "user",
        "replies",
        "replies.user",
        "likes",
        "likes.user",
        "replies.likes",
        "replies.likes.user",
      ],
      order: {
        createdAt: "ASC",
        replies: {
          createdAt: "ASC",
        },
      },
    });

    return comments.map((comment) => {
      const dto = plainToInstance(CommentDto, comment, { excludeExtraneousValues: true });
      dto.postId = postId;
      dto.parentCommentId = null;
      dto.likeCount = comment.likes?.length || 0;
      dto.isLikedByMe = userId
        ? comment.likes?.some((like) => like.user.id === userId) || false
        : false;
      dto.replies = comment.replies.map((reply) => {
        const replyDto = plainToInstance(CommentDto, reply, { excludeExtraneousValues: true });
        replyDto.postId = postId;
        replyDto.parentCommentId = comment.id;
        replyDto.likeCount = reply.likes?.length || 0;
        replyDto.isLikedByMe = userId
          ? reply.likes?.some((like) => like.user.id === userId) || false
          : false;
        replyDto.replies = [];
        return replyDto;
      });
      return dto;
    });
  }

  async updateComment(id: number, dto: UpdateCommentDto, user: JwtPayload): Promise<UpdateResult> {
    // 댓글 존재 여부 및 작성자 확인
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ["user"],
    });

    if (!comment) {
      throw new NotFoundException(`ID ${id}에 해당하는 댓글을 찾을 수 없습니다.`);
    }

    // 작성자 본인인지 확인
    if (comment.user.id !== user.id) {
      throw new ForbiddenException("본인의 댓글만 수정할 수 있습니다.");
    }

    return await this.commentRepository.update(id, dto);
  }

  async deleteComment(id: number, user: JwtPayload): Promise<void> {
    // 댓글 존재 여부 및 작성자 확인
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ["user"],
    });

    if (!comment) {
      throw new NotFoundException(`ID ${id}에 해당하는 댓글을 찾을 수 없습니다.`);
    }

    // 작성자 본인인지 확인
    if (comment.user.id !== user.id) {
      throw new ForbiddenException("본인의 댓글만 삭제할 수 있습니다.");
    }

    await this.commentRepository.delete(id);
  }
}
