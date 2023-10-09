import { ReferenceIdInterface } from '@concepta/ts-core';
import { AuthLocalCredentialsInterface } from '../../interfaces/auth-local-credentials.interface';
export class UserFixture
  implements ReferenceIdInterface, AuthLocalCredentialsInterface
{
  id!: string;
  username!: string;
  password!: string;
  passwordHash!: string | null;
  passwordSalt!: string | null;
}
