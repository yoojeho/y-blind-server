import { Request } from "express";
import { JwtPayload } from "src/auth/dto/jwtPayload.dto";
import { SocialLoginDto } from "src/auth/dto/socialLogin.dto";

export interface RequestWithUser extends Request {
  user: JwtPayload;
}

export interface RequestWithOptionalUser extends Request {
  user?: JwtPayload; // Optional: 로그인 안 한 경우 undefined
}

export interface RequestWithSocialLoginUser extends Request {
  user: SocialLoginDto;
}
