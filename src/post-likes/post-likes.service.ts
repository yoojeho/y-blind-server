import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PostLike } from "./post-likes.entity";
import { Post } from "../posts/posts.entity";
import { JwtPayload } from "../auth/dto/jwtPayload.dto";

@Injectable()
export class PostLikesService {
  constructor(
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async toggleLike(postId: number, user: JwtPayload): Promise<{ isLiked: boolean; count: number }> {
    // 게시글 존재 여부 확인
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`ID ${postId}에 해당하는 게시글을 찾을 수 없습니다.`);
    }

    // 이미 좋아요를 눌렀는지 확인
    const existingLike = await this.postLikeRepository.findOne({
      where: {
        post: { id: postId },
        user: { id: user.id },
      },
    });

    let isLiked: boolean;

    if (existingLike) {
      // 좋아요가 있으면 삭제
      await this.postLikeRepository.remove(existingLike);
      isLiked = false;
    } else {
      // 좋아요가 없으면 추가
      const like = this.postLikeRepository.create({
        post: { id: postId },
        user: { id: user.id },
      });
      await this.postLikeRepository.save(like);
      isLiked = true;
    }

    // 현재 좋아요 개수 조회
    const count = await this.getLikeCount(postId);

    return { isLiked, count };
  }

  async checkLikeStatus(postId: number, user: JwtPayload): Promise<boolean> {
    const like = await this.postLikeRepository.findOne({
      where: {
        post: { id: postId },
        user: { id: user.id },
      },
    });

    return !!like;
  }

  async getLikeCount(postId: number): Promise<number> {
    return await this.postLikeRepository.count({
      where: { post: { id: postId } },
    });
  }
}
