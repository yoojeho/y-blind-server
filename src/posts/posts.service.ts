import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Post } from "./posts.entity";
import { CreatePostDto } from "./dto/createPost.dto";
import { UpdatePostDto } from "./dto/updatePost.dto";
import { GetPostDto } from "./dto/getPost.dto";
import { plainToInstance } from "class-transformer";
import { PostListDto } from "./dto/postList.dto";
import { PostDetailDto } from "./dto/postDetail.dto";
import { User } from "../users/users.entity";
import { CommentDto } from "../post-comments/dto/comment.dto";
import { JwtPayload } from "../auth/dto/jwtPayload.dto";
import { HashTagService } from "../hashtag/hash-tag.service";

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashTagService: HashTagService,
  ) {}

  async createPost(createPostDto: CreatePostDto, user: JwtPayload): Promise<Post> {
    // 해시태그 분리
    const { hashtags, ...postData } = createPostDto;

    // JWT 토큰에서 가져온 user 정보로 게시글 생성
    const entity = this.postRepository.create({
      user: { id: user.id },
      ...postData,
    });
    const savedPost = await this.postRepository.save(entity);

    // 해시태그 연결
    if (hashtags && hashtags.length > 0) {
      await this.hashTagService.attachHashtagsToPost(savedPost.id, hashtags);
    }

    // 해시태그를 포함한 게시글 반환
    const foundPost = await this.postRepository.findOne({
      where: { id: savedPost.id },
      relations: ["hashtags", "user"],
    });

    if (!foundPost) {
      throw new NotFoundException(`ID ${savedPost.id}에 해당하는 게시글을 찾을 수 없습니다.`);
    }
    return foundPost;
  }

  // 전체 목록
  async findAllPosts(userId?: number): Promise<GetPostDto> {
    const result = await this.postRepository.find({
      order: { createdAt: "DESC" },
      relations: ["comments", "likes", "likes.user", "user", "hashtags"],
    });

    const data = result.map((post) => ({
      ...post,
      likeCount: post.likes.length || 0,
      commentsCount: post.comments.length || 0,
      isLikedByMe: userId ? post.likes.some((like) => like.user.id === userId) : false,
      hashtags: post.hashtags?.map((h) => h.name) || [],
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
  async findAllPostWithPagination(
    page: number,
    limit: number,
    userId?: number,
  ): Promise<GetPostDto> {
    const [result, total] = await this.postRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
      relations: ["comments", "likes", "likes.user", "user", "hashtags"],
    });

    const data = result.map((post) => ({
      ...post,
      likeCount: post.likes.length || 0,
      commentsCount: post.comments.length || 0,
      isLikedByMe: userId ? post.likes.some((like) => like.user.id === userId) : false,
      hashtags: post.hashtags?.map((h) => h.name) || [],
    }));

    return {
      data: plainToInstance(PostListDto, data, { excludeExtraneousValues: true }),
      limit,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findPostById(id: number, userId?: number): Promise<PostDetailDto> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: [
        "user",
        "likes",
        "likes.user",
        "hashtags",
        "comments",
        "comments.user",
        "comments.likes",
        "comments.likes.user",
        "comments.parentComment",
        "comments.replies",
        "comments.replies.user",
        "comments.replies.likes",
        "comments.replies.likes.user",
      ],
      order: {
        comments: {
          createdAt: "ASC",
        },
      },
    });
    if (!post) {
      throw new NotFoundException(`게시글 with ID ${id} not found`);
    }

    const postData = plainToInstance(PostDetailDto, post, { excludeExtraneousValues: true });
    postData.likeCount = post.likes?.length || 0;
    postData.isLikedByMe = userId ? post.likes.some((like) => like.user.id === userId) : false;
    postData.hashtags = post.hashtags?.map((h) => h.name) || [];

    // 댓글 데이터 매핑 (부모 댓글만 필터링)
    const parentComments = post.comments.filter((comment) => !comment.parentComment);
    postData.comments = parentComments.map((comment) => {
      const commentDto = plainToInstance(CommentDto, comment, { excludeExtraneousValues: true });
      commentDto.postId = post.id;
      commentDto.parentCommentId = null;
      commentDto.likeCount = comment.likes?.length || 0;
      commentDto.isLikedByMe = userId
        ? comment.likes?.some((like) => like.user.id === userId) || false
        : false;
      commentDto.replies =
        comment.replies?.map((reply) => {
          const replyDto = plainToInstance(CommentDto, reply, { excludeExtraneousValues: true });
          replyDto.postId = post.id;
          replyDto.parentCommentId = comment.id;
          replyDto.likeCount = reply.likes?.length || 0;
          replyDto.isLikedByMe = userId
            ? reply.likes?.some((like) => like.user.id === userId) || false
            : false;
          replyDto.replies = [];
          return replyDto;
        }) || [];
      return commentDto;
    });

    return postData;
  }

  async updatePost(id: number, dto: UpdatePostDto, user: JwtPayload): Promise<Post> {
    // 게시글 존재 여부 및 작성자 확인
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ["user", "hashtags"],
    });

    if (!post) {
      throw new NotFoundException(`ID ${id}에 해당하는 게시글을 찾을 수 없습니다.`);
    }

    // 작성자 본인인지 확인
    if (post.user.id !== user.id) {
      throw new ForbiddenException("본인의 게시글만 수정할 수 있습니다.");
    }

    // 해시태그 분리
    const { hashtags, ...postData } = dto;

    // 게시글 내용 업데이트
    if (Object.keys(postData).length > 0) {
      await this.postRepository.update(id, postData);
    }

    // 해시태그 업데이트
    if (hashtags) {
      await this.hashTagService.attachHashtagsToPost(id, hashtags);
    }

    // 업데이트된 게시글 반환
    const updatedPost = await this.postRepository.findOne({
      where: { id },
      relations: ["hashtags", "user"],
    });
    if (!updatedPost) {
      throw new NotFoundException(`ID ${id}에 해당하는 게시글을 찾을 수 없습니다.`);
    }
    return updatedPost;
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
