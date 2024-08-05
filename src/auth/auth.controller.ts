import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';



@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() input: CreateUserDto) {
    return await this.authService.login(input);
  }

  @ApiBearerAuth('Authorization')
  @Post('logout/:id')
  @UseGuards(JwtAuthGuard)
  async logOut(@Param('id') id: number) {
    return await this.authService.logout(id);
  }

}
