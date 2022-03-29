import { Injectable, Type } from '@nestjs/common';
import { UserServiceInterface } from '@concepta/nestjs-user';
import { UserPasswordEncryptedInterface } from '@concepta/nestjs-user/src/interfaces/user-password-encrypted.interface';
import { UserPasswordInterface } from '@concepta/nestjs-user/src/interfaces/user-password.interface';

@Injectable()
export class CustomUserService implements UserServiceInterface {
  /**
   * Dummy property for easily identifying service override.
   */
  hello? = 'world';

  encryptPassword<T extends UserPasswordInterface>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    dto: T,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    storableDto: Type<T & UserPasswordEncryptedInterface>,
  ): Promise<T & UserPasswordEncryptedInterface> {
    throw new Error('Method not implemented.');
  }
}
