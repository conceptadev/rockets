import { ReferenceIdInterface } from '@concepta/ts-core';
import { MinLength } from 'class-validator';
import { AuthLocalCredentialsInterface } from '../../interfaces/auth-local-credentials.interface';
export class UserFixture
  implements ReferenceIdInterface, AuthLocalCredentialsInterface
{
  id!: string;
  username!: string;
  @MinLength(3)
  password!: string;
  passwordHash!: string | null;
  passwordSalt!: string | null;
}
