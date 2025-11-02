import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";
import { User } from "../users/users.entity";
import { SignupDto } from "./dto/signup.dto";
import { SigninDto } from "./dto/signin.dto";
import { SignedUserDto } from "./dto/signedUser.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

const scrypt = promisify(_scrypt);

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

  async signin(dto: SigninDto): Promise<SignedUserDto> {
    const user = await this.userRepository.findOne({
      where: { username: dto.username },
    });
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = { sub: user.id, username: user.username };

    const accessSecret = this.configService.get<string>("JWT_SECRET");
    const refreshSecret = this.configService.get<string>("JWT_REFRESH_SECRET");

    if (!accessSecret || !refreshSecret) {
      throw new Error("JWT_SECRET or JWT_REFRESH_SECRET is not defined");
    }

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessSecret,
      expiresIn: "1h",
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: "7d",
    });

    return new SignedUserDto(user.id, user.username, user.nickname, accessToken, refreshToken);
  }
}
