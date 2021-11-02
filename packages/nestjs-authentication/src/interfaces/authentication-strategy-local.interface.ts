import { PasswordStorageInterface } from './password-storage.interface';

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
