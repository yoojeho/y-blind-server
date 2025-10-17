/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: '홍길동' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'hong@example.com' })
  @IsEmail()
  email: string;
}
