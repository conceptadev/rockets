import { ReferenceUsernameInterface } from '../../../reference/interfaces/reference-username.interface';
import { PasswordPlainInterface } from '../../password/interfaces/password-plain.interface';

export interface AuthenticationLoginInterface
  extends ReferenceUsernameInterface,
    PasswordPlainInterface {}
