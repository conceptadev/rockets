import { PasswordStorageInterface } from '@rockts-org/nestjs-password';

/**
 * Sign DTO Interface
 */
export interface AuthenticationStrategyLocalInterface
  extends Partial<Pick<PasswordStorageInterface, 'password'>> {
  /**
   * username for sign in
   */
  username: string;
}
