import { Inject, Injectable } from '@nestjs/common';
import { AccessTokenInterface } from '../interface/dto/access-token.interface';
import { SignServiceInterface } from '../interface/service/sign.service.interface';
import { SignDTOInterface } from '../interface/dto/signin.dto.interface';
import { CredentialLookupServiceInterface } from '../interface/service/credential-lookup.service.interface';
import { AuthenticationException } from '../exceptions/authentication.exception';
import { CredentialLookupInterface } from '../interface/dto/credential-lookup.interface';
import { PasswordStorageService } from './password-storage.service';
import { CREDENTIAL_LOOKUP_SERVICE_TOKEN } from '../config/authentication.config';
import { AuthenticationResponseInterface } from '../interface/dto/authentication-response.interface';

/**
 * Service with functions related to the sign in
 * This should be used to authenticate user a user
 */
@Injectable()
export class SignService implements SignServiceInterface {
  /**
   * constructor
   */
  constructor(
    private passwordStorageService: PasswordStorageService,
    @Inject(CREDENTIAL_LOOKUP_SERVICE_TOKEN)
    private credentialLookupServiceInterface: CredentialLookupServiceInterface,
  ) {}

  /**
   * Get user form an service that implements interface and return if password os validated
   * @param dto
   * @returns
   */
  private async getCredentialsInformation(
    dto: SignDTOInterface,
  ): Promise<CredentialLookupInterface> {
    // Get user information with encrypt password and salt
    const credentialsLookup =
      await this.credentialLookupServiceInterface.getUser(dto.username);

    if (!credentialsLookup) throw new AuthenticationException();

    return credentialsLookup;
  }

  /**
   * Check if password is valid
   * @param passwordPlain Password not encrypted
   * @param passwordCrypt Password Encrypted
   * @param salt "Salt to decrypt password"
   * @returns
   */
  private async validatePassword(
    passwordPlain: string,
    passwordCrypt: string,
    salt: string,
  ): Promise<boolean> {
    // validate password
    const isValid = await this.passwordStorageService.validatePassword(
      passwordPlain,
      passwordCrypt,
      salt,
    );

    if (!isValid) throw new AuthenticationException();

    return isValid;
  }

  /**
   * Issue the access token based on credential information
   * @param credentialLookup Object with user information
   * @returns
   */
  private async issueAccessToken(
    credentialLookup: CredentialLookupInterface,
  ): Promise<AuthenticationResponseInterface> {
    // Issue a access token for the authenticated user
    const accessToken =
      await this.credentialLookupServiceInterface.issueAccessToken(
        credentialLookup.username,
      );

    if (!accessToken)
      throw new AuthenticationException('Error on access token.');

    return {
      id: credentialLookup.id,
      username: credentialLookup.username,
      accessToken: accessToken.accessToken,
      expireIn: accessToken.expireIn,
    } as AuthenticationResponseInterface;
  }

  /**
   * Authenticate user and return access token information
   * @param dto
   * @returns Promise<AccessTokenInterface>
   */
  async authenticate(
    dto: SignDTOInterface,
  ): Promise<AuthenticationResponseInterface> {
    // Get user information
    const credentialsLookup = await this.getCredentialsInformation(dto);

    // validate password or throw an error and error if not valid
    await this.validatePassword(
      dto.password,
      credentialsLookup.password,
      credentialsLookup.salt,
    );

    // Issue a access token for the authenticated user
    return await this.issueAccessToken(credentialsLookup);
  }

  /**
   * Refresh and return new access token
   * @param dto username and password
   * @returns access token interface
   */
  async refreshAccessToken(accessToken: string): Promise<AccessTokenInterface> {
    return await this.credentialLookupServiceInterface.refreshToken(
      accessToken,
    );
  }
}
