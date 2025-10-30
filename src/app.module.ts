import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UsersModule } from "./users/users.module";
import { PostsModule } from "./posts/posts.module";
import { PostCommentsModule } from "./post-comments/post-comments.module";
import { AuthModule } from "./auth/auth.module";

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

        return {
          type: "postgres",
          url: configService.get<string>("DATABASE_URL"),
          entities: [__dirname + "/**/*.entity{.ts,.js}"],
          synchronize: !isProd, // Entity 변경 시 자동으로 DB 동기화
          ssl: isProd ? { rejectUnauthorized: false } : undefined, // 로컬에서 개발 시에는 SSL 요구 X
        };
      },
    }),
    UsersModule,
    PostsModule,
    PostCommentsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
