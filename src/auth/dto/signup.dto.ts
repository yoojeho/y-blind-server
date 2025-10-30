import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches, MinLength } from "class-validator";

export class SignupDto {
  @ApiProperty({ example: "user01" })
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]{3,32}$/)
  username: string; // username

  @ApiProperty({ example: "P@ssw0rd!" })
  @IsString()
  @MinLength(6)
  pw: string;
}
