import { Controller, Inject } from '@nestjs/common';
import { SignDTOInterface } from './interface/signin.dto.interface';
import { SignService } from './services/sign.service';

/**
 * Sign controller
 */
@Controller('sign')
export class SignController {
    constructor(
        @Inject()
        private signService: SignService
    ) {

    }

    /**
     * Method to authenticate user and return access token
     * @param dto
     * @returns 
     */
    async authenticate(dto: SignDTOInterface): Promise<string> {
        const isAuth = this.signService.authenticate(dto);
        if (isAuth)
            return await this.signService.retrieveAccessToken(dto);
        
        return "";
    }

    /**
     * Method to refresh access token
     * @param dto 
     * @returns 
     */
    async refreshToken(dto: SignDTOInterface): Promise<string> {
        return await this.signService.refreshAccessToken(dto);
    }
}
