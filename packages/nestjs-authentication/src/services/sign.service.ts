import { Inject, Injectable } from '@nestjs/common';
import { AccessTokenInterface } from '../interface/dto/access-token.interface';
import { SignServiceInterface } from '../interface/service/sign.service.interface';
import { SignDTOInterface } from '../interface/dto/signin.dto.interface';
import { CredentialLookupServiceInterface } from '../interface/service/credential-lookup.service.interface';
import { AuthenticationException } from '../exceptions/authentication.exception';
import { CredentialLookupInterface } from '../interface/dto/credential-lookup.interface';
import { PasswordStorageService } from './password-storage.service';
import { CREDENTIAL_LOOKUP_SERVICE_TOKEN } from '../config/authentication.config';

/**
 * Service with functions related to the sign in
 */
@Injectable()
export class SignService implements SignServiceInterface {

    /**
     * constructor
     */
    constructor(
        private passwordStorageService: PasswordStorageService,
        @Inject(CREDENTIAL_LOOKUP_SERVICE_TOKEN)
        private credentialLookupServiceInterface: CredentialLookupServiceInterface
    ) { }
 
    /**
     * Get user form an service that implements interface and return if password os validated 
     * @param dto 
     * @returns 
     */
    private async getUser(dto: SignDTOInterface):Promise<CredentialLookupInterface> {
        
        const credentialsLookup = await this.credentialLookupServiceInterface.getUser(dto.username);
        
        if (!credentialsLookup)
            throw new AuthenticationException();
        
        const isValid = await this.passwordStorageService.validatePassword(dto.password, credentialsLookup.password, credentialsLookup.salt);
        
        if (!isValid)
            throw new AuthenticationException();
        
        return credentialsLookup;
    }

    /**
     * Authenticate user and return access token information
     * @param dto 
     * @returns Promise<AccessTokenInterface> 
     */
    async authenticate(dto: SignDTOInterface): Promise<AccessTokenInterface> {
        
        const credentialsLookup = await this.getUser(dto);
        
        return {
            accessToken: credentialsLookup.accessToken,
            expireIn: credentialsLookup.expireIn
        } as AccessTokenInterface;
    }

    /**
     * Get the access token based on username and password
     * @param dto dto with username and password
     * @returns Access Token 
     */
    async retrieveAccessToken(dto: SignDTOInterface): Promise<AccessTokenInterface> {
        
        //TODO: Check if there is a better way to get access token
        // credentialsLookup.accessToken maybe
        const credentialsLookup = await this.getUser(dto);

        return await this.credentialLookupServiceInterface.getAccessToken(credentialsLookup.username);
    }

    /**
     * Refresh and return new access token
     * @param dto username and password
     * @returns access token interface
     */
    async refreshAccessToken(dto: SignDTOInterface): Promise<AccessTokenInterface> {
        
        const credentialsLookup = await this.getUser(dto);

        return await this.credentialLookupServiceInterface.refreshToken(credentialsLookup.username);
    }

}
