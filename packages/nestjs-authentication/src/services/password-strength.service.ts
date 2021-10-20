import { Inject, Injectable } from '@nestjs/common';
import zxcvbn from 'zxcvbn'
import { AUTHENTICATION_MODULE_CONFIG } from '../config/authentication.config';
import { PasswordStrengthEnum } from '../enum/password-strength.enum';
import { AuthenticationConfigOptionsInterface } from '../interface/authentication-config-options.interface';
import { PasswordStrengthServiceInterface } from '../interface/password-strength.service.interface';

/**
 * Service to validate password strength
 */
@Injectable()
export class PasswordStrengthService implements PasswordStrengthServiceInterface {

    /**
     * constructor
     * @param config 
     */
    constructor(
        @Inject(AUTHENTICATION_MODULE_CONFIG)
        private config: AuthenticationConfigOptionsInterface) { }

    /**
     * Method to check if password is strong
     * @param password 
     * @returns password strength
     */
    isStrong(password: string): boolean {

        // Get min password Strength
        const minStrength = this.config?.minPasswordStrength || PasswordStrengthEnum.None;
        
        // check strength of the password
        const result = zxcvbn(password);
        console.log('minStrength', minStrength);
        // Check if is strong based on configuration
        return result.score >= minStrength;
    }
}
