import { IsNotBlank } from "src/common/validators";

export class KakaoCodeDto {
  @IsNotBlank()
  code: string;
}
