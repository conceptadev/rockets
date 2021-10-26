import { Controller } from '@nestjs/common';
import { AccessTokenInterface } from './interface/dto/access-token.interface';
import { AuthenticationResponseInterface } from './interface/dto/authentication-response.interface';
import { SignDTOInterface } from './interface/dto/signin.dto.interface';
import { SignService } from './services/sign.service';

/**
 * Sign controller
 */
@Controller('sign')
export class SignController {

    /**
     * Constructor
     * @param signService 
     */
    constructor(
        private signService: SignService
    ) { }

    /**
     * Method to authenticate user and return access token
     * @param dto
     * @returns 
     */
    async authenticate(dto: SignDTOInterface): Promise<AuthenticationResponseInterface> {
        return this.signService.authenticate(dto);
    }

    /**
     * Method to refresh access token
     * @param dto 
     * @returns 
     */
    async refreshToken(accessToken: string): Promise<AccessTokenInterface> {
        return this.signService.refreshAccessToken(accessToken);
    }
}
