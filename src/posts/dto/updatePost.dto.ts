import { IsOptional } from "class-validator";
import { IsNotBlank } from "src/common/validators";
import { ApiProperty } from "@nestjs/swagger";

export class UpdatePostDto {
  @ApiProperty({ example: "게시글 제목" })
  @IsOptional()
  @IsNotBlank()
  title?: string;

  @ApiProperty({ example: "게시글 내용" })
  @IsNotBlank()
  content?: string;
}
