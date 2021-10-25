import { Injectable } from '@nestjs/common';

import { CryptUtil } from '../common/crypt.util';
import { PasswordStorageInterface } from '../interface/dto/password-storage.interface';
import {
    PasswordStorageServiceInterface
} from '../interface/service/password-storage.service.interface';

/**
 * Service with functions related to password security
 */
@Injectable()
export class PasswordStorageService implements PasswordStorageServiceInterface {

    /**
     * Generate Salts to safeguard passwords in storage
     * @returns 
     */
    async generateSalt(): Promise<string> {
        return CryptUtil.generateSalt();
    }

    /**
     * Encrypt a password using a salt, if not salt 
     * was passed, then generate a new one before encrypt
     * @param password Password to be encrypted
     * @param salt Use salts to safeguard passwords in storage
     */
    async encrypt(password: string, salt?: string): Promise<PasswordStorageInterface> {
        let saltPassword = salt;
        
        if (!saltPassword)
            saltPassword = await this.generateSalt();

        const passwordHash = await CryptUtil.hashPassword(password, saltPassword);
        
        return {
            salt: saltPassword,
            password: passwordHash
        } as PasswordStorageInterface;
    }

    /**
     * Validate if password matches and its valid
     * @param passwordPlain Plain Password not encrypted
     * @param passwordCrypt Password encrypted
     * @param salt salt to be used on plain password to see it match  
     */
    async validatePassword(passwordPlain: string, passwordCrypt: string, salt: string): Promise<boolean> {
        return CryptUtil.validatePassword(passwordPlain, passwordCrypt, salt);
    }
}
