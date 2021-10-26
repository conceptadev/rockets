import { mock } from 'jest-mock-extended';

import { AuthenticationException } from '../exceptions/authentication.exception';
import { AccessTokenInterface } from '../interface/dto/access-token.interface';
import { CredentialLookupInterface } from '../interface/dto/credential-lookup.interface';
import { SignDTOInterface } from '../interface/dto/signin.dto.interface';
import {
    CredentialLookupServiceInterface
} from '../interface/service/credential-lookup.service.interface';
import { PasswordStorageService } from './password-storage.service';
import { SignService } from './sign.service';

describe('SignServiceService', () => {
  let service: SignService;
  let passwordStorageService: PasswordStorageService;
  let credentialLookupServiceInterface: CredentialLookupServiceInterface;
  
  let spyValidatePassword: jest.SpyInstance;
  let spyGetUser: jest.SpyInstance;
  let spyRetrieveToken: jest.SpyInstance;
  let spyRefreshToken: jest.SpyInstance;
  
  let credentialsLookup: CredentialLookupInterface = {
    username: 'username',
    password: 'password',
    accessToken: 'accessToken',
    expireIn: new Date(),
    salt: 'salt',
  };;

  const signInDto: SignDTOInterface = {
    username: 'username',
    password: 'password'
  };

  beforeEach(async () => {

    passwordStorageService = mock<PasswordStorageService>();
    credentialLookupServiceInterface = mock<CredentialLookupServiceInterface>();
    
    spyValidatePassword = jest.spyOn(passwordStorageService, "validatePassword").mockResolvedValue(true);
    spyRefreshToken     = jest.spyOn(credentialLookupServiceInterface, "refreshToken");
    
    service = new SignService(passwordStorageService, credentialLookupServiceInterface);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('PasswordCreationService.authenticate', async () => {
    spyGetUser = jest.spyOn(credentialLookupServiceInterface, "getUser").mockResolvedValueOnce(credentialsLookup);
    
    const result = await service.authenticate(signInDto);
    
    expect(result.accessToken).toBe(credentialsLookup.accessToken);
  });

  it('PasswordCreationService.authenticateException', async () => {
    spyGetUser = jest.spyOn(credentialLookupServiceInterface, "getUser").mockResolvedValueOnce(null);
    try {
      await service.authenticate(signInDto)
    } catch (err) {
      expect(err).toBeInstanceOf(AuthenticationException);
      return;
    }
    fail();
  });

  it('PasswordCreationService.authenticateExceptionInvalid', async () => {
    jest.spyOn(credentialLookupServiceInterface, "getUser").mockResolvedValueOnce(credentialsLookup);
    jest.spyOn(passwordStorageService, "validatePassword").mockResolvedValueOnce(false);
    
    try {
      await service.authenticate(signInDto)
    } catch (err) {
      expect(err).toBeInstanceOf(AuthenticationException);
      return;
    }
    fail();
  });

  it('PasswordCreationService.retrieveAccessToken', async () => {
    
    spyGetUser = jest.spyOn(credentialLookupServiceInterface, "getUser").mockResolvedValueOnce(credentialsLookup);
    spyRetrieveToken = jest.spyOn(credentialLookupServiceInterface, "getAccessToken").mockResolvedValueOnce({
      accessToken: credentialsLookup.accessToken
    } as AccessTokenInterface);
    
    const result = await service.retrieveAccessToken(signInDto);
    
    expect(spyGetUser).toBeCalled();
    expect(spyRetrieveToken).toBeCalledWith(credentialsLookup.username);

  });

  it('PasswordCreationService.retrieveAccessToken', async () => {
    
    spyGetUser = jest.spyOn(credentialLookupServiceInterface, "getUser").mockResolvedValueOnce(credentialsLookup);
    spyRetrieveToken = jest.spyOn(credentialLookupServiceInterface, "refreshToken").mockResolvedValueOnce({
      accessToken: credentialsLookup.accessToken
    } as AccessTokenInterface);
    
    const result = await service.refreshAccessToken(signInDto);
    
    expect(spyGetUser).toBeCalled();
    expect(spyRetrieveToken).toBeCalledWith(credentialsLookup.username);

  });
});
