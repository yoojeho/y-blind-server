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

const scrypt = promisify(_scrypt);
const accessExpriesIn = "1h";
const refreshExpiresIn = "7d";

const hashRefreshToken = async (token: string) => {
  return bcrypt.hash(token, 10);
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(dto: SignupDto): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { username: dto.username },
    });
    if (existing) {
      throw new ConflictException("Username already exists");
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

  async signin(dto: SigninDto) {
    const user = await this.userRepository.findOne({
      where: { username: dto.username },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload: JwtPayload = { id: user.id, username: user.username };

    const accessSecret = this.configService.get<string>("JWT_SECRET");
    const accessToken = this.jwtService.sign(payload, {
      secret: accessSecret,
      expiresIn: accessExpriesIn,
    });

    const refreshSecret = this.configService.get<string>("JWT_REFRESH_SECRET");
    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    });

    await this.userRepository.update(user.id, {
      hashedRefreshToken: await hashRefreshToken(refreshToken),
    });

    return new SignedUserDto(user.id, user.username, user.nickname, accessToken, refreshToken);
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshSecret = this.configService.get<string>("JWT_REFRESH_SECRET");
    const accessSecret = this.configService.get<string>("JWT_SECRET");

    if (!refreshSecret || !accessSecret) {
      throw new Error("JWT_SECRET or JWT_REFRESH_SECRET is not defined");
    }

    try {
      // refreshToken 검증
      const payload: JwtPayload = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      });

      // 사용자 존재 확인
      const user = await this.userRepository.findOne({
        where: { id: payload.id },
      });

      if (!user) {
        throw new UnauthorizedException("사용자를 찾을 수 없습니다.");
      }

      if (
        !user.hashedRefreshToken ||
        !(await bcrypt.compare(refreshToken, user.hashedRefreshToken))
      ) {
        throw new UnauthorizedException("토큰이 유효하지 않습니다.");
      }

      // 새 accessToken 생성
      const newPayload: JwtPayload = { id: user.id, username: user.username };
      const newAccessToken = await this.jwtService.signAsync(newPayload, {
        secret: accessSecret,
        expiresIn: accessExpriesIn,
      });

      // 새 refreshToken도 발급
      const newRefreshToken = await this.jwtService.signAsync(newPayload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      });

      await this.userRepository.update(user.id, {
        hashedRefreshToken: await hashRefreshToken(newRefreshToken),
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw new UnauthorizedException("유효하지 않은 refresh token입니다.");
    }
  }

  async logout(id: number): Promise<{ result: boolean }> {
    // 사용자 존재 확인
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new UnauthorizedException("사용자를 찾을 수 없습니다.");
    }

    // refreshToken 제거
    await this.userRepository.update(id, {
      ...user,
      hashedRefreshToken: null,
    });

    return Promise.resolve({ result: true });
  }
}
