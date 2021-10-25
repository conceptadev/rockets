import { Controller } from '@nestjs/common';
import { AccessTokenInterface } from './interface/dto/access-token.interface';
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
    async authenticate(dto: SignDTOInterface): Promise<AccessTokenInterface> {
        return await this.signService.authenticate(dto);
    }

    /**
     * Method to refresh access token
     * @param dto 
     * @returns 
     */
    async refreshToken(dto: SignDTOInterface): Promise<AccessTokenInterface> {
        return await this.signService.refreshAccessToken(dto);
    }
}
