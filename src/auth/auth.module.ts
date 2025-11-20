import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { User } from "../users/users.entity";
import { JwtAuthGuard, KakaoAuthGuard } from "./auth.guard";
import { JwtStrategy } from "./jwt.strategy";
import { RefreshToken } from "src/refresh-token/refresh-token.entity";
import { KakaoStrategy } from "./kakao.strategy";

@Module({
  imports: [TypeOrmModule.forFeature([User, RefreshToken]), PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, KakaoStrategy, KakaoAuthGuard],
  exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}
