import { Inject, Injectable } from '@nestjs/common';
import { PasswordStrengthService } from '.';
import { AuthenticationConfigOptionsInterface } from './interface/authentication-config-options.interface';

/**
 * Service with functions related to password
 */
@Injectable()
export class PasswordCreationService {

    /**
     * 
     * @param passwordStrengthService 
     */
    constructor(
        @Inject()
        private passwordStrengthService: PasswordStrengthService,
        @Inject()
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
     * 
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
