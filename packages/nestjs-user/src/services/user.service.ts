import { Repository } from 'typeorm';
import { Inject, Injectable, Type } from '@nestjs/common';
import { PasswordStorageService } from '@concepta/nestjs-password';
import { plainToInstance } from 'class-transformer';
import { USER_MODULE_USER_CUSTOM_REPO_TOKEN } from '../user.constants';
import { UserServiceInterface } from '../interfaces/user-service.interface';
import { UserPasswordInterface } from '../interfaces/user-password.interface';
import { UserPasswordEncryptedInterface } from '../interfaces/user-password-encrypted.interface';
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
    public userRepo: Repository<UserEntityInterface>,
    private passwordStorageService: PasswordStorageService,
  ) {}

  /**
   * Get user for the given id.
   *
   * @param id the id
   */
  async getById(id: string): Promise<UserEntityInterface> {
    return this.userRepo.findOne({ id });
  }

  /**
   * Get user for the given email.
   *
   * @param email the email
   */
  async getByEmail(email: string): Promise<UserEntityInterface> {
    return this.userRepo.findOne({ email });
  }

  /**
   * Get user for the given username.
   *
   * @param username the username
   */
  async getByUsername(username: string): Promise<UserEntityInterface> {
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
}
