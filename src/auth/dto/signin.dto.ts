import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches, MinLength } from "class-validator";

export class SigninDto {
  @ApiProperty({ example: "testuser1" })
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]{3,32}$/)
  username: string; // username

  @ApiProperty({ example: "test1234" })
  @IsString()
  @MinLength(6)
  pw: string;
}
