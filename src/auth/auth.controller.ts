import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { SignupDto } from "./dto/signup.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() dto: SignupDto) {
    const user = await this.authService.signup(dto);
    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
    };
  }
}
