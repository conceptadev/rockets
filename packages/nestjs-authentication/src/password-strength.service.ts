import { Inject, Injectable } from '@nestjs/common';
import zxcvbn from 'zxcvbn'
import { AuthenticationConfigOptionsInterface } from './interface/authentication-config-options.interface';
import { PasswordStrengthServiceInterface } from './interface/password-strength.service.interface';

/**
 * Service to validate password strength
 */
@Injectable()
export class PasswordStrengthService implements PasswordStrengthServiceInterface {

    constructor(
        @Inject()
        private config: AuthenticationConfigOptionsInterface) {
        
    }

    /**
     * Method to check if password is strong
     * @param password 
     * @returns password strength
     */
    isStrong(password: string): boolean {

        // Get min password Strength
        const minStrength = this.config?.minPasswordStrength || 0;
        
        // check strength of the password
        const result = zxcvbn(password);
        
        // Check if is strong based on configuration
        return result.score >= minStrength;
    }


}
