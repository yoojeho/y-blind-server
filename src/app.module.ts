import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UsersModule } from "./users/users.module";
import { PostsModule } from "./posts/posts.module";
import { PostCommentsModule } from "./post-comments/post-comments.module";
import { AuthModule } from "./auth/auth.module";
import { DatabaseSeederModule } from "./database/database-seeder.module";
import { PostLikesModule } from "./post-likes/post-likes.module";
import { CommentLikesModule } from "./comment-likes/comment-likes.module";
import { LoggerMiddleware } from "./common/middleware/logger.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 전역에서 ConfigService 사용 가능
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>("NODE_ENV");
        const isProd = nodeEnv === "production";
        const dbUseSsl = configService.get<string>("DB_USE_SSL") === "true";

        return {
          type: "postgres",
          url: configService.get<string>("DATABASE_URL"),
          entities: [__dirname + "/**/*.entity{.ts,.js}"],
          synchronize: !isProd, // Entity 변경 시 자동으로 DB 동기화
          ssl: dbUseSsl ? { rejectUnauthorized: false } : undefined, // 외부 DB 연결 시에만 SSL 사용
        };
      },
    }),
    UsersModule,
    PostsModule,
    PostCommentsModule,
    PostLikesModule,
    CommentLikesModule,
    AuthModule,
    DatabaseSeederModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
