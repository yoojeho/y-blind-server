import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";
import { User } from "../users/users.entity";
import { SignupDto } from "./dto/signup.dto";
import { SignedUserDto } from "./dto/signedUser.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { JwtPayload } from "./dto/jwtPayload.dto";
import { SigninDto } from "./dto/signin.dto";
import { RefreshToken } from "src/refresh-token/refresh-token.entity";
import type { SocialLoginDto } from "./dto/socialLogin.dto";
import { KakaoUserDto } from "./dto/kakaoUser.dto";
import { KakaoTokensDto } from "./dto/kakaoTokens.dto";

const scrypt = promisify(_scrypt);
const accessExpriesIn = "1h";
const refreshExpiresIn = "7d";

/**
 * scrypt로 해시 생성 (salt:hash 형식)
 */
async function hashWithScrypt(value: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = (await scrypt(value, salt, 32)) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}

/**
 * scrypt로 해시 비교
 */
async function compareWithScrypt(value: string, hash: string): Promise<boolean> {
  const [salt, storedHash] = hash.split(":");
  if (!salt || !storedHash) {
    return false;
  }
  const derivedKey = (await scrypt(value, salt, 32)) as Buffer;
  return derivedKey.toString("hex") === storedHash;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ID/PW 가입
  async signup(dto: SignupDto): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { username: dto.username },
    });
    if (existing) {
      throw new ConflictException("User already exists");
    }

    const passwordHash = await hashWithScrypt(dto.pw);

    const user = this.userRepository.create({
      username: dto.username,
      passwordHash,
      nickname: null,
    });
    return await this.userRepository.save(user);
  }

  async signupWithSocialLogin(dto: SocialLoginDto): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { username: dto.username },
    });
    if (existing) {
      throw new ConflictException("User already exists");
    }
    const user = this.userRepository.create({
      username: dto.username,
      nickname: null,
    });
    return await this.userRepository.save(user);
  }

  async signinWithSocialLogin(dto: SocialLoginDto) {
    let user = await this.userRepository.findOne({
      where: { username: dto.username },
      relations: ["hashedRefreshToken"],
    });

    if (!user) {
      user = await this.signupWithSocialLogin(dto);
    }

    return this.generateTokens(user);
  }

  // ID/PW 로그인
  async signin(dto: SigninDto) {
    const user = await this.userRepository.findOne({
      where: { username: dto.username },
      relations: ["hashedRefreshToken"],
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!(await compareWithScrypt(dto.pw, user.passwordHash))) {
      throw new UnauthorizedException("Invalid password");
    }
    return this.generateTokens(user);
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshSecret = this.configService.get<string>("JWT_REFRESH_SECRET");
    const accessSecret = this.configService.get<string>("JWT_SECRET");

    if (!refreshSecret || !accessSecret) {
      throw new Error("JWT_SECRET or JWT_REFRESH_SECRET is not defined");
    }

    // refreshToken 검증
    const payload: JwtPayload = this.jwtService.verify(refreshToken, {
      secret: refreshSecret,
    });

    // 사용자 존재 확인
    const user = await this.userRepository.findOne({
      where: { id: payload.id },
      relations: ["hashedRefreshToken"],
    });

    if (!user) {
      throw new UnauthorizedException("사용자를 찾을 수 없습니다.");
    }

    // 새로 생성된 토큰으로 DB가 업데이트되었으므로, 기존 토큰과 비교하면 false가 나와야 함
    // 만약 true가 나온다면, 같은 토큰이 재사용된 것이므로 보안 위험
    if (!user.hashedRefreshToken) {
      throw new UnauthorizedException("유효하지 않은 토큰입니다.");
    }

    if (!(await compareWithScrypt(refreshToken, user.hashedRefreshToken.value))) {
      throw new UnauthorizedException("토큰이 이미 사용되었습니다.");
    }

    const tokens = await this.generateTokens(user);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // 토큰 생성/갱신
  private async generateTokens(user: User): Promise<SignedUserDto> {
    const payload: JwtPayload = { id: user.id, username: user.username };

    // Access Token
    const accessSecret = this.configService.get<string>("JWT_SECRET");
    const accessToken = this.jwtService.sign(payload, {
      secret: accessSecret,
      expiresIn: accessExpriesIn,
    });

    // Refresh Token
    const refreshSecret = this.configService.get<string>("JWT_REFRESH_SECRET");
    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    });

    const hashed = await hashWithScrypt(refreshToken);

    if (!user.hashedRefreshToken) {
      // 처음 로그인 or 기존 토큰 없음 → 새 엔티티 생성
      const tokenEntity = this.refreshTokenRepository.create({
        value: hashed,
        user,
      });
      await this.refreshTokenRepository.save(tokenEntity);
    } else {
      // 기존 엔티티 수정
      user.hashedRefreshToken.value = hashed;
      await this.refreshTokenRepository.save(user.hashedRefreshToken);
    }

    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      accessToken,
      refreshToken,
    };
  }

  async logout(id: number): Promise<{ result: boolean }> {
    // 사용자 존재 확인
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new UnauthorizedException("사용자를 찾을 수 없습니다.");
    }

    // Refresh Token 삭제 (없어도 정상 처리)
    await this.refreshTokenRepository.delete({ user: { id } });

    return { result: true };
  }

  /**
   * 카카오 Authorization Code를 받아서 로그인 처리
   * @param code 카카오에서 발급한 Authorization Code
   */
  async signinWithKakaoCode(code: string): Promise<SignedUserDto> {
    // 1. Authorization Code로 카카오 액세스 토큰 요청
    const kakaoTokens = await this.getKakaoTokens(code);

    // 2. 액세스 토큰으로 카카오 사용자 정보 조회
    const kakaoUser = await this.getKakaoUserInfo(kakaoTokens.access_token);

    // 3. 기존 로그인 로직 재사용
    const socialLoginDto: SocialLoginDto = {
      username: `kakao_${kakaoUser.id}`,
      nickname: kakaoUser.kakao_account?.profile?.nickname ?? null,
    };

    return this.signinWithSocialLogin(socialLoginDto);
  }

  /**
   * 테스트용 카카오 로그인 uri 반환 (상용은 클라이언트 구현이 사용됨)
   */
  getKakaoLoginTestUrl() {
    const KAKAO_CLIENT_ID = this.configService.get<string>("KAKAO_CLIENT_ID");
    const KAKAO_CALLBACK_URL = this.configService.get<string>("KAKAO_CALLBACK_URL");

    if (!KAKAO_CLIENT_ID || !KAKAO_CALLBACK_URL) {
      throw new Error("카카오 로그인 설정이 올바르지 않습니다.");
    }

    const params = new URLSearchParams({
      client_id: KAKAO_CLIENT_ID,
      redirect_uri: KAKAO_CALLBACK_URL,
      response_type: "code",
    });

    return { url: `https://kauth.kakao.com/oauth/authorize?${params}` };
  }

  /**
   * Authorization Code를 카카오 액세스 토큰으로 교환
   */
  private async getKakaoTokens(code: string): Promise<KakaoTokensDto> {
    const KAKAO_CLIENT_ID = this.configService.get<string>("KAKAO_CLIENT_ID");
    const KAKAO_CALLBACK_URL = this.configService.get<string>("KAKAO_CALLBACK_URL");

    if (!KAKAO_CLIENT_ID || !KAKAO_CALLBACK_URL) {
      throw new Error("카카오 로그인 설정이 올바르지 않습니다.");
    }

    const params = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: KAKAO_CLIENT_ID,
      redirect_uri: KAKAO_CALLBACK_URL,
      code,
    });

    const response = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as {
        error_description?: string;
        error?: string;
      };
      throw new UnauthorizedException(
        `카카오 토큰 발급 실패: ${errorData.error_description || errorData.error}`,
      );
    }

    return (await response.json()) as KakaoTokensDto;
  }

  /**
   * 카카오 액세스 토큰으로 사용자 정보 조회 (API v2)
   */
  private async getKakaoUserInfo(accessToken: string): Promise<KakaoUserDto> {
    const response = await fetch("https://kapi.kakao.com/v2/user/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      const errorData = (await response.json()) as { msg?: string };
      throw new UnauthorizedException(
        `카카오 사용자 정보 조회 실패: ${errorData.msg || "Unknown error"}`,
      );
    }

    return (await response.json()) as KakaoUserDto;
  }
}
