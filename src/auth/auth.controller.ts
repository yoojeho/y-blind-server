import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { SignupDto } from "./dto/signup.dto";
import { SigninDto } from "./dto/signin.dto";
import { RefreshTokenDto } from "./dto/refreshToken.dto";
import { JwtAuthGuard, KakaoAuthGuard } from "./auth.guard";
import type {
  RequestWithSocialLoginUser,
  RequestWithUser,
} from "src/common/requests/requestWithUser";
import type { Response } from "express";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("sign-up")
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() dto: SignupDto) {
    const user = await this.authService.signup(dto);
    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
    };
  }

  @Post("sign-in")
  @HttpCode(HttpStatus.OK)
  async signin(@Body() dto: SigninDto) {
    const user = await this.authService.signin(dto);
    return user;
  }

  /** 카카오 로그인 (가드가 카카오 로그인 화면으로 리디렉션) */
  @UseGuards(KakaoAuthGuard)
  @Get("sign-in/kakao")
  startKakaoLogin() {}

  // 카카오 로그인 완료 후 호출
  @UseGuards(KakaoAuthGuard)
  @Get("sign-in/kakao/callback")
  async kakaoCallback(@Req() req: RequestWithSocialLoginUser, @Res() res: Response) {
    const user = await this.authService.signinWithSocialLogin(req.user);

    const CLIENT_URL = process.env.CLIENT_URL;
    if (!CLIENT_URL) {
      throw new Error("CLIENT_URL is not exist.");
    }

    const redirectUrl = new URL(CLIENT_URL);
    redirectUrl.searchParams.append("jwt", JSON.stringify(user));

    return res.redirect(redirectUrl.toString());
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: RequestWithUser) {
    return await this.authService.logout(req.user.id);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() dto: RefreshTokenDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return await this.authService.refreshToken(dto.refreshToken);
  }
}
