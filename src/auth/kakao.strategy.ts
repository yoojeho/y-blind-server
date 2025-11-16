import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-kakao";
import { SocialLoginDto } from "./dto/socialLogin.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, "kakao") {
  constructor() {
    const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID;
    const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET;
    const KAKAO_CALLBACK_URL = process.env.KAKAO_CALLBACK_URL;

    if (!KAKAO_CLIENT_ID || !KAKAO_CLIENT_SECRET || !KAKAO_CALLBACK_URL) {
      throw new Error("kakao login secrets are not exist.");
    }

    super({
      clientID: KAKAO_CLIENT_ID,
      clientSecret: KAKAO_CLIENT_SECRET,
      callbackURL: KAKAO_CALLBACK_URL,
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<SocialLoginDto> {
    return Promise.resolve<SocialLoginDto>({
      username: `${profile.provider}_${profile.id}`,
      nickname: profile.displayName,
    });
  }
}
