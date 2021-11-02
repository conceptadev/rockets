import { PasswordStorageInterface } from './password-storage.interface';
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
