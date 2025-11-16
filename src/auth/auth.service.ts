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
import bcrypt from "bcrypt";
import { RefreshToken } from "src/refresh-token/refresh-token.entity";
import type { SocialLoginDto } from "./dto/socialLogin.dto";

const scrypt = promisify(_scrypt);
const accessExpriesIn = "1h";
const refreshExpiresIn = "7d";

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

    const salt = randomBytes(16).toString("hex");
    const key = (await scrypt(dto.pw, salt, 32)) as Buffer;
    const passwordHash = `${salt}:${key.toString("hex")}`;

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

    const [salt, key] = user.passwordHash.split(":");
    const derivedKey = (await scrypt(dto.pw, salt, 32)) as Buffer;

    if (key !== derivedKey.toString("hex")) {
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

    if (
      !user.hashedRefreshToken ||
      !(await bcrypt.compare(refreshToken, user.hashedRefreshToken.value))
    ) {
      throw new UnauthorizedException("토큰이 유효하지 않습니다.");
    }

    const generatedToken = await this.generateTokens(user);

    return {
      accessToken: generatedToken.accessToken,
      refreshToken: generatedToken.refreshToken,
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

    const hashed = await bcrypt.hash(refreshToken, 10);

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
      relations: ["hashedRefreshToken"],
    });

    if (!user) {
      throw new UnauthorizedException("사용자를 찾을 수 없습니다.");
    }

    if (user.hashedRefreshToken) {
      await this.refreshTokenRepository.remove(user.hashedRefreshToken);
    }

    return { result: true };
  }
}
