import { PasswordStorageInterface } from "./password-storage.interface";

/**
 * Sign DTO Interface
 */
export interface SignDTOInterface extends Partial<Pick<PasswordStorageInterface, 'password'>> {
    username: string;
}
