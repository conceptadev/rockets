import { PasswordInterface } from './password.interface';

/**
 * Password storage interface
 */
export interface PasswordStorageInterface extends PasswordInterface {
  /**
   * Salt to encrypt password
   */
  salt: string;
}
