import { Request } from "express";
import { JwtPayload } from "src/auth/dto/jwtPayload.dto";

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
