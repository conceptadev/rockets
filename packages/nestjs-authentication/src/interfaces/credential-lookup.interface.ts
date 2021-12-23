import { PasswordStorageInterface } from '@rockts-org/nestjs-password';
import { AuthenticationStrategyLocalInterface } from './authentication-strategy-local.interface';

/**
 * Credential Lookup Interface
 */
export interface CredentialLookupInterface
  extends Partial<
      Pick<AuthenticationStrategyLocalInterface, 'username' | 'password'>
    >,
    Partial<Pick<PasswordStorageInterface, 'salt'>> {
  id: string;
}
