import { Body, Controller, Delete, Get, Param, Put } from "@nestjs/common";
import { UsersService } from "./users.service";
import { User } from "./users.entity";
import { UpdateResult } from "typeorm";
import { UpdateUserDto } from "./dto/update.user.dto";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("users")
@Controller("users")
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Put(":id")
  updateUser(@Param("id") id: number, @Body() updateUserDto: UpdateUserDto): Promise<UpdateResult> {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(":id")
  async deleteUser(@Param("id") id: number): Promise<void> {
    await this.usersService.deleteUser(id);
  }
}
