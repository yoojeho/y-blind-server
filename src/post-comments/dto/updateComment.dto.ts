import { IsOptional } from "class-validator";
import { IsNotBlank } from "../../common/validators";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateCommentDto {
  @ApiProperty({ example: "댓글 내용" })
  @IsNotBlank()
  @IsOptional()
  content?: string;
}
