import { Body, Controller, Delete, Get, Param, Put, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { User } from "./users.entity";
import { UpdateResult } from "typeorm";
import { UpdateUserDto } from "./dto/update.user.dto";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";

@ApiTags("users")
@Controller("users")
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Put(":id")
  @ApiBearerAuth()
  updateUser(@Param("id") id: number, @Body() updateUserDto: UpdateUserDto): Promise<UpdateResult> {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(":id")
  async deleteUser(@Param("id") id: number): Promise<void> {
    await this.usersService.deleteUser(id);
  }
}
