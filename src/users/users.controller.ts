import { Body, Controller, Delete, Get, Param, Put, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { User } from "./users.entity";
import { UpdateResult } from "typeorm";
import { UpdateUserDto } from "./dto/update.user.dto";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/auth.guard";

@ApiTags("users")
@Controller("users")
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: "유저 목록 조회" })
  getUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Put(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "유저 정보 수정" })
  updateUser(@Param("id") id: number, @Body() updateUserDto: UpdateUserDto): Promise<UpdateResult> {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "유저 정보 삭제" })
  async deleteUser(@Param("id") id: number): Promise<void> {
    await this.usersService.deleteUser(id);
  }
}
