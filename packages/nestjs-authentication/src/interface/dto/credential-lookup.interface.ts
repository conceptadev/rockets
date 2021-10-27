import { PasswordStorageInterface } from './password-storage.interface';
import { SignDTOInterface } from './signin.dto.interface';

/**
 * Credential Lookup Interface
 */
export interface CredentialLookupInterface
  extends Partial<Pick<SignDTOInterface, 'username' | 'password'>>,
    Partial<Pick<PasswordStorageInterface, 'salt'>> {
  id: string;
}
