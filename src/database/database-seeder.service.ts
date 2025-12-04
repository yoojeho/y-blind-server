import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/users.entity";
import { Post } from "../posts/posts.entity";
import { ConfigService } from "@nestjs/config";
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";

const scrypt = promisify(_scrypt);

@Injectable()
export class DatabaseSeederService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const nodeEnv = this.configService.get<string>("NODE_ENV");
    const enableSeedData = this.configService.get<string>("ENABLE_SEED_DATA");

    // 개발 환경이고 ENABLE_SEED_DATA가 true일 때만 시드 데이터 생성
    if (nodeEnv === "development" && enableSeedData === "true") {
      await this.seedData();
    } else if (nodeEnv === "development" && enableSeedData !== "true") {
      this.logger.log("시드 데이터 생성이 비활성화되어 있습니다.");
    }
  }

  private async seedData() {
    try {
      // 이미 데이터가 있는지 확인
      const userCount = await this.userRepository.count();

      if (userCount > 0) {
        this.logger.log("시드 데이터가 이미 존재합니다. 건너뜁니다.");
        return;
      }

      this.logger.log("시드 데이터 생성을 시작합니다...");

      // 테스트 유저 2명 생성
      const salt = randomBytes(16).toString("hex");
      const key = (await scrypt("test1234", salt, 32)) as Buffer;
      const passwordHash = `${salt}:${key.toString("hex")}`;

      const user1 = this.userRepository.create({
        username: "testuser1",
        nickname: "테스트유저1",
        passwordHash,
      });

      const user2 = this.userRepository.create({
        username: "testuser2",
        nickname: "테스트유저2",
        passwordHash,
      });

      await this.userRepository.save([user1, user2]);
      this.logger.log(`✅ 테스트 유저 2명 생성 완료`);

      // 각 유저가 생성한 게시글들
      const posts = [
        // User 1의 게시글
        {
          user: user1,
          title: "첫 번째 게시글",
          content: "안녕하세요! 이것은 테스트용 첫 번째 게시글입니다.",
        },
        {
          user: user1,
          title: "두 번째 게시글",
          content: "안녕하세요! 이것은 테스트용 두 번째 게시글입니다.",
        },
        {
          user: user1,
          title: "세 번째 게시글",
          content: "안녕하세요! 이것은 테스트용 세 번째 게시글입니다.",
        },

        // User 2의 게시글
        {
          user: user2,
          title: "네 번째 게시글",
          content: "안녕하세요! 이것은 테스트용 네 번째 게시글입니다.",
        },
        {
          user: user2,
          title: "다섯 번째 게시글",
          content: "안녕하세요! 이것은 테스트용 다섯 번째 게시글입니다.",
        },
        {
          user: user2,
          title: "여섯 번째 게시글",
          content: "안녕하세요! 이것은 테스트용 여섯 번째 게시글입니다.",
        },
        {
          user: user2,
          title: "일곱 번째 게시글",
          content: "안녕하세요! 이것은 테스트용 일곱 번째 게시글입니다.",
        },
      ];

      const createdPosts: Post[] = [];
      for (const postData of posts) {
        const post = this.postRepository.create(postData);
        createdPosts.push(post);
      }

      await this.postRepository.save(createdPosts);
      this.logger.log(`✅ 게시글 ${createdPosts.length}개 생성 완료`);

      this.logger.log("🎉 시드 데이터 생성이 완료되었습니다!");
      this.logger.log("");
      this.logger.log("📝 테스트 계정 정보:");
      this.logger.log("  - Username: testuser1 / Password: test1234");
      this.logger.log("  - Username: testuser2 / Password: test1234");
      this.logger.log("");
    } catch (error) {
      this.logger.error("시드 데이터 생성 중 오류 발생:", error);
    }
  }
}
