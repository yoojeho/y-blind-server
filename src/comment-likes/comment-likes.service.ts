import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CommentLike } from "./comment-likes.entity";
import { Comment } from "../post-comments/post-comments.entity";
import { JwtPayload } from "../auth/dto/jwtPayload.dto";

@Injectable()
export class CommentLikesService {
  constructor(
    @InjectRepository(CommentLike)
    private readonly commentLikeRepository: Repository<CommentLike>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async toggleLike(
    commentId: number,
    user: JwtPayload,
  ): Promise<{ isLiked: boolean; count: number }> {
    // 댓글 존재 여부 확인
    const comment = await this.commentRepository.findOne({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException(`ID ${commentId}에 해당하는 댓글을 찾을 수 없습니다.`);
    }

    // 이미 좋아요를 눌렀는지 확인
    const existingLike = await this.commentLikeRepository.findOne({
      where: {
        comment: { id: commentId },
        user: { id: user.id },
      },
    });

    let isLiked: boolean;

    if (existingLike) {
      // 좋아요가 있으면 삭제
      await this.commentLikeRepository.remove(existingLike);
      isLiked = false;
    } else {
      // 좋아요가 없으면 추가
      const like = this.commentLikeRepository.create({
        comment: { id: commentId },
        user: { id: user.id },
      });
      await this.commentLikeRepository.save(like);
      isLiked = true;
    }

    // 현재 좋아요 개수 조회
    const count = await this.getLikeCount(commentId);

    return { isLiked, count };
  }

  async checkLikeStatus(commentId: number, user: JwtPayload): Promise<boolean> {
    const like = await this.commentLikeRepository.findOne({
      where: {
        comment: { id: commentId },
        user: { id: user.id },
      },
    });

    return !!like;
  }

  async getLikeCount(commentId: number): Promise<number> {
    return await this.commentLikeRepository.count({
      where: { comment: { id: commentId } },
    });
  }
}
