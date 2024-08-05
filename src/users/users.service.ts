import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import Redis from 'ioredis'; // Use default import
import { USER_LIST_CACHE_KEY } from 'src/constants';
import globalMsg from 'src/utils/globalMsg';
import { AppGateway } from 'src/app.gateway';
const redis = new Redis(); 

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly appGateway: AppGateway,

  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }


  async findAll() {
    // Attempt to get cached data from Redis
    const storedToken = await redis.get(USER_LIST_CACHE_KEY);
    
    if (storedToken) {
      return JSON.parse(storedToken);
    }

    // Fetch data from the database
    const data = await this.usersRepository.find();

    // Construct the response
    const response = {
      statusCode: HttpStatus.OK,
      message: globalMsg.FETCH_DATA_SUCCESS,
      result: data,
    };

    // Cache the response in Redis if data is present
    if (data.length > 0) {
      await redis.set(USER_LIST_CACHE_KEY, JSON.stringify(response), 'EX', 60 * 60 * 24); // 24 hours
    }

    return response;
  }


  async findOne(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }
  

  async update(id: number, updateUserDto: UpdateUserDto): Promise<void> {
    await this.usersRepository.update(id, updateUserDto);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
