import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { User } from "./users.entity";
import { UpdateResult } from "typeorm";
import { CreateUserDto } from "./dto/create.user.dto";
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

  @Post()
  addUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.addUser(createUserDto);
  }

  @Put(":id")
  updateUser(
    @Param("id") id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UpdateResult> {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(":id")
  async deleteUser(@Param("id") id: number): Promise<void> {
    await this.usersService.deleteUser(id);
  }
}
