/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: '홍길동' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'hong@example.com' })
  @IsEmail()
  email: string;
}
