import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";
import { User } from "../users/users.entity";
import { SignupDto } from "./dto/signup.dto";

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
}
