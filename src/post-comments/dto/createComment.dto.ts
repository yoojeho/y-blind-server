import { IsNotBlank } from "src/common/validators";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCommentDto {
  @ApiProperty({ example: "댓글 내용" })
  @IsNotBlank()
  content?: string;
}
