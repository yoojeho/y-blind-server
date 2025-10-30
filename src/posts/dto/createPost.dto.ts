import { IsOptional, IsNumber, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotBlank } from "../../common/validators";
import { Type } from "class-transformer";

export class CreatePostDto {
  // @TODO: 작성자 ID 받지 않고 로그인 사용자 정보 받기
  @ApiProperty({ example: 1, description: "작성자 ID" })
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ example: "게시글 제목" })
  @IsOptional()
  @IsNotBlank()
  title: string;

  @ApiProperty({ example: "게시글 내용" })
  @IsNotBlank()
  content: string;
}
