import { IsNotBlank } from "src/common/validators";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsNumber } from "class-validator";
import { Type } from "class-transformer";

export class CreateCommentDto {
  @ApiProperty({ example: "댓글 내용" })
  @IsNotBlank()
  content?: string;

  @ApiProperty({
    example: 1,
    description: "부모 댓글 ID (대댓글인 경우에만 필요)",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  parentCommentId?: number;
}
