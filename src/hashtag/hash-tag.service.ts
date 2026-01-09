import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { HashTag } from "./hash-tag.entity";
import { Post } from "../posts/posts.entity";

@Injectable()
export class HashTagService {
  constructor(
    @InjectRepository(HashTag)
    private readonly hashTagRepository: Repository<HashTag>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  /**
   * 해시태그 이름 배열을 받아서 해시태그 엔티티 배열을 반환
   * 존재하지 않는 해시태그는 새로 생성
   */
  async findOrCreateHashtags(hashtagNames: string[]): Promise<HashTag[]> {
    if (!hashtagNames || hashtagNames.length === 0) {
      return [];
    }

    // 해시태그 이름 정규화 (# 제거, 소문자 변환, 공백 제거)
    const normalizedNames = hashtagNames
      .map((name) => name.trim().replace(/^#/, "").toLowerCase())
      .filter((name) => name.length > 0);

    if (normalizedNames.length === 0) {
      return [];
    }

    // 기존 해시태그 조회
    const existingHashtags = await this.hashTagRepository.find({
      where: { name: In(normalizedNames) },
    });

    const existingNames = new Set(existingHashtags.map((h) => h.name));
    const newNames = normalizedNames.filter((name) => !existingNames.has(name));

    // 새로운 해시태그 생성
    const newHashtags = newNames.map((name) => this.hashTagRepository.create({ name }));
    if (newHashtags.length > 0) {
      await this.hashTagRepository.save(newHashtags);
    }

    return [...existingHashtags, ...newHashtags];
  }

  /**
   * 게시글에 해시태그 연결
   */
  async attachHashtagsToPost(postId: number, hashtagNames: string[]): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ["hashtags"],
    });

    if (!post) {
      throw new NotFoundException(`ID ${postId}에 해당하는 게시글을 찾을 수 없습니다.`);
    }

    const hashtags = await this.findOrCreateHashtags(hashtagNames);
    post.hashtags = hashtags;
    await this.postRepository.save(post);
  }

  /**
   * 해시태그 이름으로 게시글 검색
   */
  async findPostsByHashtag(hashtagName: string, page: number = 1, limit: number = 10) {
    const normalizedName = hashtagName.trim().replace(/^#/, "").toLowerCase();

    const hashtag = await this.hashTagRepository.findOne({
      where: { name: normalizedName },
      relations: ["posts", "posts.user", "posts.likes", "posts.comments"],
    });

    if (!hashtag) {
      return {
        data: [],
        limit,
        total: 0,
        page,
        totalPages: 0,
      };
    }

    const total = hashtag.posts.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = hashtag.posts.slice(startIndex, endIndex);

    return {
      data: paginatedPosts,
      limit,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 인기 해시태그 조회 (게시글 수가 많은 순서)
   */
  async findPopularHashtags(
    limit: number = 10,
  ): Promise<Array<Pick<HashTag, "id" | "name" | "createdAt"> & { postCount: number }>> {
    const hashtags = await this.hashTagRepository
      .createQueryBuilder("hashtag")
      .leftJoin("hashtag.posts", "post")
      .select("hashtag.id", "id")
      .addSelect("hashtag.name", "name")
      .addSelect("hashtag.createdAt", "createdAt")
      .addSelect("COUNT(post.id)", "postCount")
      .groupBy("hashtag.id")
      .addGroupBy("hashtag.name")
      .addGroupBy("hashtag.createdAt")
      .orderBy("COUNT(post.id)", "DESC")
      .addOrderBy("hashtag.createdAt", "DESC")
      .limit(limit)
      .getRawMany();

    return hashtags.map(
      (h: { id: number; name: string; createdAt: Date | string; postCount: string }) => ({
        id: Number(h.id),
        name: String(h.name),
        createdAt: h.createdAt instanceof Date ? h.createdAt : new Date(h.createdAt),
        postCount: parseInt(String(h.postCount), 10) || 0,
      }),
    );
  }

  /**
   * 모든 해시태그 조회
   */
  async findAllHashtags(): Promise<HashTag[]> {
    return await this.hashTagRepository.find({
      order: { createdAt: "DESC" },
    });
  }
}
