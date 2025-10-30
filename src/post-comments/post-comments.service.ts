import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, UpdateResult } from "typeorm";
import { Comment } from "./post-comments.entity";
import { CreateCommentDto } from "./dto/createComment.dto";
import { UpdateCommentDto } from "./dto/updateComment.dto";
import { CommentDto } from "./dto/comment.dto";
import { plainToInstance } from "class-transformer";

@Injectable()
export class PostCommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async createComment(postId: number, createCommentDto: CreateCommentDto): Promise<Comment> {
    const entity = this.commentRepository.create({
      post: { id: postId },
      ...createCommentDto,
    });
    return await this.commentRepository.save(entity);
  }

  async findAll(): Promise<CommentDto[]> {
    const result = await this.commentRepository.find({
      relations: ["post", "user"],
    });
    return plainToInstance(CommentDto, result, { excludeExtraneousValues: true });
  }

  async updateComment(id: number, dto: UpdateCommentDto): Promise<UpdateResult> {
    return await this.commentRepository.update(id, dto);
  }

  async deleteComment(id: number): Promise<void> {
    const result = await this.commentRepository.delete(id);
    if (result.affected === 0) {
      throw new Error(`댓글 with ID ${id} not found`);
    }
  }
}
