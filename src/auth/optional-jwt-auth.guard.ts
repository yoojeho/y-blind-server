import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { JwtPayload } from "./dto/jwtPayload.dto";

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
  // 인증 실패 시에도 에러를 던지지 않고 계속 진행
  handleRequest<TUser = JwtPayload>(err: Error | null, user: TUser | false): TUser | null {
    // 에러가 있어도 무시하고, user가 있으면 반환, 없으면 null 반환
    if (err || !user) {
      return null;
    }
    return user as TUser;
  }
}
