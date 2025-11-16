import { Request } from "express";
import { JwtPayload } from "src/auth/dto/jwtPayload.dto";
import { SocialLoginDto } from "src/auth/dto/socialLogin.dto";

export interface RequestWithUser extends Request {
  user: JwtPayload;
}

export interface RequestWithSocialLoginUser extends Request {
  user: SocialLoginDto;
}
