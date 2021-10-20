import { Inject, Injectable } from '@nestjs/common';
import { PasswordStorageService } from '.';
import { SignServiceInterface } from './interface/sign.service.interface';
import { SignDTOInterface } from './interface/signin.dto.interface';

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
    async authenticate(singInDto: SignDTOInterface): Promise<boolean> {
        
        const passwordPlain: string = "";
        const passwordCrypt: string = "";
        const salt: string = "";

        return this.passwordStorageService.validatePassword(passwordPlain, passwordCrypt, salt);
    }

    /**
     * Get the access token
     * @param username email or username
     * @param password user password
     * @returns 
     */
    async retrieveAccessToken(singInDto: SignDTOInterface): Promise<string> {
        return "";
    }

    /**
     * Refresh access token to increase the expiration date
     * @param username email or username
     * @param password user password
     * @returns 
     */
    async refreshAccessToken(singInDto: SignDTOInterface): Promise<string> {
        return "";
    }

}
