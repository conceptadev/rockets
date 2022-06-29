import { ReferenceUsernameInterface } from '@concepta/ts-core';
import { PasswordPlainInterface } from '../../password/interfaces/password-plain.interface';

export interface AuthenticationLoginInterface
  extends ReferenceUsernameInterface,
    PasswordPlainInterface {}
