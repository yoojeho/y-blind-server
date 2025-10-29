import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, Matches } from "class-validator";

export class UpdateUserDto {
  @ApiProperty({ example: "user01", required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]{3,32}$/)
  username?: string;

  @ApiProperty({ example: "홍길동", required: false })
  @IsOptional()
  @IsString()
  nickname?: string | null;
}
