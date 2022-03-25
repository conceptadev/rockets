import { Repository } from 'typeorm';
import { Inject, Injectable, Type } from '@nestjs/common';
import { PasswordStorageService } from '@concepta/nestjs-password';
import { plainToInstance } from 'class-transformer';
import { USER_MODULE_USER_CUSTOM_REPO_TOKEN } from '../user.constants';
import { User } from '../entities/user.entity';
import { UserServiceInterface } from '../interfaces/user-service.interface';
import { UserPasswordInterface } from '../interfaces/user-password.interface';
import { UserPasswordEncryptedInterface } from '../interfaces/user-password-encrypted.interface';
import { UserCreatableInterface } from '../interfaces/user-creatable.interface';
import { UserEntityInterface } from '../interfaces/user-entity.interface';

/**
 * User service
 */
@Injectable()
export class UserService implements UserServiceInterface {
  /**
   * Constructor
   *
   * @param userRepo instance of the user repo
   */
  constructor(
    @Inject(USER_MODULE_USER_CUSTOM_REPO_TOKEN)
    public userRepo: Repository<User>,
    private passwordStorageService: PasswordStorageService,
  ) {}

  /**
   * Get user for the given username.
   *
   * @param username the username
   */
  async getUser(username: string): Promise<User> {
    return this.userRepo.findOne({ username });
  }

  /**
   * Encrypt the user's credentials.
   *
   * @param dto Dto with password being encrypted
   */
  async encryptPassword<T extends UserPasswordInterface>(
    dto: T,
    storableDto: Type<T & UserPasswordEncryptedInterface>,
  ): Promise<T & UserPasswordEncryptedInterface> {
    // encrypt the password
    const storablePassword = await this.passwordStorageService.encrypt(
      dto.password,
    );

    // encrypted dto
    const encryptedDto = plainToInstance<T & UserPasswordEncryptedInterface, T>(
      storableDto,
      dto,
    );

    // add encrypted creds to the dto
    encryptedDto.password = storablePassword.password;
    encryptedDto.salt = storablePassword.salt;

    // all done
    return encryptedDto;
  }

  /**
   * Create user
   * @param user 
   * @returns 
   */
  async create(user: UserCreatableInterface): Promise<UserEntityInterface> {
    const userEntity = await this.userRepo.create(user);
    
    if (!userEntity) return null;

    return userEntity;
  }

  // async getUserByUserId(id: string): Promise<User> {
  //   return this.userRepo.findOne({ id });
  // }
}
