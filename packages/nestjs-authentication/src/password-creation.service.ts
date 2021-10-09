import { Inject, Injectable } from '@nestjs/common';
import { PasswordStrengthService } from '.';

/**
 * 
 */
@Injectable()
export class PasswordCreationService {

    /**
     * 
     * @param passwordStrengthService 
     */
    constructor(
        @Inject()
        private passwordStrengthService: PasswordStrengthService) {
        
    }

    /**
     * 
     * @param password 
     * @returns 
     */
    isStrong(password: string) : boolean {
        return this.passwordStrengthService.isStrong(password);
    }
}
