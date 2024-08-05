// src/users/dto/user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Fetch user successfully' })
  message: string;

  @ApiProperty({ type: [User] })
  result: User[];
}
