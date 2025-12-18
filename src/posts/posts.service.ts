import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, UpdateResult } from "typeorm";
import { Post } from "./posts.entity";
import { CreatePostDto } from "./dto/createPost.dto";
import { UpdatePostDto } from "./dto/updatePost.dto";
import { GetPostDto } from "./dto/getPost.dto";
import { plainToInstance } from "class-transformer";
import { PostListDto } from "./dto/postList.dto";
import { PostDetailDto } from "./dto/postDetail.dto";
import { User } from "../users/users.entity";
import { JwtPayload } from "../auth/dto/jwtPayload.dto";

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createPost(createPostDto: CreatePostDto, user: JwtPayload): Promise<Post> {
    // JWT 토큰에서 가져온 user 정보로 게시글 생성
    const entity = this.postRepository.create({
      user: { id: user.id },
      ...createPostDto,
    });
    return await this.postRepository.save(entity);
  }

  // 전체 목록
  async findAllPosts(): Promise<GetPostDto> {
    const result = await this.postRepository.find({
      order: { createdAt: "DESC" },
      relations: ["comments", "likes", "user"],
    });

    const data = result.map((post) => ({
      ...post,
      likesCount: post.likes.length || 0,
      commentsCount: post.comments.length || 0,
    }));

    return {
      data: plainToInstance(PostListDto, data, { excludeExtraneousValues: true }),
      limit: data.length,
      total: data.length,
      page: 1,
      totalPages: 1,
    };
  }

  // 페이지네이션 목록
  async findAllPostWithPagination(page: number, limit: number): Promise<GetPostDto> {
    const [result, total] = await this.postRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
      relations: ["comments", "likes", "user"],
    });

    const data = result.map((post) => ({
      ...post,
      likesCount: post.likes.length || 0,
      commentsCount: post.comments.length || 0,
    }));

    return {
      data: plainToInstance(PostListDto, data, { excludeExtraneousValues: true }),
      limit,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findPostById(id: number): Promise<PostDetailDto> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ["comments", "likes", "user"],
    });
    if (!post) {
      throw new NotFoundException(`게시글 with ID ${id} not found`);
    }
    return plainToInstance(PostDetailDto, post, { excludeExtraneousValues: true });
  }

  async updatePost(id: number, dto: UpdatePostDto, user: JwtPayload): Promise<UpdateResult> {
    // 게시글 존재 여부 및 작성자 확인
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ["user"],
    });

    if (!post) {
      throw new NotFoundException(`ID ${id}에 해당하는 게시글을 찾을 수 없습니다.`);
    }

    // 작성자 본인인지 확인
    if (post.user.id !== user.id) {
      throw new ForbiddenException("본인의 게시글만 수정할 수 있습니다.");
    }

    return await this.postRepository.update(id, dto);
  }

  async deletePost(id: number, user: JwtPayload): Promise<void> {
    // 게시글 존재 여부 및 작성자 확인
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ["user"],
    });

    if (!post) {
      throw new NotFoundException(`ID ${id}에 해당하는 게시글을 찾을 수 없습니다.`);
    }

    // 작성자 본인인지 확인
    if (post.user.id !== user.id) {
      throw new ForbiddenException("본인의 게시글만 삭제할 수 있습니다.");
    }

    await this.postRepository.delete(id);
  }
}
