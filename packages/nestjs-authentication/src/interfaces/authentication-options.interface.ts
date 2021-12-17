import { FactoryProvider, ModuleMetadata } from '@nestjs/common';
import { PasswordStrengthEnum } from '../enum/password-strength.enum';

/**
 * Authentication module configuration options interface
 */
export interface AuthenticationOptionsInterface
  extends Pick<ModuleMetadata, 'imports'> {
  /**
   * Min level of password strength allowed
   */
  minPasswordStrength?: PasswordStrengthEnum;

  /**
   * Max number of password attempts allowed
   */
  maxPasswordAttempts?: number;
}

/**
 * Authentication async module configuration options interface
 */
export interface AuthenticationAsyncOptionsInterface
  extends AuthenticationOptionsInterface,
    Pick<
      FactoryProvider<
        AuthenticationOptionsInterface | Promise<AuthenticationOptionsInterface>
      >,
      'useFactory' | 'inject'
    > {}
