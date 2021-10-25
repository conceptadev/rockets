import { Inject, Injectable } from '@nestjs/common';

import { AUTHENTICATION_MODULE_CONFIG_TOKEN } from '../config/authentication.config';
import {
    AuthenticationConfigOptionsInterface
} from '../interface/authentication-config-options.interface';
import {
    PasswordCreationServiceInterface
} from '../interface/service/password-creation.service.interface';
import { PasswordStrengthService } from './password-strength.service';

/**
 * Service with functions related to password creation
 * to check if password is strong, and the number of attempts user can do to update a password
 * 
 */
@Injectable()
export class PasswordCreationService implements PasswordCreationServiceInterface {

    /**
     * Constructor
     */
    constructor(
        private passwordStrengthService: PasswordStrengthService,
        @Inject(AUTHENTICATION_MODULE_CONFIG_TOKEN)
        private config: AuthenticationConfigOptionsInterface,
    ) { }

    /**
     * Check if password is strong
     * @param password 
     * @returns 
     */
    isStrong(password: string) : boolean {
        return this.passwordStrengthService.isStrong(password);
    }


    /**
     * Check if attempt is valid
     * @returns Number of attempts user has to try
     */
    checkAttempt(numOfAttempts: number = 0): boolean {
        return this.checkAttemptLeft(numOfAttempts) >= 0;
    }

    /**
     * Check number of attempts of using password
     * @param numOfAttempts number of attempts
     * @returns 
     */
    checkAttemptLeft(numOfAttempts: number = 0): number {
        
        // Get number of attempts allowed
        const attemptsAllowed = this.config?.maxPasswordAttempts || 0;
        
        // did it reached max
        const canAttemptMore = numOfAttempts <= attemptsAllowed;

        return canAttemptMore ? attemptsAllowed - numOfAttempts : -1;
    }

}
