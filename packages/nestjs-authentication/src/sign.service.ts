import { Inject, Injectable } from '@nestjs/common';
import { PasswordStorageService } from '.';
import { SignServiceInterface } from './interface/sign.service.interface';

/**
 * Service with functions related to the sign in
 */
@Injectable()
export class SignService implements SignServiceInterface {

    /**
     * constructor
     */
    constructor(
        @Inject()
        private passwordStorageService: PasswordStorageService
    ) { }
 
    /**
     * Check if password matches 
     * @param passwordPlain 
     * @param passwordCrypt 
     * @param salt 
     * @returns 
     */
    async authenticate(passwordPlain: string, passwordCrypt: string, salt: string): Promise<boolean> {
        return this.passwordStorageService.validatePassword(passwordPlain, passwordCrypt, salt);
    }

    /**
     * Get the access token
     * @param username email or username
     * @param password user password
     * @returns 
     */
    retrieveAccessToken(username: string, password: string): boolean {
        return true;
    }

    /**
     * Refresh access token to increase the expiration date
     * @param username email or username
     * @param password user password
     * @returns 
     */
    refreshAccessToken(username: string, password: string): boolean {
        return true;
    }

}
