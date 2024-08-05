import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsEmail } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({
        description: 'The email of the user',
        example: 'user@example.com',
      })
      @IsEmail({}, { message: 'Email must be a valid email address' })
      @IsNotEmpty({ message: 'Email is required' })
      email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'Test@123',
    minLength: 6
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
