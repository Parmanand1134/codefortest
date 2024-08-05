import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller'; // if you have a controller
import { User } from './entities/user.entity';
import { AppGateway } from 'src/app.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService,AppGateway],
  exports: [UsersService],
  controllers: [UsersController], // if you have a controller
})
export class UsersModule {}
