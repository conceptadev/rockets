import { ReferenceIdInterface } from '@concepta/ts-core';
import { AuthLocalCredentialsInterface } from '../../interfaces/auth-local-credentials.interface';
import { Allow, IsOptional, MinLength } from 'class-validator';
import { allowedNodeEnvironmentFlags } from 'process';
export class UserFixture
  implements ReferenceIdInterface, AuthLocalCredentialsInterface
{
  @Allow()
  id!: string;

  @MinLength(3)
  username!: string;

  @Allow()
  active!: boolean;

  @Allow()
  password!: string;

  @IsOptional()
  passwordHash!: string | null;

  @IsOptional()
  passwordSalt!: string | null;
}
