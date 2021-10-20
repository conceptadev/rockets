import { Inject, Injectable } from '@nestjs/common';
import { PasswordStrengthService } from '..';
import { AUTHENTICATION_MODULE_CONFIG } from '../config/authentication.config';
import { AuthenticationConfigOptionsInterface } from '../interface/authentication-config-options.interface';
import { PasswordCreationServiceInterface } from '../interface/password-creation.service.interface';

/**
 * Service with functions related to password creation
 */
@Injectable()
export class PasswordCreationService implements PasswordCreationServiceInterface {

    /**
     * Constructor
     */
    constructor(
        private passwordStrengthService: PasswordStrengthService,
        @Inject(AUTHENTICATION_MODULE_CONFIG)
        private config: AuthenticationConfigOptionsInterface
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
        const attemptsAllowed = this.config.maxPasswordAttempts;
        
        // did it reached max
        const canAttemptMore = numOfAttempts <= attemptsAllowed;

        return canAttemptMore ? attemptsAllowed - numOfAttempts : -1;
    }

}
