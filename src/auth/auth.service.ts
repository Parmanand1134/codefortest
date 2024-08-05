import { ConflictException, HttpCode, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis'; // Use default import
import globalMsg from 'src/utils/globalMsg';
const redis = new Redis(); // Create an instance of Redis

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
  async findUserByEmail(email: string): Promise<any> {
    const user = await this.usersService.findOne(email);
     return user? user:null
   
  }


  async login(input: { email: string, password: string }) {
    try {
      const { email, password } = input;

      const user = await this.usersService.findOne(email);
      if (!user) {
        throw new NotFoundException(globalMsg.error.USER_NOT_FOUND);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException(globalMsg.error.INVALID_CREDENTIAL);
      }

      const payload = { email: user.email, sub: user.id };
      const token = this.jwtService.sign(payload);

      // Check for existing token and remove it if it exists
      const existingToken = await redis.get(user.id.toString());
      if (existingToken) {
        await redis.del(existingToken);
        throw new UnauthorizedException('User is already logged in another device');
      }

      // Store the new token in Redis
      await redis.set(user.id.toString(), token, 'EX', 60 * 60 * 24); // 24 hours

      return {
        statusCode: HttpStatus.OK,
        access_token: token,
        result: user,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      } else {
        console.error('Login error:', error);
        throw new InternalServerErrorException(globalMsg.error.UNEXPECTED_ERROR);
      }
    }
  }

  async register(createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.usersService.findOne(createUserDto.email);
      if (existingUser) {
        throw new ConflictException(globalMsg.error.USER_ALREADY_REGISTERED);
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const data =  await this.usersService.createUser({
        ...createUserDto,
        password: hashedPassword,
      });

      return {
        statusCode :HttpStatus.OK,
        message: globalMsg.SIGNUP_SUCCESS,
       result:data
      }
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error; // This will automatically send a 409 response
      } else {
        console.error(error);
        throw new InternalServerErrorException(globalMsg.error.UNEXPECTED_ERROR);
      }
    }
  }

  async logout(userId: number) {
    try {
      // Retrieve the token from Redis using the user ID
      const token = await redis.get(userId.toString());  
      // Check if the token exists
      if (token) {
        // Token exists, so delete it from Redis
        const result = await redis.del(userId.toString());
  
        if (result === 1) { // Redis returns 1 if the key was deleted
          return {
            statusCode: HttpStatus.OK,
            message: globalMsg.LOGGED_OUT_SUCCESS,
          };
        } else {
          throw new InternalServerErrorException('Failed to logout. Please try again.');
        }
      } else {
        // Token does not exist, user may already be logged out
        throw new UnauthorizedException('User session not found or already logged out');
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw new InternalServerErrorException(globalMsg.error.UNEXPECTED_ERROR);
    }
  }
  
}
