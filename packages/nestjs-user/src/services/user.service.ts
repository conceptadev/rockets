import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserServiceInterface } from '../interfaces/user-service.interface';
import { USER_MODULE_USER_CUSTOM_REPO_TOKEN } from '../user.constants';

@Injectable()
export class UserService implements UserServiceInterface {
  constructor(
    @Inject(USER_MODULE_USER_CUSTOM_REPO_TOKEN)
    public userRepo: Repository<User>,
  ) {}

  async getUser(username: string): Promise<User> {
    return this.userRepo.findOne({ username });
  }

  // async getUserByUserId(id: string): Promise<User> {
  //   return this.userRepo.findOne({ id });
  // }
}
