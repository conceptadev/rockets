import { PasswordStorageInterface } from "../dto/password-storage.interface";

/**
 * Password Storage Service Interface
 */
export interface PasswordStorageServiceInterface {
    /**
     * Generate salt to be used to encrypt password
     */
    generateSalt(): Promise<string>;

    /**
     * Encrypt a password using a salt, if not salt 
     * was passed, then generate a new one before encrypt
     * @param password Password to be encrypted
     * @param salt Use salts to safeguard passwords in storage
     */
    encrypt(password: string, salt ?: string): Promise<PasswordStorageInterface> ;

    /**
     * Validate if password matches and its valid
     * @param passwordPlain Plain Password not encrypted
     * @param passwordCrypt Password encrypted
     * @param salt salt to be used on plain  password to see it match  
     */
    validatePassword(passwordPlain: string, passwordCrypt: string, salt: string): Promise<boolean>;
}
