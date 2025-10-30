import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
  @ApiProperty({ example: "홍길동", required: false })
  @IsOptional()
  @IsString()
  nickname?: string | null;
}
