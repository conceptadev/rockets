import { PasswordValidationServiceInterface } from '@concepta/nestjs-password';
import { AuthLocalValidateUserService } from './auth-local-validate-user.service';
import { AuthLocalUserLookupServiceInterface } from '../interfaces/auth-local-user-lookup-service.interface';
import { AuthLocalValidateUserInterface } from '../interfaces/auth-local-validate-user.interface';
import { AuthLocalSettingsInterface } from '../interfaces/auth-local-settings.interface';

describe(AuthLocalValidateUserService.name, () => {
  const USERNAME = 'test';
  const PASSWORD = 'test';

  let service: AuthLocalValidateUserService;
  let userLookupService: AuthLocalUserLookupServiceInterface;
  let passwordValidationService: PasswordValidationServiceInterface;

  beforeEach(() => {
    userLookupService = {
      byUsername: jest.fn(),
    } as unknown as AuthLocalUserLookupServiceInterface;

    passwordValidationService = {
      validateObject: jest.fn(),
    } as unknown as PasswordValidationServiceInterface;

    const settings: AuthLocalSettingsInterface = {
      maxAttempts: 10,
      minAttempts: 3,
    };
    service = new AuthLocalValidateUserService(
      userLookupService,
      passwordValidationService,
      settings,
    );
  });

  describe('validateUser', () => {
    const USER = {
      active: false,
      id: 'uuid',
      username: 'username',
      password: 'password',
      passwordHash: 'hash',
      passwordSalt: 'salt',
      lastLogin: new Date(),
      loginAttempts: 0,
    };
    it('should throw an error if no user is found for the given username', async () => {
      jest.spyOn(userLookupService, 'byUsername').mockResolvedValue(null);

      const t = () =>
        service.validateUser({
          username: USERNAME,
          password: PASSWORD,
        } as AuthLocalValidateUserInterface);
      await expect(t).rejects.toThrowError(
        `No user found for username: ${USERNAME}`,
      );
    });

    it('should throw an error if the user is inactive', async () => {
      jest.spyOn(userLookupService, 'byUsername').mockResolvedValue(USER);
      jest.spyOn(service, 'isActive').mockResolvedValue(false);

      const t = () =>
        service.validateUser({
          username: USERNAME,
          password: PASSWORD,
        } as AuthLocalValidateUserInterface);
      await expect(t).rejects.toThrowError(
        `User with username '${USERNAME}' is inactive`,
      );
    });

    it('should throw an error if the password is invalid', async () => {
      jest.spyOn(userLookupService, 'byUsername').mockResolvedValue(USER);
      jest.spyOn(service, 'isActive').mockResolvedValue(true);
      jest
        .spyOn(passwordValidationService, 'validateObject')
        .mockResolvedValue(false);

      const t = () =>
        service.validateUser({
          username: USER.username,
          password: USER.password,
        } as AuthLocalValidateUserInterface);
      await expect(t).rejects.toThrowError(
        `Invalid password for username: ${USER.username}`,
      );
    });

    it('should return the user if the user is found, active, and the password is valid', async () => {
      jest.spyOn(userLookupService, 'byUsername').mockResolvedValue(USER);
      jest.spyOn(service, 'isActive').mockResolvedValue(true);
      jest
        .spyOn(passwordValidationService, 'validateObject')
        .mockResolvedValue(true);

      const result = await service.validateUser({
        username: USER.username,
        password: USER.password,
      } as AuthLocalValidateUserInterface);

      expect(result).toEqual(USER);
    });
  });
});
