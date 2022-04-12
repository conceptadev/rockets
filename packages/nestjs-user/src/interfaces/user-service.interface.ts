import { Type } from '@nestjs/common';
import { UserPasswordEncryptedInterface } from './user-password-encrypted.interface';
import { UserPasswordInterface } from './user-password.interface';

export interface UserServiceInterface{
  encryptPassword<T extends UserPasswordInterface>(
    dto: T,
    storableDto: Type<T & UserPasswordEncryptedInterface>,
  ): Promise<T & UserPasswordEncryptedInterface>;
}
