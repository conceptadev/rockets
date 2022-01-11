import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserServiceInterface } from '../interfaces/user-service.interface';
import { USER_MODULE_USER_CUSTOM_REPO_TOKEN } from '../user.constants';

@Injectable()
export abstract class UserService implements UserServiceInterface {
  constructor(
    @Inject(USER_MODULE_USER_CUSTOM_REPO_TOKEN)
    public userRepo: Repository<User>,
  ) {}

  async getUserByUsername(username: string): Promise<User> {
    return this.userRepo.findOne({ username });
  }
}
