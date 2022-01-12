import { PasswordStorageInterface } from '@rockts-org/nestjs-password';

/**
 * Credential Lookup Interface
 */
export interface CredentialLookupInterface
  extends Partial<Pick<PasswordStorageInterface, 'password' | 'salt'>> {
  id: string;

  /**
   * username for sign in
   */
  username: string;
}
