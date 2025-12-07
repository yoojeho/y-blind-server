import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { SignupDto } from "./dto/signup.dto";
import { SigninDto } from "./dto/signin.dto";
import { RefreshTokenDto } from "./dto/refreshToken.dto";
import { KakaoCodeDto } from "./dto/kakaoCode.dto";
import { JwtAuthGuard } from "./auth.guard";
import type { RequestWithUser } from "src/common/requests/requestWithUser";

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

  /**
   * 카카오 로그인 (클라이언트가 Authorization Code 전달)
   * 클라이언트에서 카카오 로그인 후 받은 code를 서버로 전달하면
   * 서버가 카카오 API를 통해 토큰을 발급받고 JWT를 반환합니다.
   */
  @Post("sign-in/kakao")
  @HttpCode(HttpStatus.OK)
  async signinWithKakaoCode(@Body() dto: KakaoCodeDto) {
    return await this.authService.signinWithKakaoCode(dto.code);
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
