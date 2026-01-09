import { IsOptional, IsArray, IsString } from "class-validator";
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

  @ApiProperty({
    example: ["태그1", "태그2", "태그3"],
    description: "해시태그 배열",
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];
}
