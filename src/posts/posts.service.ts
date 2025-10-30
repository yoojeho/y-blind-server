import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, UpdateResult } from "typeorm";
import { Post } from "./posts.entity";
import { CreatePostDto } from "./dto/createPost.dto";
import { UpdatePostDto } from "./dto/updatePost.dto";
import { GetPostDto } from "./dto/getPost.dto";
import { plainToInstance } from "class-transformer";
import { PostDto } from "./dto/post.dto";
import { User } from "../users/users.entity";

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createPost(createPostDto: CreatePostDto): Promise<Post> {
    const { userId, ...postData } = createPostDto;

    // 사용자 존재 여부 확인
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`ID ${userId}에 해당하는 사용자를 찾을 수 없습니다.`);
    }

    const entity = this.postRepository.create({
      user: { id: userId },
      ...postData,
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
    }));

    return {
      data: plainToInstance(PostDto, data, { excludeExtraneousValues: true }),
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
    }));

    return {
      data: plainToInstance(PostDto, data, { excludeExtraneousValues: true }),
      limit,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findPostById(id: number): Promise<PostDto> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ["comments", "likes", "user"],
    });
    if (!post) {
      throw new NotFoundException(`게시글 with ID ${id} not found`);
    }
    return plainToInstance(PostDto, post, { excludeExtraneousValues: true });
  }

  async updatePost(id: number, dto: UpdatePostDto): Promise<UpdateResult> {
    return await this.postRepository.update(id, dto);
  }

  async deletePost(id: number): Promise<void> {
    const result = await this.postRepository.delete(id);
    if (result.affected === 0) {
      throw new Error(`게시글 with ID ${id} not found`);
    }
  }
}
