import { Injectable, Type } from '@nestjs/common';
import { PasswordStorageService } from '@concepta/nestjs-password';
import { plainToInstance } from 'class-transformer';
import { UserServiceInterface } from '../interfaces/user-service.interface';
import { UserPasswordInterface } from '../interfaces/user-password.interface';
import { UserPasswordEncryptedInterface } from '../interfaces/user-password-encrypted.interface';

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
  constructor(private passwordStorageService: PasswordStorageService) {}

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
