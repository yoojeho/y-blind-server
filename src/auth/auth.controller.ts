import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { SignupDto } from "./dto/signup.dto";
import { SigninDto } from "./dto/signin.dto";

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
}
