import { IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotBlank } from "../../common/validators";

export class CreatePostDto {
  @ApiProperty({ example: "게시글 제목" })
  @IsOptional()
  @IsNotBlank()
  title: string;

  @ApiProperty({ example: "게시글 내용" })
  @IsNotBlank()
  content: string;
}
