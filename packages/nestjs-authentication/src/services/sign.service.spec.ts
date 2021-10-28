import { mock } from 'jest-mock-extended';

import { AuthenticationException } from '../exceptions/authentication.exception';
import { AccessTokenInterface } from '../interface/dto/access-token.interface';
import { CredentialLookupInterface } from '../interface/dto/credential-lookup.interface';
import { SignDTOInterface } from '../interface/dto/signin.dto.interface';
import { CredentialLookupServiceInterface } from '../interface/service/credential-lookup.service.interface';
import { PasswordStorageService } from './password-storage.service';
import { SignService } from './sign.service';

describe('SignServiceService', () => {
  let service: SignService;
  let passwordStorageService: PasswordStorageService;
  let credentialLookupServiceInterface: CredentialLookupServiceInterface;

  let spyRetrieveToken: jest.SpyInstance;

  const ACCESS_TOKEN = 'accessToken';

  const accessToken: AccessTokenInterface = {
    accessToken: ACCESS_TOKEN,
    expireIn: new Date(),
  };

  const credentialsLookup: CredentialLookupInterface = {
    id: '1',
    username: 'username',
    password: 'password',
    salt: 'salt',
  };

  const signInDto: SignDTOInterface = {
    username: 'username',
    password: 'password',
  };

  beforeEach(async () => {
    passwordStorageService = mock<PasswordStorageService>();
    credentialLookupServiceInterface = mock<CredentialLookupServiceInterface>();

    service = new SignService(
      passwordStorageService,
      credentialLookupServiceInterface,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('PasswordCreationService.authenticate', async () => {
    jest
      .spyOn(credentialLookupServiceInterface, 'getUser')
      .mockResolvedValueOnce(credentialsLookup);

    jest
      .spyOn(credentialLookupServiceInterface, 'issueAccessToken')
      .mockResolvedValueOnce(accessToken);

    jest
      .spyOn(passwordStorageService, 'validatePassword')
      .mockResolvedValueOnce(true);

    const result = await service.authenticate(signInDto);

    expect(result.accessToken).toBe(ACCESS_TOKEN);
  });

  it('PasswordCreationService.authenticateException_fail', async () => {
    jest
      .spyOn(credentialLookupServiceInterface, 'getUser')
      .mockResolvedValueOnce(credentialsLookup);
    jest
      .spyOn(credentialLookupServiceInterface, 'issueAccessToken')
      .mockResolvedValueOnce(null);

    try {
      await service.authenticate(signInDto);
    } catch (err) {
      expect(err).toBeInstanceOf(AuthenticationException);
      return;
    }
    fail();
  });

  it('PasswordCreationService.authenticateException', async () => {
    jest
      .spyOn(credentialLookupServiceInterface, 'getUser')
      .mockResolvedValueOnce(null);
    try {
      await service.authenticate(signInDto);
    } catch (err) {
      expect(err).toBeInstanceOf(AuthenticationException);
      return;
    }
    fail();
  });

  it('PasswordCreationService.authenticateExceptionInvalid', async () => {
    jest
      .spyOn(credentialLookupServiceInterface, 'getUser')
      .mockResolvedValueOnce(credentialsLookup);
    jest
      .spyOn(passwordStorageService, 'validatePassword')
      .mockResolvedValueOnce(false);

    try {
      await service.authenticate(signInDto);
    } catch (err) {
      expect(err).toBeInstanceOf(AuthenticationException);
      return;
    }
    fail();
  });

  it('PasswordCreationService.issueAccessToken', async () => {
    jest
      .spyOn(credentialLookupServiceInterface, 'getUser')
      .mockResolvedValueOnce(credentialsLookup);
    const spyIssueAccessToken = jest
      .spyOn(credentialLookupServiceInterface, 'issueAccessToken')
      .mockResolvedValueOnce({
        accessToken: ACCESS_TOKEN,
      } as AccessTokenInterface);

    await service['issueAccessToken'](credentialsLookup);

    expect(spyIssueAccessToken).toBeCalledWith(credentialsLookup.username);
  });

  it('PasswordCreationService.retrieveAccessToken', async () => {
    spyRetrieveToken = jest
      .spyOn(credentialLookupServiceInterface, 'refreshToken')
      .mockResolvedValueOnce({
        accessToken: ACCESS_TOKEN,
      } as AccessTokenInterface);

    await service.refreshAccessToken(ACCESS_TOKEN);

    expect(spyRetrieveToken).toBeCalledWith(ACCESS_TOKEN);
  });
});
